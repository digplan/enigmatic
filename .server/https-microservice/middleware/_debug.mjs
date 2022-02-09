export default function _debug(r, s, data) {
    console.log(`Headers: ${JSON.stringify(r.headers, null, 2)}`, `Method: ${r.method}`, `URL: ${r.url}`, `Data: ${JSON.stringify(data, null, 2)}`)
}