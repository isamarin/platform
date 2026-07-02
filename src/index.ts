import { appRouter as trpcAppRouter, createCallerFactory as trpcCreateCallerFactory } from './trpc.js'

export default class BlacklightPlatform {
    appRouter:typeof trpcAppRouter = trpcAppRouter
}

export const appRouter = trpcAppRouter
export const createCallerFactory = trpcCreateCallerFactory
