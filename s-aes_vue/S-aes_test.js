class SimplifiedAES {
  static sBox = [
    0x9, 0x4, 0xa, 0xb, 0xd, 0x1, 0x8, 0x5, 0x6, 0x2, 0x0, 0x3, 0xc, 0xe, 0xf,
    0x7,
  ];

  static sBoxI = [
    0xa, 0x5, 0x9, 0xb, 0x1, 0x7, 0x8, 0xf, 0x6, 0x0, 0x2, 0x3, 0xc, 0x4, 0xd,
    0xe,
  ];

  constructor(key) {
    const [preRoundKey, round1Key, round2Key] = this.keyExpansion(key);
    this.preRoundKey = preRoundKey;
    this.round1Key = round1Key;
    this.round2Key = round2Key;
  }

  subWord(word) {
    return (
      (SimplifiedAES.sBox[word >> 4] << 4) + SimplifiedAES.sBox[word & 0x0f]
    );
  }

  rotWord(word) {
    return ((word & 0x0f) << 4) + ((word & 0xf0) >> 4);
  }

  keyExpansion(key) {
    const Rcon1 = 0x80;
    const Rcon2 = 0x30;
    const w = [];

    w[0] = (key & 0xff00) >> 8;
    w[1] = key & 0x00ff;
    w[2] = w[0] ^ (this.subWord(this.rotWord(w[1])) ^ Rcon1);
    w[3] = w[2] ^ w[1];
    w[4] = w[2] ^ (this.subWord(this.rotWord(w[3])) ^ Rcon2);
    w[5] = w[4] ^ w[3];

    return [
      this.intToState((w[0] << 8) + w[1]),
      this.intToState((w[2] << 8) + w[3]),
      this.intToState((w[4] << 8) + w[5]),
    ];
  }

  intToState(num) {
    return [(num & 0xff00) >> 8, num & 0x00ff];
  }

  addRoundKey(state, roundKey) {
    return [state[0] ^ roundKey[0], state[1] ^ roundKey[1]];
  }

  subBytes(state) {
    return [SimplifiedAES.sBox[state[0]], SimplifiedAES.sBox[state[1]]];
  }

  invSubBytes(state) {
    return [SimplifiedAES.sBoxI[state[0]], SimplifiedAES.sBoxI[state[1]]];
  }

  shiftRows(state) {
    const shiftedState = [...state];
    shiftedState[1] =
      state[1] ^ (state[1] >> 2) ^ (state[1] << 6) ^ (state[1] << 7);
    shiftedState[0] =
      state[0] ^
      (shiftedState[1] & 0x80) ^
      (shiftedState[1] << 1) ^
      (shiftedState[1] << 2);
    return shiftedState;
  }

  invShiftRows(state) {
    const shiftedState = [...state];
    shiftedState[0] =
      state[0] ^ (state[0] >> 1) ^ (state[0] >> 2) ^ (state[0] >> 3);
    shiftedState[1] =
      state[1] ^ (state[1] << 7) ^ (state[1] >> 1) ^ (state[1] >> 2);
    return shiftedState;
  }

  mixColumns(state) {
    const mixedState = [...state];
    const a = state[0];
    const b = state[1];
    mixedState[0] =
      (state[0] << 1) ^ (state[1] << 3) ^ (state[1] << 4) ^ (state[1] >> 4);
    mixedState[1] =
      (state[1] << 1) ^ (state[0] << 2) ^ (state[0] << 3) ^ (state[0] >> 4);
    mixedState[0] ^= 0x09 ^ ((a >> 3) & 0x01) ^ ((a >> 4) & 0x01);
    mixedState[1] ^= 0x09 ^ ((b >> 3) & 0x01) ^ ((b >> 4) & 0x01);
    return mixedState;
  }

  invMixColumns(state) {
    const mixedState = [...state];
    const a = state[0];
    const b = state[1];
    mixedState[0] =
      (state[0] >> 1) ^ (state[1] >> 3) ^ (state[1] >> 4) ^ (state[1] << 4);
    mixedState[1] =
      (state[1] >> 1) ^ (state[0] >> 2) ^ (state[0] >> 3) ^ (state[0] << 3);
    mixedState[0] ^=
      0x08 ^ ((a >> 4) & 0x01) ^ ((a >> 3) & 0x01) ^ ((a >> 2) & 0x01);
    mixedState[1] ^=
      0x08 ^ ((b >> 4) & 0x01) ^ ((b >> 3) & 0x01) ^ ((b >> 2) & 0x01);
    return mixedState;
  }

  encrypt(plainText) {
    let state = this.intToState(plainText);
    state = this.addRoundKey(state, this.preRoundKey);
    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.mixColumns(state);
    state = this.addRoundKey(state, this.round1Key);
    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.addRoundKey(state, this.round2Key);
    return (state[0] << 8) + state[1];
  }

  decrypt(cipherText) {
    let state = this.intToState(cipherText);
    state = this.addRoundKey(state, this.round2Key);
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    state = this.addRoundKey(state, this.round1Key);
    state = this.invMixColumns(state);
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    state = this.addRoundKey(state, this.preRoundKey);
    return (state[0] << 8) + state[1];
  }
}
class DoubleAES {
  constructor(key) {
    this.key1 = key >> 16;
    this.key2 = key & 0xffff;
    this.aes1 = new SimplifiedAES(this.key1);
    this.aes2 = new SimplifiedAES(this.key2);
  }

  encrypt(plainText) {
    const intermediate = this.aes1.encrypt(plainText);
    return this.aes2.encrypt(intermediate);
  }

  decrypt(cipherText) {
    const intermediate = this.aes2.decrypt(cipherText);
    return this.aes1.decrypt(intermediate);
  }
}
class MiddleMeetAttack {
  constructor() {
    this.pairs = [];
  }

