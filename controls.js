//document.body.innerHTML = `<div control=gmap key=AIzaSyC8BS-Qe1BKcB9R0c3iVF_fBGtaJ7weVJc ></div>`
//document.body.innerHTML = `<input key=AIzaSyC8BS-Qe1BKcB9R0c3iVF_fBGtaJ7weVJc control=places></input>`
//document.body.innerHTML = `<button onclick='mymodal.open()'>Open Modal</button><modal id=mymodal control>hey there</modal>`
//document.body.innerHTML = `<youtube id=MlDx9s-zJMM control />`

window.views = e => e.show = showid => $('views > view').forEach( v => v.hidden = v.id != showid )
window.gmap = async e => {
    e.style.height = e.getAttribute('height')||'100%'; 
    e.style.width = e.getAttribute('width')||'100%';
    await load(`//maps.googleapis.com/maps/api/js?v=3&key=${e.getAttribute('key')}`)
    const zoom = +e.getAttribute('zoom')||14
    const lat = +e.getAttribute('lat')||28.3852
    const lng = +e.getAttribute('lng')||-81.5639
    new google.maps.Map(e, {center: {lat:lat, lng:lng}, zoom: zoom})
}
window.autocomplete = e => {
  var box = document.createElement('div')
  document.body.appendChild(box)
  e.onkeyup = ()=>{
    var es = e.items.filter(i=>i.match(e.value))
    box.innerHTML = es.map(i=>`<div onclick="document.querySelector('input').value=this.innerHTML;parentElement.hidden=true">${i}</div>`).join('')
    box.hidden = false
  }
  e.set = items=>e.items=items
}
window.places = async e => { 
  e.onclick = () => e.select();
  e.onkeyup = ev => {if(ev.keyCode==27) e.value = ''}
  await load(`//maps.googleapis.com/maps/api/js?v=3&key=${e.getAttribute('key')}&libraries=places`)
  var ac = new google.maps.places.Autocomplete(e, { types: ['address'] });
  ac.addListener('place_changed', ()=>e.selected=ac.getPlace())
}
window.modal = (e) => {
  e.css(`visibility: hidden; position: fixed; z-index: 1;padding-top: 100px; left: 0; top: 0; width: 100%;height: 100%; overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4);opacity: 0;transition: visibility 0s, opacity 0.2s linear;`)
  e.css('visibility: visible; opacity: 1;', 'modal[show]')
  e.css(`background-color: #fefefe;  margin: auto; padding: 20px;  border: 1px solid #888; width: 80%;`, '.modal-content');
  e.css(`color: #aaaaaa;  float: right; font-size: 28px; font-weight: bold; cursor:default`, '.close');
  e.open = k=>e.setAttribute('show', true)
  e.close = k=>e.removeAttribute('show')
  e.innerHTML = `<div class="modal-content"><span class="close" onclick='mymodal.close()'>×</span><p class=roboto>${e.innerHTML}</p></div>`
}
window.youtube = e=>e.innerHTML=`<embed height="${e.getAttribute('height')||'100%'}" width="${e.getAttribute('width')||'100%'}" src="//www.youtube.com/embed/${e.getAttribute('id')}" />`
window.fbcomments = async e =>{
  await load(`//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8`)
  e.innerHTML=`<div class="fb-comments" data-href="${location.href}" data-numposts="2"></div>`
}
