class DB {
    
    static DATA = new Proxy({}, {
        set: (obj, prop, value) => {
            if (window.debug)
                console.log('e ======> SETTING DATA OBJECT .' + prop + ' = ' + JSON.stringify(value))
            obj[prop] = value
            const controls = $(`[data^=${prop}]`)
            controls.forEach(control => {
                var newval = value
                if(window.debug)
                    console.log(`e ======> DATA SETTING CONTROL ${control.getAttribute('control') || control.tagName.toLowerCase()} ${prop} ${value}`)
                if (control.set) control.set(newval);
                else control.innerHTML = newval
            })
            return prop
        }
    })

}

class EDB extends DB {

    static get (key, query) {
       const f = await fetch(`/api/${query}`)
       const resp = await f.toJSON()
       this.DATA[key] = resp
    }

}