/*
  crypto.js
  
  Include:
  const CRYPTO = require('./crypto.js')
  const crypto = new CRYPTO()

  Tests:
  > node crypto.js

*/

const { createHash, createECDH, createSign, createVerify, randomBytes, privateEncrypt, privateDecrypt} = require('crypto')

class CRYPTO {

        public = ''
        public_compressed = ''
        private = ''
        keyObject

        constructor (privateHex) {
                const ecdh = createECDH('secp256k1')
                privateHex ? ecdh.setPrivateKey(privateHex, 'hex') : ecdh.generateKeys()
                var pemformat = `308201510201010420${ecdh.getPrivateKey('hex')}a081e33081e0020101302c06072a8648ce3d0`
                pemformat += `101022100fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f3044042000000`
                pemformat += `00000000000000000000000000000000000000000000000000000000000042000000000000000000000000`
                pemformat += `0000000000000000000000000000000000000000704410479be667ef9dcbbac55a06295ce870b07029bfcd`
                pemformat += `b2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d`
                pemformat += `4b8022100fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141020101a144034`
                pemformat += `200${ecdh.getPublicKey('hex')}`
                const b64 = Buffer.from(pemformat, 'hex')

                this.pem = `-----BEGIN EC PRIVATE KEY-----\n${b64.toString('base64')}\n-----END EC PRIVATE KEY-----`
                this.public = ecdh.getPublicKey('hex')
                this.public_compressed = ecdh.getPublicKey('hex', 'compressed')
                this.private = ecdh.getPrivateKey('hex')
                this.KeyObject = ecdh.KeyObject
                return this
        }


        sign (text) {
                const signer = createSign ('SHA256')
                signer.update (text)
                signer.end ()
                return signer.sign (this.pem, 'hex')
        }

        verify (text, signature) {
                if (!signature) throw Error('enter a signature')
                const verify = createVerify('SHA256')
                verify.update(text)
                return verify.verify(this.pem, signature, 'hex')
        }

        hash (s) {
                return createHash('sha256').update(s).digest('hex')
        }

        encrypt (text) {
                return privateEncrypt (this.pem, Buffer.from(text))
        }

        decrypt (ivtext) {
                const [siv, s] = ivtext.split(':')
                const key = Buffer.from(this.private).slice(32)
                console.log(Buffer.from(siv, 'hex'))
                const cipher = createDecipheriv('aes-256-cbc', key, Buffer.from(siv, 'hex'))
                cipher.update(s, 'utf-8', 'hex')
                return cipher.final('hex')
        }

}

module.exports = CRYPTO

/*****************
       Tests  
******************/

if (require.main === module)
        tests ()

function tests () {

        const CRYPTO = require('./crypto.js');

        // Create keys with provided private key
        const crypto = new CRYPTO('844a4f5aaeef10dd522761264ae08ebe7b1a50d5dfaa18f48979c78b0e9a0f33')
        console.log(`1 New Keys: ${JSON.stringify(crypto, null, 2)}`)

        // Sign a message
        const sig = crypto.sign('this message')
        console.log(`2 Signing message. sig = ${sig}`)

        // Verify a message
        const verified = crypto.verify('this message', sig)
        console.log(`3 Verify message: ${verified}`)

        // Hash a message
        const hashed = crypto.hash('cb')
        console.log(`4 Hash a value: ${hashed}`)

        // Encrypt a string
        let encryptedData = crypto.encrypt('text to hide')
        console.log(`5 Encrypt some data ${encryptedData}`)
    
        // Decrypt a string
        //let decryptedData = crypto.decrypt(encryptedData)
        //console.log(`6 Decrypt some data ${decryptedData}`)
}