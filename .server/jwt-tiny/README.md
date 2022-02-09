# jwt-tiny
[![npm version](https://badge.fury.io/js/jwt-tiny.svg)](https://badge.fury.io/js/jwt-tiny)
![size](http://img.badgesize.io/digplan/jwt-tiny/master/index.mjs)

Zero dependency, pure JS, tiny JWT for servers.

Run tests

> npx jwt-tiny

```js
const {JWT} = import('jwt-tiny');
const secret = 'your-256-bit-secret';
const payload = {
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
};

const jwt = new JWT(secret);
const jwtstr = jwt.create(payload);
const payload = jwt.verify(jwtstr);
console.log(jwtstr, payload);
```
