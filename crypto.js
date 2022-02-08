import { createECDH, createPublicKey, createPrivateKey, createVerify, createSign, createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { writeFileSync } from 'node:fs'

export default class CRYPTO {

    public = ''
    public_compressed = ''
    public_for_verify = ''
    #private = ''
    #pem

    constructor(privateHex) {
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
        this.public_for_verify = createPublicKey({ 'key': this.pem, 'format': 'pem', 'type': 'pkcs8', 'cipher': 'aes-256-cbc' }).export({ 'type': 'spki', 'format': 'pem' })
        this.private = ecdh.getPrivateKey('hex')
        return this
    }

    dump() {
        writeFileSync(`private.pem`, this.pem)
        writeFileSync(`public.hex`, this.public)
        writeFileSync(`private.hex`, this.private)
        writeFileSync(`public_compressed.hex`, this.public_compressed)
    }

    sign(text) {
        const signer = createSign('SHA256')
        signer.update(text)
        signer.end()
        return signer.sign(this.private, 'hex')
    }

    verify(text, signature) {
        if (!signature) throw Error('enter a signature')
        const verify = createVerify('SHA256')
        verify.update(text)
        return verify.verify(this.pem, signature, 'hex')
    }

    verifyPublic(text, signature, publicKey = this.public_for_verify) {
        if (!signature) throw Error('enter a signature')
        const verify = createVerify('SHA256')
        verify.update(text)
        return verify.verify(publicKey, signature, 'hex')
    }

    hash(s) {
        return createHash('sha256').update(s).digest('hex')
    }

    encrypt(text) {
        const iv = randomBytes(16)
        const cipher = createCipheriv('aes-256-ctr', this.private.slice(32), iv)
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`
    }

    decrypt(ivtext) {
        const [iv, encrypted_text] = ivtext.split(':')
        const decipher = createDecipheriv('aes-256-ctr', this.private.slice(32), Buffer.from(iv, 'hex'))
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(encrypted_text, 'hex')), decipher.final()])
        return decrpyted.toString();
    }

    quickId() {
        const v = this.hash((+new Date() + Math.random()).toString())
        return v.toUpperCase().substr(0, 6)
    }

}

/*****************
       Tests  
******************/

if (process.argv[1].match('crypto.mjs')) {

    const crypto = new CRYPTO('844a4f5aaeef10dd522761264ae08ebe7b1a50d5dfaa18f48979c78b0e9a0f33')

    crypto.dump()

    // Create keys with provided private key
    console.log(`1 New Keys: ${JSON.stringify(crypto, null, 2)}`)

    // Sign a message
    const sig = crypto.sign('this message')
    console.log(`2 Signing message. sig = ${sig}`)

    // Verify a message
    const verified = crypto.verify('this message', sig)
    console.log(`3 Verify message: ${verified}`)

    // Verify a message with public key
    const verified2 = JSON.stringify(crypto.verifyPublic('this message', sig))
    console.log(`4 Verify message with public: ${verified2}`)

    // Hash a message
    const hashed = crypto.hash('cb')
    console.log(`5 Hash a value: ${hashed}`)

    // Encrypt a string
    let encryptedData = crypto.encrypt('text to hide')
    console.log(`6 Encrypt "text to hide": ${JSON.stringify(encryptedData)}`)

    // Decrypt a string
    let decryptedData = crypto.decrypt(encryptedData)
    console.log(`7 Decrypt some data: ${decryptedData}`)

    console.log(crypto)
}