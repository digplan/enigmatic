export default debug = (r, s, data) => {
    console.log(`${r.url} ${r.method} ${JSON.stringify(data)}`)
}