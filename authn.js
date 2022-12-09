// Create
const publicKeyCredentialCreationOptions = {
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

const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
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
