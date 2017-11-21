const { Chromeless } = require('chromeless')

async function run() {
  const chromeless = new Chromeless({launchChrome: false})

  const links = await chromeless
    .setHtml(`
       <link href=https://rawgit.com/digplan/enigmatic.js/master/css.css rel=stylesheet>
       <helloworld control></helloworld>
    `)
    
    .evaluate(() => {
      var js = document.body.appendChild(document.createElement('script'));
      js.src = 'https://rawgit.com/digplan/enigmatic.js/master/enigmatic.js'
      js.onload = ()=>{

       enigmaticy()

      }
    })

    .html()

  console.log(links)
  await chromeless.end()
}

run().catch(err => {
  if(!err.code.match(/ECONNREFUSED/)) 
    return console.error(err);
  console.log('***** Chrome headless is not started.  Starting Chrome');
  require('child_process').exec('start chrome --remote-debugging-port=9222 --disable-gpu --headless')
  run()
})