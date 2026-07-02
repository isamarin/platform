/**
 * Cloudflare Workers entry for tRPC.
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { appRouter } from './index';

export default class TRPCCloudflareWorkerExample extends WorkerEntrypoint {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({}),
    });
  }
}
