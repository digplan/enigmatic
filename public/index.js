const controls = {
    helloworld: (e) => e.innerHTML = 'Hello World!',
    youtube: (e) => {
        const id = e.getAttribute('id') || 'MlDx9s-zJMM'
        e.innerHTML = `<embed src='//www.youtube.com/embed/${id}?rel=0&amp;controls=0&amp;showinfo=0' style='height:100%;width:100%' />`
    },
    mapembed: (e) => {
        const id = e.getAttribute('id')
        e.innerHTML = `<iframe height='100%' width=100% frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${id || 'Chicago'}&output=embed"></iframe>`
    },
    view: (e) => {
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
window.controls = controls

const classes = {
    "post": async (e) => {
        e.onclick = async ()=>{
          var resp = await fetch('/data/post', {method:'POST', body:''})
          alert(resp)
        }
    }
}
window.classes = classes

const load = s => {
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
window.load = load

const data = new Proxy({}, {
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
window.data = data

const child = (parent, type) => {
    const e = document.createElement(type || 'div')
    parent.appendChild(e)
    return es
}
window.child = child

const css = (id, rules) => {
    var style = document.createElement("style")
    document.head.appendChild(style)
    const rule = `#${id} { ${rules} }`
    style.sheet.insertRule(rule)
    return rules
}
window.css = css

const enigmatic = {
    "version": 'v0.9.1',
    "start": async x => {

        console.log(`\r\ne ======> ${window.enigmatic.version} : ${new Date()}`);

        window.$ = document.querySelectorAll
        window.debug = $('body')[0].hasAttribute('debug');

        let controls = $('[control]')
        for (let i = 0; i < controls.length; i++) {
            let e = controls[i]
            let name = e.getAttribute('control') || e.tagName.toLowerCase()
            if (name in window.controls){
                console.log(`e ======> Found Control: ${name} ${e.id} ${e}`)
                await window.controls[name](e)
            }
        }

        for(let name in window.classes){
            let es = document.getElementsByClassName(name)
            for(let i = 0; i<es.length; i++){
                window.classes[name](es[i])
            }
        }

        let datasrc = $('body')[0].getAttribute('datasrc');
        if (datasrc) {
            if(window.debug)
              console.log(`e ======> Body Datasrc is set: ${datasrc}`)
            let d = await (await fetch(datasrc)).json()
            if(window.debug)
              console.log(`e ======> Body Datasrc: ${datasrc}, data: ${JSON.stringify(d)}`)
            for (k in d) data[k] = d[k];
        }

        let events = $('body')[0].getAttribute('events');
        if (events) {
            window.events = source = new EventSource(events);
            if(window.debug) 
              console.log('e ======> eventsource: ' + events)

            source.onopen = function(e){
               console.log(`e ======> eventsource opened`)
            }

            source.onmessage = function(e) {
                console.log(`e ======> Event data in: ${e.data}`)
                let obj = JSON.parse(e.data)
                for (k in obj) data[k] = obj[k]
            }

            source.onerror = function(e) {
                if(!window.debug) return;
                if (this.readyState == EventSource.CONNECTING)
                  return console.log(`e ======> eventsource connecting`)
                if (this.readyState == EventSource.OPEN)
                  return console.log(`e ======> eventsource open`)
                if (this.readyState == EventSource.CLOSED)
                  return console.log(`e ======> eventsource closed`)             
            }
        }

        if (window.ready) window.ready();
    }
}

document.addEventListener('DOMContentLoaded', window.enigmatic.start)