import SETTINGS from './settings.mjs'
import nodeoutlook from 'nodejs-nodemailer-outlook'
const { OutlookUser, OutlookPass, SMSEmailDomain } = SETTINGS.mail

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
    setTimeout(() => sendEmail('something@hotmail.com', 'test subject', 'test message email'), 3000)
}