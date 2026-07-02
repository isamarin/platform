import { TokenStore } from 'xal-node'
import UserToken from 'xal-node/dist/lib/tokens/usertoken.js'
import { IUserToken } from 'xal-node/dist/lib/tokens/usertoken.js' 
export default class ProxyStore extends TokenStore {

    constructor(token?: IUserToken) {
        super()
        
        if(token !== undefined)
            this._userToken = new ((UserToken as any).default || UserToken)(token)
    }
 
    load() {
        return true
    }
 
    save() {
    }
 
    clear() {
        this._userToken = undefined
        this._sisuToken = undefined
        this._jwtKeys = undefined
    }

    removeAll() {
        this._userToken = undefined
        this._sisuToken = undefined
        this._jwtKeys = undefined
    }
}
