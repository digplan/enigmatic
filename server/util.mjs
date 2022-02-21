import fs from 'node:fs'
export default {
    readJSON: (filename) => {
        return JSON.parse(fs.readFileSync(filename, 'utf8'))
    },
    writeJSON: (filename, data) => {
        return writeFile(filename, JSON.stringify(data, null, 2), 'utf8')
    },
    writeMap: (map, filename) => {
        fs.writeFileSync(filename, Array.from(map.entries()))
    },
    readMap: (filename, map) => {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'))
        return data.reduce((m, [k, v]) => m.set(k, v), map)
    },
    loadModules: async (dirname) => {
        if (!fs.existsSync(dirname)) return
        const obj = {}
        for (const f of readdirSync(dirname)) {
            if (!f.endsWith('.mjs')) continue
            const name = f.split('.')[0]
            obj[name] = (await import(`${dirname}/${f}`)).default
        }
        return obj
    },
    parseHttpBasic: (r) => {
        if (!r.headers.Authorization) return false
        const [type, userpass] = r.headers.Authorization.split(' ')
        return Buffer.from(userpass, 'base64').toString('ascii').split(':')
    }, 
    hash: (str) => {
        return crypto.createHash('sha256').update(str).digest('hex')
    }, 
    __dirname: () => {
        return new URL(filename, import.meta.url).pathname.slice(1)
    },
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    stats: process.report.getReport,
    time: {
        seconds: (sec) => sec * 1000,
        minutes: (min) => min * 60 * 1000,
        hours: (hour) => hour * 60 * 60 * 1000,
        days: (day) => day * 24 * 60 * 60 * 1000,
        weeks: (week) => week * 7 * 24 * 60 * 60 * 1000,
        months: (month) => month * 30 * 24 * 60 * 60 * 1000,
        years: (year) => year * 365 * 24 * 60 * 60 * 1000,
        ago_text: (iso) => {
            const agoms = (new Date.now() - ms) - new Date(iso)
            if (agoms < seconds(30)) return 'just now'
            if (agoms < minutes(1)) return `${Math.floor(agoms / seconds(1))} seconds ago`
            if (agoms < hours(1)) return `${Math.floor(agoms / minutes(1))} minutes ago`
            if (agoms < days(1)) return `${Math.floor(agoms / hours(1))} hours ago`
            if (agoms < weeks(1)) return `${Math.floor(agoms / days(1))} days ago`
            if (agoms < months(1)) return `${Math.floor(agoms / weeks(1))} weeks ago`
            if (agoms < years(1)) return `${Math.floor(agoms / months(1))} months ago`
            if (agoms < years(2)) return `${Math.floor(agoms / years(1))} year ago`
            return `${Math.floor(agoms / years(2))} years ago`
        }
    },
    replaceChars: (s) => {
        s = s.replaceAll('=', '');
        s = s.replaceAll('+', '-');
        s = s.replaceAll('/', '_');
        return s;
    },
    createJWT: (keystring, user ) => {
        payload = {user: user, exp: new Date(new Date().getDay() + 7).toISOString()}
        const alg = '{"typ":"JWT","alg":"HS256"}';
        const header = this.replaceChars(Buffer.from(alg).toString('base64'));
        payload = this.replaceChars(Buffer.from(JSON.stringify(payload)).toString('base64'));
        const signature = this.signJWT(header, payload);
        return `${header}.${payload}.${signature}`;
    },
    signJWT: (keystring, header, payload)=> {
        let signature = crypto.createHmac('sha256', keystring);
        return replaceChars(
            (signature.update(`${header}.${payload}`), signature.digest('base64'))
        );
    },
    verifyJWT: (keystring, jwt)=> {
        const [header, payload, signature] = jwt.split('.');
        return this.signJWT(keystring, header, payload) === signature ? Buffer.from(payload, 'base64').toString('utf-8') : false;
    },
    authJWT: (r)=> {
        const {Authorization} = r.headers
        if (!Authorization) return false
        const [type, jwt] = Authorization.split(' ')
        if (type !== 'Bearer') return false
        const payload = this.verifyJWT(jwt)
        if (!payload) return false
        return payload.user
    }
}