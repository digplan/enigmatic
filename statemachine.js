class StateMachine {

    instanceid = `${Math.random().toString(36).substring(2, 7).toUpperCase()}-${new Date().toISOString()}`
    states = {}
    data = {}

    async start(name) {
        this.checkStateExists(name)
        this.data._currentState = name
        while (this.data._currentState !== 'END') {
            try {
                this.data._currentState = await this.states[this.data._currentState](this.data)
            } catch (e) {
                this.data._currentState = e
            }
            if (this.data._currentState !== 'END') {
                this.checkStateExists(this.data._currentState)
            }
        }
    }

    defineState(name, func) {
        return this.states[name] = func
    }

    checkStateExists(name) {
        if (!Object.keys(this.states).includes(name)) {
            throw new Error(`State ${name} does not exist`)
        }
    }
}

// test
const stateMachine = new StateMachine()
console.log(stateMachine.instanceid)

stateMachine.defineState('START', (data) => {
    return new Promise((resolve, reject) => {
        data.test = 'test'
        console.log('started')
        setTimeout(() => resolve('state2'), 1000)
    })
})

stateMachine.defineState('state2', (data) => {
    data.test2 = 'test2'
    return new Promise((resolve, reject) => {
        console.log('state2 ' + JSON.stringify(data))
        setTimeout(() => reject('had_error'), 1000)
    })
})

stateMachine.defineState('state3', (data) => {
    data.test3 = 'test3'
    console.log('state3 ' + JSON.stringify(data))
    return 'END'
})

stateMachine.defineState('had_error', (data) => {
    console.error('had an error, ending now')
    return 'END'
})

await stateMachine.start('START')