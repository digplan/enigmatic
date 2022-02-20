const views = {
    selectFromTable: (t) => {
        return ([k, v]) => k.match(`^${t}:`)
    }
}
export default views