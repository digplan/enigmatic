window.components = {
    'hello-world': {
        style: 'color: red',
        onMount: async x => console.log('mounted h-w'),
        template: 'Hello World'
    },
    'random-users': {
        template: 'Hello Random user: {results[0].name.first} {results[0].name.last}',
        onMount: e => console.log('Mounted', e.tagName, e.props),
        beforeData: x => x.results[0].name.first = 'John'
    },
    'tailwind-example': {
        template: '<div class="bg-blue-300 text-white font-bold py-2 px-4 rounded">I am Tailwind</div>',
        onMount: async e => await loadCSS('https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css')
    }
}