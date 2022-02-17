export default {
    'data-source': {
        props: 'fetch, immediate',
        template: 'Hello {results[0].name} !',
        main(props) {
            if(props.immediate)
                this.fetch()
        },
        fetch: function(url) {
            const json = await(await fetch(url)).json()
            state['data-source'] = json
        }
    },
    'data-viewer': {
        props: 'data',
        template: 'Hello {results[0].name} !',
        set: function(data) {
            if (!Array.isArray(data)) data = [data]
            const f = new Function('o', 'return `' + this.template + '`')
            this.innerHTML = o[arr].forEach((i) => {
                this.innerHTML += f(i)
            })
        }
    },
    'random-users': {
        props: 'fetch, immediate',
        extends: 'data-source',
        template: 'Hello Random user: {results[0].name} !',
    }
}