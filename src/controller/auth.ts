import type { IUserToken } from 'xal-node/dist/lib/tokens/usertoken.js'
import { createMsal } from '../utils/msal.js'

export default class authController {

    async startMsalAuth(forceRegionIp?: string) {
        const msal = createMsal(undefined, forceRegionIp)
        return await msal.doDeviceCodeAuth()
    }

    async verifyDeviceCode(devicecode: string, timeout?: number, forceRegionIp?: string) {
        const msal = createMsal(undefined, forceRegionIp)
        return await msal.doPollForDeviceCodeAuth(devicecode, timeout)
    }

    async refreshUserToken(token: IUserToken, forceRegionIp?: string) {
        const msal = createMsal(token, forceRegionIp)
        return await msal.refreshUserToken()
    }

    async getStreamingTokens(token: IUserToken, forceRegionIp?: string) {
        const msal = createMsal(token, forceRegionIp)

        const gssvToken = await msal.getGssvToken()

        if(gssvToken === undefined){
            throw new Error('No gssv token found. Please authenticate first.')
        }

        const _xhomeToken = await msal.getStreamToken(gssvToken.data.Token, 'xhome')

        let _xcloudToken:typeof _xhomeToken|undefined
        try {
            _xcloudToken = await msal.getStreamToken(gssvToken.data.Token, 'xgpuweb')
        } catch(error){
            try {
                _xcloudToken = await msal.getStreamToken(gssvToken.data.Token, 'xgpuwebf2p')
            }
            catch(error){
                console.log('Failed to retrieve xCloud token. (Also F2P. Cloud gaming down?)')
            }
        }

        return { xHomeToken: _xhomeToken, xCloudToken: _xcloudToken }
    }

    async getWebToken(token: IUserToken, forceRegionIp?: string) {
        const msal = createMsal(token, forceRegionIp)
        return await msal.getWebToken()
    }
}
