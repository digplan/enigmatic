(async ()=>{
  // Try a test page
  const page = await require('testchrome')('https://digplan.github.io/enigmatic/test.html')
  const html = await page.evaluate('document.documentElement.outerHTML')
  console.log(html)
  // $
  const dollar = await page.evaluate('$("html")')

  // load(js)
//  const loadjs = await load('')

  // load(css)
//  const loadcss = await load('')

  // window.data
//  const data = await page.evaluate();

  // window.controls
//  const controls = await page.evaluate('controls')

  // window.controls.helloworld
  const hw = await page.evaluate('controls.helloworld')

  // Element.child
//  const child = await page.evaluate('')

  // Meta data
    
  process.exit(0) 
})().catch(e=>{console.error(e); process.exit(1)})
