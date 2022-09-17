// wsl install:
// wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
// sudo apt - y install./ google - chrome - stable_current_amd64.deb

import puppeteer from 'puppeteer'
import { te, tde, tm, wait } from 'instax'
const host = 'http://localhost:3000'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto(`${host}/test.html`, {
    waitUntil: 'networkidle2',
    timeout: 10000
})

const e = (await page.evaluate("enigmatic"))
tm(e.version, /0.11.1/)

console.log(await page.evaluate("$('#hello').innerHTML"))
// get
// state
// div
// custom

await page.close()
await browser.close()
