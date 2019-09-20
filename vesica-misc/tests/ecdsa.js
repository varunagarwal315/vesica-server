'use strict'

// ECDSA test
const crypto = require('crypto');
const sign = crypto.createSign('sha256');
const verify = crypto.createVerify('RSA-SHA256');

sign.update('some data to sign');
const private_key =
        'MHcCAQEEIF+jnWY1D5kbVYDNvxxo/Y+ku2uJPDwS0r/VuPZQrjjVoAoGCCqGSM49\n' +
        'AwEHoUQDQgAEurOxfSxmqIRYzJVagdZfMMSjRNNhB8i3mXyIMq704m2m52FdfKZ2\n' +
        'pQhByd5eyj3lgZ7m7jbchtdgyOF8Io/1ng==\n' +
        '-----END EC PRIVATE KEY-----\n';

const prvtKey = '-----BEGIN EC PRIVATE KEY-----\n' + alicePair.privateKey.toString('') + '\n-----END EC PRIVATE KEY-----\n';
console.log(sign.sign(prvtKey).toString('hex'));
