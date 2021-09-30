const {createHash, createECDH, createSign, createVerify} = require('crypto')

exports.privateKey = null;
exports.publicKey = null;
exports.publicKeyCompressed = null;
exports.pem = null;

exports.createKeys = (privateHex) => {
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

        let keys = {}
        keys.pem = `-----BEGIN EC PRIVATE KEY-----\n${b64.toString('base64')}\n-----END EC PRIVATE KEY-----`
        keys.public = ecdh.getPublicKey('hex')
        keys.public_compressed = ecdh.getPublicKey('hex', 'compressed')
        keys.private = ecdh.getPrivateKey('hex')
        return keys
}
  
exports.sign = (s) => {
        const signer = createSign('SHA256')
        signer.update(s)
        return signer.sign(this.pem).toString('hex')
}
  
exports.verify = (s, sig) => {
        if(!sig) throw Error('enter a signature')
        const verify = createVerify('SHA256') 
        verify.update(s)
        return verify.verify(this.pem, Buffer.from(sig.toString('hex'), 'hex'))
}
  
exports.hash = (s) => createHash('sha256').update(s).digest('hex')
