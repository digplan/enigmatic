// Create

const credential = await navigator.credentials.create({
    publicKey: {
        challenge: Uint8Array.from(
            'xxxxxx', c => c.charCodeAt(0)),
        rp: {
            name: "Test",
            id: "localhost",
        },
        user: {
            id: Uint8Array.from(
                "UZSL85T9AFC", c => c.charCodeAt(0)),
            name: "lee@webauthn.guide",
            displayName: "Lee",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
        },
        timeout: 60000,
        attestation: "direct"
    }
})

console.log(credential)

// Auth
const publicKeyCredentialRequestOptions = {
    challenge: Uint8Array.from(
        randomStringFromServer, c => c.charCodeAt(0)),
    allowCredentials: [{
        id: Uint8Array.from(
            credentialId, c => c.charCodeAt(0)),
        type: 'public-key',
        transports: ['usb', 'ble', 'nfc'],
    }],
    timeout: 60000,
}

const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions
})

/* ALT

ArrayBuffer.from = (string) => Uint8Array.from(string.split('').map(e => e.charCodeAt(0))).buffer

const webauthn = async () => {
    //if(!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    //    return false
    const op = {}
    op.attestation = 'direct'
    op.authenticatorSelection = {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'discouraged'
    }
    op.challenge = ArrayBuffer.from('challenge')
    op.pubKeyCredParams = [{ alg: -7, type: 'public-key' }]
    op.rp = { id: 'localhost', name: 'localhost' }
    op.timeout = 60000,
        op.user = { name: 'cb', displayName: 'cb', id: ArrayBuffer.from('cb') }

    return {
        async makeCredential() {
            const cred = await navigator.credentials.create({ publicKey: op })
            return cred
        },
        async getAssertion() {
            const cred = await navigator.credentials.get({ publicKey: op })
            return cred
        }
    }
}

const w = await webauthn()
w.makeCredential().then(e => console.log(e))
//w.getAssertion().then(e => console.log(e))

/*
send to server
{
            credential: {type: 'FIDO', id: attestation.id},
            clientData: attestation.signature.clientData,
            authnrData: attestation.signature.authnrData,
            signature: attestation.signature.signature
        }
        */