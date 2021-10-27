let server = null, token = ''

async function db(url, user, pass, stayLoggedIn) {
    return new Promise((resolve, reject) => {
        server = new WebSocket(url)
        server.onopen = () => {
            let token = send(`null TOKENS POST {'user': ${user}, 'pass': ${pass}}`)
            resolve(token)
        }
    })
}

async function send(data) {
    return new Promise((resolve, reject) => {
        server.onmessage = (resp) => {
            if(resp.data.match(/^ERROR/))
              throw Error(resp.data)
            resolve(resp.data)
        }
        server.send(data)
    })
}

let login = await db('wss://echo.websocket.org', 'myuser', 'mypass')
let ret = await send('Hey')

console.log(JSON.stringify(login), ret)