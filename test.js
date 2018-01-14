(async ()=>{
  // Try a test page
  const page = await require('testchrome')('https://digplan.github.io/enigmatic/test.html')
  const html = await page.evaluate('document.documentElement.outerHTML')
  console.log(html)
  
  process.exit(0) 
})().catch(e=>{console.error(e); process.exit(1)})
