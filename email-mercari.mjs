import SETTINGS from './settings.mjs'
import nodeoutlook from 'nodejs-nodemailer-outlook'
const {OutlookUser, OutlookPass, SMSEmailDomain} = SETTINGS.mail

export function sendEmail(to, msg, html) {
  console.log(`sending to ${to}`)
  nodeoutlook.sendEmail({
    auth: {
      user: OutlookUser,
      pass: OutlookPass
    },
    from: OutlookUser,
    to: to,
    subject: msg,
    html: html,
    onError: (e) => { throw Error(e) }
  })
}

export function sendSMS(to, msg) {
  return sendEmail(`${to}@${SMSEmailDomain}`, msg)
}

/*****************
       Tests  
******************/

if (process.argv[1].match('messaging.mjs')) {
  sendSMS('1477542908', 'test message sms')
  setTimeout(()=>sendEmail('something@hotmail.com', 'test subject', 'test message email'), 3000)
}

export class Mercari {
  static async get() {
    const s = SETTINGS.Mercari
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`https://www.mercari.com/search/?facets=2&itemStatuses=1&keyword=${s.keywords}&maxPrice=${s.minPrice}00&minPrice=${s.maxPrice}00`)
    const html = await page.content()
    const arr = html.match(/{.*}/gmi)
    for (const item of arr) {
      var i = ''
      try { i = JSON.parse(item) } catch (e) { }
      if (!i || !i.offers) continue;

      const { name, offers, description } = i
      const { price, itemCondition, availability, url } = offers
      if (past[url]) continue;

      const desc = description.replace(/\n/g, '')
      console.log(`${name} ${desc} ${price} https://www.mercari.com${url}`)

      if (!debugm) mail(name, `${desc} : https://www.mercari.com${url}`);

      past[url] = 1
      fs.writeFileSync('./items.json', JSON.stringify(past, null, 2))
    }
    await browser.close();
  }
}