  addPair(plainText, cipherText) {
    this.pairs.push({ plainText, cipherText });
  }

  findKey() {
    for (let key1 = 0; key1 <= 0xffff; key1++) {
      for (let key2 = 0; key2 <= 0xffff; key2++) {
        let isKeyFound = true;

        for (const pair of this.pairs) {
          const aes1 = new SimplifiedAES(key1);
          const aes2 = new SimplifiedAES(key2);

          const intermediate = aes1.encrypt(pair.plainText);
          const decrypted = aes2.decrypt(pair.cipherText);

          if (intermediate !== decrypted) {
            isKeyFound = false;
            break;
          }
        }

        if (isKeyFound) {
          return { key1, key2 };
        }
      }
    }

    return null;
  }
}


class TripleAES32 {
  constructor(key) {
    this.key1 = key >> 16;
    this.key2 = key & 0xffff;
    this.aes1 = new SimplifiedAES(this.key1);
    this.aes2 = new SimplifiedAES(this.key2);
  }

  encrypt(plainText) {
    const intermediate1 = this.aes1.encrypt(plainText);
    const intermediate2 = this.aes2.encrypt(intermediate1);
    return this.aes1.encrypt(intermediate2);
  }

  decrypt(cipherText) {
    const intermediate1 = this.aes1.decrypt(cipherText);
    const intermediate2 = this.aes2.decrypt(intermediate1);
    return this.aes1.decrypt(intermediate2);
  }
}

class TripleAES48 {
  constructor(key) {
    this.key1 = key >> 32;
    this.key2 = (key >> 16) & 0xffff;
    this.key3 = key & 0xffff;
    this.aes1 = new SimplifiedAES(this.key1);
    this.aes2 = new SimplifiedAES(this.key2);
    this.aes3 = new SimplifiedAES(this.key3);
  }

  encrypt(plainText) {
    const intermediate1 = this.aes1.encrypt(plainText);
    const intermediate2 = this.aes2.encrypt(intermediate1);
    return this.aes3.encrypt(intermediate2);
  }

  decrypt(cipherText) {
    const intermediate1 = this.aes3.decrypt(cipherText);
    const intermediate2 = this.aes2.decrypt(intermediate1);
    return this.aes1.decrypt(intermediate2);
  }
}
class SAES_CBC {
  constructor(key, iv) {
    this.key = key;
    this.iv = iv;
    this.aes = new SimplifiedAES(this.key);
  }

  encrypt(plainText) {
    let cipherText = "";
    let previousBlock = this.iv;

    for (let i = 0; i < plainText.length; i += 2) {
      const block = plainText.substr(i, 2);
      const xoredBlock = this.xorHex(block, previousBlock);
      const encryptedBlock = this.aes.encrypt(xoredBlock);
      cipherText += encryptedBlock;
      previousBlock = encryptedBlock;
    }

    return cipherText;
  }

  decrypt(cipherText) {
    let plainText = "";
    let previousBlock = this.iv;

    for (let i = 0; i < cipherText.length; i += 2) {
      const block = cipherText.substr(i, 2);
      const decryptedBlock = this.aes.decrypt(block);
      const xoredBlock = this.xorHex(decryptedBlock, previousBlock);
      plainText += xoredBlock;
      previousBlock = block;
    }

    return plainText;
  }

  xorHex(hex1, hex2) {
    const num1 = parseInt(hex1, 16);
    const num2 = parseInt(hex2, 16);
    const xorResult = num1 ^ num2;
    return xorResult.toString(16).padStart(2, "0");
  }
}

// s-AES

// const key = 0x2b7e;
// const aes = new SimplifiedAES(key);
// const plainText = 0x3243;
// const encrypted = aes.encrypt(plainText);
// const decrypted = aes.decrypt(encrypted);

// console.log("明文:", plainText.toString(16));
// console.log("加密:", encrypted.toString(16));
// console.log("解密:", decrypted.toString(16));

// doubleAES

// const key = 0x12345678;
// const doubleAES = new DoubleAES(key);

// const plainText = 0x3243; 
// const encrypted = doubleAES.encrypt(plainText);
// const decrypted = doubleAES.decrypt(encrypted);

// console.log("明文:", plainText.toString(16));
// console.log("加密:", encrypted.toString(16));
// console.log("解密:", decrypted.toString(16));

// // 中间相遇攻击
// const attack = new MiddleMeetAttack();

// // 添加一对明文和对应的密文
// attack.addPair(0x3243, 0xbf74);

// // 尝试找到正确的密钥
// const foundKey = attack.findKey();

// if (foundKey) {
//   console.log("找到正确的密钥！:", foundKey);
// } else {
//   console.log("没找到密钥。");
// }



// tripleAES48
// const key = 0x123456789abc;
// const tripleAES48 = new TripleAES48(key);

// const plainText = 0x3243; 
// const encrypted = tripleAES48.encrypt(plainText);
// const decrypted = tripleAES48.decrypt(encrypted);

// console.log("明文:", plainText.toString(16));
// console.log("加密:", encrypted.toString(16));
// console.log("解密:", decrypted.toString(16));


const key = 0x1234; 
const iv = "a5"; 

const saesCbc = new SAES_CBC(key, iv);

const plainText = "324356"; 
const encrypted = saesCbc.encrypt(plainText);
console.log("加密:", encrypted);


const modifiedEncrypted = encrypted.substr(0, 2) + "ff" + encrypted.substr(4);
console.log("修改后的加密:", modifiedEncrypted);

const decrypted = saesCbc.decrypt(encrypted);
console.log("解密:", decrypted);

const modifiedDecrypted = saesCbc.decrypt(modifiedEncrypted);
console.log("修改后的解密:", modifiedDecrypted);