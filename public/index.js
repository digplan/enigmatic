class DB {
    
    url = '/api'
    tokenurl = '/api/token'
    token

    static DATA = new Proxy({}, {
        set: (obj, prop, value) => {
            obj[prop] = value
            document.querySelector(`[data^=${prop}]`).forEach(control => {
                var newval = value
                if (control.set) control.set(newval);
                else control.innerHTML = newval
            })
            return prop
        }
    })

    static async getToken(name, pass) {
        const f = await fetch(tokenurl)
        const resp = await f.json()
        this.token = resp[0].token
    }

    static async get (key, query) {
       const f = await fetch(`${this.url}/${query}`, {headers: {Authorization: `BEARER ${this.token}`}})
       const resp = await f.json()
       this.DATA[key] = resp
    }
    
    static async method (method, key, data) {
        if(!data._id) throw {DBException: 'method needs a _id'}
        const f = await fetch(this.url, {method: method, body: data, headers: {Authorization: `BEARER ${this.token}`}})
        const resp = await f.json()
        this.DATA[key] = resp
    }

    static eventsource (url) {
        const ev = new window.EventSource(url)

        ev.onopen = (e) => {
            console.log(`e ======> eventsource opened`)
        }  
        
        ev.onmessage = (e) => {
            console.log(`e ======> Event data in: ${e.data}`)
            let obj = JSON.parse(e.data)
            for (k in obj) data[k] = obj[k]
        }    
        
        ev.onerror = (e) => {
            if (this.readyState == EventSource.CONNECTING)
              return console.log(`e ======> eventsource connecting`)
            if (this.readyState == EventSource.OPEN)
              return console.log(`e ======> eventsource open`)
            if (this.readyState == EventSource.CLOSED)
              return console.log(`e ======> eventsource closed`)             
        }
    }

}

class CONTROLS {

    static helloworld (e) {
        e.innerHTML = 'Hello World!'
    }

    static youtube (e) {
        const id = e.getAttribute('id') || 'MlDx9s-zJMM'
        e.innerHTML = `<embed src='//www.youtube.com/embed/${id}?rel=0&amp;controls=0&amp;showinfo=0' style='height:100%;width:100%' />`
    }

    static mapembed (e) {
        const id = e.getAttribute('id')
        e.innerHTML = `<iframe height='100%' width=100% frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${id || 'Chicago'}&output=embed"></iframe>`
    }

    static view (e) {
        var agent = e.getAttribute('useragent');
        if (debug)
            console.log(`e ======> View ${e.id} useragent: ${navigator.userAgent}`)
        if (agent && !navigator.userAgent.match(agent)) {
            e.hidden = true;
        }
        e.show = () => {
            var prev = $('view:not([hidden])')[0];
            if (prev === e) return;
            prev.classList.remove('show');
            prev.classList.add('hide');
            prev.addEventListener('transitionend', () => {
                prev.hidden = true;
                e.hidden = false;
                e.classList.add('show');
            });
        }
    }

}

class CLASSES {
    static print (e) {
        e.onclick = () => {
          print ()
        }
    }
}

class ENIGMATIC {

    version = 'v.0.9.2'
    controls = CONTROLS
    classes = CLASSES
    db = EDB
    debug

    render () {
        this.debug = document.querySelectorAll('body')[0].hasAttribute('debug');
        const $ = document.querySelectorAll

        $('[control]').forEach(e => {
            const name = e.getAttribute('control') || e.tagName.toLowerCase()
            if(this.controls[name])
                this.controls[name](e)
        })

        for(let name in this.classes){
            const es = document.getElementsByClassName(name)
            Array.from(es).forEach(e => {
                this.classes[name](e)
            })
        }

        const datasrc = $('body')[0].getAttribute('datasrc')
        if(datasrc)
          EDB.get(datasrc)

        const events = $('body')[0].getAttribute('events')
        if(events)
          EDB.eventsource(events)

        return this
    }

    static $ (selector) {
        return document.querySelectorAll (selector)
    }

    static load (s) {
        return new Promise(r => {
            var iscss = s.match(/css$/);
            if (!iscss) {
                for (var i = 0; i < document.scripts.length; i++)
                    if (document.scripts[i].src == s) return r()
            }
            var e = document.createElement(iscss ? 'link' : 'script')
            if (iscss) e.rel = "stylesheet"
            e[iscss ? 'href' : 'src'] = s
            document.body.appendChild(e)
            e.onload = r
        })
    }

    static child (parent, type) {
      const e = document.createElement(type || 'div')
      parent.appendChild(e)
      return es
    }

    static css (id, rules) {
        var style = document.createElement("style")
        document.head.appendChild(style)
        const rule = `#${id} { ${rules} }`
        style.sheet.insertRule(rule)
        return rules
    }

}

document.addEventListener('DOMContentLoaded', () => {
    ENIGMATIC.render()
    if(window.ready)
      window.ready()
})