import XboxApiClient from 'xbox-webapi'
import { TRPCError } from '@trpc/server'
import { WebToken } from '../types/webtoken.js'
import {
	getTitlesToScanForAchievements,
	mergeRecentAchievements,
	type AchievementEntry,
	type AchievementTitleSummary,
	toRecentAchievementSummary
} from '../lib/profile-recent-achievements.js'
import {
	chunkTitleIds,
	extractProfileSettings,
	parseUserstatsResponse,
	sortTitlesByLastPlayed,
	type TitleHistoryTitle,
	toPlayedGameSummary
} from '../lib/profile-played-games.js'

type XboxApiClientInstance = {
	providers: {
		profile: {
			getCurrentUser: () => Promise<{
				data: {
					profileUsers?: Array<{
						id: string
						settings?: Array<{ id?: string; value?: string }>
					}>
				}
			}>
		}
		titlehub: {
			getTitleHistory: (
				xuid: string
			) => Promise<{ data: { titles?: TitleHistoryTitle[] } }>
		}
		userstats: {
			getUserTitleStats: (
				xuid: string,
				titleId: string
			) => Promise<{
				data: {
					statlistscollection?: Array<{
						titleid?: string;
						titleId?: string;
						name?: string;
						value?: string;
					}>;
					groups?: Array<{
						titleid?: string;
						titleId?: string;
						statlistscollection?: Array<{
							stats?: Array<{
								titleid?: string;
								titleId?: string;
								name?: string;
								value?: string;
							}>;
						}>;
					}>;
				}
			}>
		}
		achievements: {
			getAchievements: (
				xuid: string,
				continuationToken?: string,
				maxItems?: number
			) => Promise<{ data: { titles?: AchievementTitleSummary[] } }>
			getTitleId: (
				xuid: string,
				titleId: string,
				continuationToken?: string,
				maxItems?: number
			) => Promise<{ data: { achievements?: AchievementEntry[] } }>
		}
		people: {
			getFriends: () => Promise<unknown>
		}
	}
}

export default class profileController {
	private createClient(token: WebToken): XboxApiClientInstance {
		if (token.uhs === '' || token.token === '') {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: '(WebApi) No token or uhs provided'
			})
		}

		return new ((XboxApiClient as any) as { default: new (config: WebToken) => XboxApiClientInstance })
			.default({
			uhs: token.uhs,
			token: token.token
		})
	}

	async getCurrentProfile(token: WebToken) {
		return await this.createClient(token).providers.profile.getCurrentUser()
	}

	async getFriendsList(token: WebToken) {
		return await this.createClient(token).providers.people.getFriends()
	}

	async getPlayedGames(token: WebToken, limit = 40, achievementLimit = 24) {
		const client = this.createClient(token)
		const profileResponse = await client.providers.profile.getCurrentUser()
		const profileUser = profileResponse.data.profileUsers?.[0]

		if (!profileUser?.id) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Unable to resolve Xbox profile'
			})
		}

		const xuid = profileUser.id
		const profile = extractProfileSettings(profileUser.settings)
		const historyResponse = await client.providers.titlehub.getTitleHistory(xuid)
		const sorted = sortTitlesByLastPlayed(historyResponse.data.titles ?? []).slice(0, limit)
		const [minutesByTitle, recentAchievements] = await Promise.all([
			this.fetchMinutesPlayedForTitles(
				client,
				xuid,
				sorted.map((title) => title.titleId)
			),
			this.fetchRecentAchievements(client, xuid, achievementLimit)
		])

		return {
			xuid,
			profile,
			games: sorted.map((title) =>
				toPlayedGameSummary(title, minutesByTitle.get(title.titleId) ?? null)
			),
			recentAchievements
		}
	}

	private async fetchRecentAchievements(
		client: XboxApiClientInstance,
		xuid: string,
		limit: number
	) {
		try {
			const historyResponse = await client.providers.achievements.getAchievements(
				xuid,
				undefined,
				100
			)
			const titlesToScan = getTitlesToScanForAchievements(historyResponse.data.titles ?? [])
			const collected: ReturnType<typeof toRecentAchievementSummary>[] = []

			for (const chunk of chunkTitleIds(
				titlesToScan.map((title) => String(title.titleId)),
				3
			)) {
				const results = await Promise.allSettled(
					chunk.map(async (titleId) => {
						const title = titlesToScan.find((entry) => String(entry.titleId) === titleId)
						const response = await client.providers.achievements.getTitleId(
							xuid,
							titleId,
							undefined,
							200
						)

						return (response.data.achievements ?? [])
							.map((achievement) =>
								toRecentAchievementSummary(
									achievement,
									title?.name || titleId,
									titleId
								)
							)
							.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
					})
				)

				for (const result of results) {
					if (result.status !== 'fulfilled') continue;
					collected.push(...result.value)
				}
			}

			return mergeRecentAchievements(
				collected.filter((entry): entry is NonNullable<typeof entry> => entry !== null),
				limit
			)
		} catch {
			return []
		}
	}

	private async fetchMinutesPlayedForTitles(
		client: XboxApiClientInstance,
		xuid: string,
		titleIds: string[]
	): Promise<Map<string, number>> {
		const minutesByTitle = new Map<string, number>()

		for (const chunk of chunkTitleIds(titleIds, 5)) {
			const results = await Promise.allSettled(
				chunk.map(async (titleId) => {
					const response = await client.providers.userstats.getUserTitleStats(xuid, titleId)
					return parseUserstatsResponse(response.data)
				})
			)

			for (const result of results) {
				if (result.status !== 'fulfilled') continue;
				for (const [titleId, minutes] of result.value) {
					minutesByTitle.set(titleId, minutes)
				}
			}
		}

		return minutesByTitle
	}
}
