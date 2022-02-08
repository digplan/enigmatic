
function strToUint8(str) {
    return new TextEncoder().encode(str);
}
function strToUrlBase64(str) {
    return binToUrlBase64(utf8ToBinaryString(str));
}
function binToUrlBase64(bin) {
    return btoa(bin)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+/g, '');
}
function uint8ToUrlBase64(uint8) {
    var bin = '';
    uint8.forEach(function(code) {
        bin += String.fromCharCode(code);
    });
    return binToUrlBase64(bin);
}
function utf8ToBinaryString(str) {
    var escstr = encodeURIComponent(str);
    // replaces any uri escape sequence, such as %0A,
    // with binary escape, such as 0x0A
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    });
    return binstr;
}

async function getKey(type) {
  var jwk = {
      // Defines the JWK type
      kty: 'EC',
      crv: 'P-256',

      // The EC private part
      d: 'GYAwlBHc2mPsj1lp315HbYOmKNJ7esmO3JAkZVn9nJs',

      // The EC public parts
      x: 'ToL2HppsTESXQKvp7ED6NMgV4YnwbMeONexNry3KDNQ',
      y: 'Tt6Q3rxU37KAinUV9PLMlwosNy1t3Bf2VDg5q955AGc',

      // WebCrypto requires an "extractable" field to import keys
      ext: true
  };
  var keyType = {name: 'ECDSA', namedCurve: 'P-256', hash: { name: 'SHA-256' }}
  var sigType = { name: 'ECDSA', hash: { name: 'SHA-256' } }
  return await crypto.subtle.importKey('jwk', jwk, keyType, true, [type])
}

async function jwt(user) {
  var claims = {sub: user, iat: new Date().toISOString(), exp: new Date(new Date().getDate() + 7).toISOString()}
  var header = strToUrlBase64('{"typ":"JWT","alg":"ES256"}')
  var payload = strToUrlBase64(JSON.stringify(claims))
  var data = strToUint8(header + '.' + payload)
  var signature = uint8ToUrlBase64(new Uint8Array(await crypto.subtle.sign(sigType, await getKey('sign'), data)))
  return header + '.' + payload + '.' + signature
}

async function jwtverify(jwtstr) {

}
