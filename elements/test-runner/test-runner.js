class TestRunner extends EnigmaticElement {

    tests = {}

    connectedCallback() {
        window.testrunner = this
    }

    createTests(tests) {
        this.tests = tests
        this.innerHTML = `
            <div style="display:grid; grid-template: 4fr 1fr / 4fr 1fr">
                <e-e id='trdisplay'></e-e>
                <div></div>
                <div>
                  <span id='trstatus'>${this.count()} tests loaded</span>
                  <button style='margin-top: 5px; float: right' onclick='testrunner.run()'>Run</button>
                </div>
             </div>
        `
    }

    count() {
        return Object.keys(this.tests).length
    }

    async run() {
        console.clear()
        let pass = true, ret = [], time = +new Date(), func
        for (const test in this.tests) {
            let success, message
            $('#trstatus').innerHTML = `<i>${test}</i>`
            try {
                func = this.tests[test]
                const isAsyncTest = (func.constructor.name === 'AsyncFunction')
                success = isAsyncTest ? await func() : func()
            } catch (e) {
                success = false
                message = e
                console.error(e)
            }
            if (!success) {
                this.innerHTML = `Failed on test: ${test} ${message}`
                pass = false
            }
            ret = [...ret, { test, func, success }]
        }
        const status = $('#trstatus'), count = this.count()
        status.innerHTML = `${pass ? '<green>Passed</green>' : '<red>Failed</red>'}`
        status.innerHTML += `  ${count} tests in ${+new Date() - time}ms`
        console[!!console.table ? 'table' : 'log'](ret)
    }

    set(s) {
        $('#trstatus').innerHTML = s
    }
}

customElements.define('test-runner', TestRunner)