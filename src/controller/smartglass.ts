import XboxApiClient from 'xbox-webapi'
import { WebToken } from '../types/webtoken'
import { TRPCError } from '@trpc/server'

export default class smartglassController {

    async getConsolesList(token:WebToken) {
        if(token.uhs === '' || token.token === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(WebApi) No token or uhs provided',
            });
        }

        const apiClient = new ((XboxApiClient as any) as { default: typeof XboxApiClient }).default({
            uhs: token.uhs,
            token: token.token
        })

        return await apiClient.providers['smartglass'].getConsolesList()
    }

    async powerOn(token: WebToken, consoleId: string) {
        if(token.uhs === '' || token.token === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(WebApi) No token or uhs provided',
            });
        }

        const apiClient = new ((XboxApiClient as any) as { default: typeof XboxApiClient }).default({
            uhs: token.uhs,
            token: token.token
        })

        return await apiClient.providers['smartglass'].powerOn(consoleId)
    }
}
