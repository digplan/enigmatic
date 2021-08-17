window.controls = {
    helloworld: (e) => e.innerHTML = 'Hello World!',
    youtube: (e) => {
        const id = e.getAttribute('id') || 'MlDx9s-zJMM'
        e.innerHTML = `<embed src='//www.youtube.com/embed/${id}?rel=0&amp;controls=0&amp;showinfo=0' style='height:100%;width:100%' />`
    },
    mapembed: (e) => {
        const id = e.getAttribute('id')
        e.innerHTML = `<iframe height='100%' width=100% frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${id||'Chicago'}&output=embed"></iframe>`
    },
    view: (e) => {
        var debug = $('body')[0].hasAttribute('debug');
        var agent = e.getAttribute('useragent');
        if (debug)
            console.log('View useragent: ' + navigator.userAgent)
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

window.$ = document.querySelectorAll.bind(document)
window.load = s => {
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
window.data = new Proxy({}, {
    set: (obj, prop, value) => {
        console.warn('data.' + prop + ' = ' + JSON.stringify(value))
        obj[prop] = value
        const controls = $(`[data^=${prop}]`)
        if (!controls.length) return console.warn('did not find controls for ' + `[data^=${prop}]`)
        console.warn('found controls ' + controls)
        controls.forEach(control => {
            var cval = value
            control.getAttribute('data').split('.').forEach(p => {
                if (p == prop) return
                cval = cval[p]
            })
            console.warn(control + ' ' + control.getAttribute('data') + ' = ' + cval)
            if (control.set) control.set(cval);
            else control.innerHTML = cval
        })
        return prop
    }
})

Element.child = (type, parent) => {
    const e = document.createElement(type || 'div')
        (parent || this).appendChild(e)
}
Element.css = (rules, sel) => {
    var style = document.createElement("style")
    document.head.appendChild(style)
    style.sheet.insertRule(`${sel||name} { ${rules} }`)
}

window.enigmatic = {
    "version": 'v0.9.1',
    "start": async x => {
	  let controls = $('[control]')
  for(let i=0; i<controls.length; i++){
    let e = controls[i]
    let name = e.getAttribute('control') || e.tagName.toLowerCase()
    e.css = (rules, sel)=>{
     var style = document.createElement("style")
     document.head.appendChild(style)
     style.sheet.insertRule(`${sel||name} { ${rules} }`)
    }
    if(name in window.controls)
      await window.controls[name](e)
  }
        const b = $('body')[0];
	    const debug = b.hasAttribute('debug');
            let datasrc = b.getAttribute('datasrc');
            if (datasrc) {
                let d = await (await fetch(datasrc)).json()
                for (k in d) data[k] = d[k];
                if (debug) console.log('datasrc: ' + JSON.stringify(d))
            };
            let events = b.getAttribute('events');
            if (events) {
                var source = new EventSource(events);
                if (debug) console.log('eventsource: ' + events)
                source.onmessage = function(d) {
                    if (debug) console.log('events: ' + JSON.stringify(d.data))
                    for (k in d) data[k] = d[k];
                }
            }
  
        console.log(`e ${window.enigmatic.version} : ${new Date()}`);
        if (window.ready) window.ready();
    }
}

document.addEventListener('DOMContentLoaded', window.enigmatic.start)