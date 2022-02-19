export default views = {
    selectFromTable: (t) => {
        return ([k, v]) => k.match(`^${t}:`)
    }
}