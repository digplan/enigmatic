export default (r, s, data) =>{
  return s.endJSON({time: new Date().toISOString()})
}