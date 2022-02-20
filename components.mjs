export default {
    'hello-world': {
        style: 'color: red',
        template: 'Hello World'
    },
    'random-users': {
        template: 'Hello Random user: {results[0].name.first} {results[0].name.last}',
        onMount: e => console.log('Mounted', e.tagName, e.props),
        beforeData: x => x.results[0].name.first = 'John'
    },
    'tailwind-example': {
        template: '<div class="bg-blue-500 text-white font-bold py-2 px-4 rounded">Hello World</div>',
        onMount: e => loadCSS('https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css')
    }
}