
exports.createDiffieHellman = exports.DiffieHellman = DiffieHellman;

function DiffieHellman(sizeOrKey, keyEncoding, generator, genEncoding) {
  if (!(this instanceof DiffieHellman))
    return new DiffieHellman(sizeOrKey, keyEncoding, generator, genEncoding);

  if (!(sizeOrKey instanceof Buffer) &&
      typeof sizeOrKey !== 'number' &&
      typeof sizeOrKey !== 'string')
    throw new TypeError('First argument should be number, string or Buffer');

  if (keyEncoding) {
    if (typeof keyEncoding !== 'string' ||
        (!Buffer.isEncoding(keyEncoding) && keyEncoding !== 'buffer')) {
      genEncoding = generator;
      generator = keyEncoding;
      keyEncoding = false;
    }
  }

  keyEncoding = keyEncoding || exports.DEFAULT_ENCODING;
  genEncoding = genEncoding || exports.DEFAULT_ENCODING;

  if (typeof sizeOrKey !== 'number')
    sizeOrKey = toBuf(sizeOrKey, keyEncoding);

  if (!generator)
    generator = DH_GENERATOR;
  else if (typeof generator !== 'number')
    generator = toBuf(generator, genEncoding);

  this._handle = new binding.DiffieHellman(sizeOrKey, generator);
  Object.defineProperty(this, 'verifyError', {
    enumerable: true,
    value: this._handle.verifyError,
    writable: false
  });
}


exports.DiffieHellmanGroup =
    exports.createDiffieHellmanGroup =
    exports.getDiffieHellman = DiffieHellmanGroup;

function DiffieHellmanGroup(name) {
  if (!(this instanceof DiffieHellmanGroup))
    return new DiffieHellmanGroup(name);
  this._handle = new binding.DiffieHellmanGroup(name);
  Object.defineProperty(this, 'verifyError', {
    enumerable: true,
    value: this._handle.verifyError,
    writable: false
  });
}


DiffieHellmanGroup.prototype.generateKeys =
    DiffieHellman.prototype.generateKeys =
    dhGenerateKeys;

function dhGenerateKeys(encoding) {
  var keys = this._handle.generateKeys();
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    keys = keys.toString(encoding);
  return keys;
}


DiffieHellmanGroup.prototype.computeSecret =
    DiffieHellman.prototype.computeSecret =
    dhComputeSecret;

function dhComputeSecret(key, inEnc, outEnc) {
  inEnc = inEnc || exports.DEFAULT_ENCODING;
  outEnc = outEnc || exports.DEFAULT_ENCODING;
  var ret = this._handle.computeSecret(toBuf(key, inEnc));
  if (outEnc && outEnc !== 'buffer')
    ret = ret.toString(outEnc);
  return ret;
}


DiffieHellmanGroup.prototype.getPrime =
    DiffieHellman.prototype.getPrime =
    dhGetPrime;

function dhGetPrime(encoding) {
  var prime = this._handle.getPrime();
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    prime = prime.toString(encoding);
  return prime;
}


DiffieHellmanGroup.prototype.getGenerator =
    DiffieHellman.prototype.getGenerator =
    dhGetGenerator;

function dhGetGenerator(encoding) {
  var generator = this._handle.getGenerator();
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    generator = generator.toString(encoding);
  return generator;
}


DiffieHellmanGroup.prototype.getPublicKey =
    DiffieHellman.prototype.getPublicKey =
    dhGetPublicKey;

function dhGetPublicKey(encoding) {
  var key = this._handle.getPublicKey();
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    key = key.toString(encoding);
  return key;
}


DiffieHellmanGroup.prototype.getPrivateKey =
    DiffieHellman.prototype.getPrivateKey =
    dhGetPrivateKey;

function dhGetPrivateKey(encoding) {
  var key = this._handle.getPrivateKey();
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    key = key.toString(encoding);
  return key;
}


DiffieHellman.prototype.setPublicKey = function setPublicKey(key, encoding) {
  encoding = encoding || exports.DEFAULT_ENCODING;
  this._handle.setPublicKey(toBuf(key, encoding));
  return this;
};


DiffieHellman.prototype.setPrivateKey = function setPrivateKey(key, encoding) {
  encoding = encoding || exports.DEFAULT_ENCODING;
  this._handle.setPrivateKey(toBuf(key, encoding));
  return this;
};


function ECDH(curve) {
  if (typeof curve !== 'string')
    throw new TypeError('"curve" argument should be a string');

  this._handle = new binding.ECDH(curve);
}

exports.createECDH = function createECDH(curve) {
  return new ECDH(curve);
};

ECDH.prototype.computeSecret = DiffieHellman.prototype.computeSecret;
ECDH.prototype.setPrivateKey = DiffieHellman.prototype.setPrivateKey;
ECDH.prototype.setPublicKey = DiffieHellman.prototype.setPublicKey;
ECDH.prototype.getPrivateKey = DiffieHellman.prototype.getPrivateKey;

ECDH.prototype.generateKeys = function generateKeys(encoding, format) {
  this._handle.generateKeys();

  return this.getPublicKey(encoding, format);
};

ECDH.prototype.getPublicKey = function getPublicKey(encoding, format) {
  var f;
  if (format) {
    if (typeof format === 'number')
      f = format;
    if (format === 'compressed')
      f = constants.POINT_CONVERSION_COMPRESSED;
    else if (format === 'hybrid')
      f = constants.POINT_CONVERSION_HYBRID;
    // Default
    else if (format === 'uncompressed')
      f = constants.POINT_CONVERSION_UNCOMPRESSED;
    else
      throw new TypeError('Bad format: ' + format);
  } else {
    f = constants.POINT_CONVERSION_UNCOMPRESSED;
  }
  var key = this._handle.getPublicKey(f);
  encoding = encoding || exports.DEFAULT_ENCODING;
  if (encoding && encoding !== 'buffer')
    key = key.toString(encoding);
  return key;
};
