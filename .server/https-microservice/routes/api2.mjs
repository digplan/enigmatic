import { Route } from '../https-microservice.mjs' 

export default class api2 extends Route {
    get(r, s, data) {
        return s.endJSON({
            message: 'GET defined as a class',
        })
    }
    post(r, s, data) {
        s.end('POST defined as a class')
    }
}