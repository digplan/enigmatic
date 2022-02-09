#!/usr/bin/env node
import { JWT } from './index.mjs';

// Don't use this secret for anything. Testing only.

const secret = 'your-256-bit-secret';
const payload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: 1516239022,
};

const jwt = new JWT(secret);
const jwtstr = jwt.create(payload);
const verify = jwt.verify(jwtstr);
console.log('JWT is', jwtstr);
console.log('Verified is ', !!verify);
console.log('Payload is ', verify);

const verify_fail = jwt.verify('invalid');
console.log('Verify a bad string. Verified is ', !!verify_fail);