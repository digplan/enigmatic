export default {
    'hello-world': {
        props: 'name',
        style: 'color: red',
        template: 'Hello World',
        onMount: x => console.log(x),
        beforeData: x => x.name += '!!!!!'
    },
    'random-users': {
        template: 'Hello Random user: {results[0].name} !',
    }
}

/*

<data-source fetch="https://randomuser.me/api/?results=10" immediate></data-source>
<data-viewer data="data-source"></data-viewer>

<random-users fetch="https://randomuser.me/api/?results=10" immediate></random-users>

*/