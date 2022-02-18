export default {
    'data-source': {
        props: 'fetch, immediate',
        style: '',
        template: 'Hello {results[0].name} !',
        main(props) {
            if(props.immediate)
                this.fetch()
        }
    },
    'data-viewer': {
        props: 'data',
        style: '',
        template: 'Hello {results[0].name} !'
    },
    'random-users': {
        props: 'fetch, immediate',
        extends: 'data-source',
        template: 'Hello Random user: {results[0].name} !',
    }
}

/*

<data-source fetch="https://randomuser.me/api/?results=10" immediate></data-source>
<data-viewer data="data-source"></data-viewer>

<random-users fetch="https://randomuser.me/api/?results=10" immediate></random-users>

*/