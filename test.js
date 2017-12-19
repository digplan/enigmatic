(async ()=>{
  const page = await require('testchrome')('https://digplan.github.io/test.html')
  const html = page.evaluate('document.documentElement.outerHTML')
  console.log(html)
  
  process.exit(0) 
})().catch(e=>{console.error(e); process.exit(1)})
