function readLines(file) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: fs.createReadStream('broadband.sql'),
            crlfDelay: Infinity
        })
        rl.on('line', (line) => {
            lines.push(line)
        })
        rl.on('close', resolve)
    })
}

export {
    readLines
}