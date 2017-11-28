window.controls.views = e => e.show = showid => $('views > view').forEach( v => v.hidden = v.id != showid )
window.controls.gmap = async e => {
  e.style.height = e.getAttribute('height')||'200px'; 
  e.style.width = e.getAttribute('width')||'600px';
  await load('//maps.googleapis.com/maps/api/js?v=3&key=AIzaSyC8BS-Qe1BKcB9R0c3iVF_fBGtaJ7weVJc')
  const zoom = +e.getAttribute('zoom')||8
  const lat = +e.getAttribute('lat')||28
  const lng = +e.getAttribute('lng')||-82
  new google.maps.Map(e, {center: {lat:lat, lng:lng}, zoom: zoom})
}
