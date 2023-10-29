class SimplifiedAES {
  constructor(key) {
    this.preRoundKey = key;
    const roundKeys = SimplifiedAES.keyExpansion(key);
    this.round1Key = roundKeys[0];
    this.round2Key = roundKeys[1];
  }
  subWord(word) {
    return (
      (SimplifiedAES.sBox[word >> 4] << 4) + SimplifiedAES.sBox[word & 0x0f]
    );
  }

  rotWord(word) {
    return ((word & 0x0f) << 4) + ((word & 0xf0) >> 4);
  }
  
 static intToState(num) {
    return [
      (num & 0xff00) >> 8,
      num & 0x00ff,
      0x00,
      0x00
    ];
}
intToState(num) {
  return SimplifiedAES.intToState(num); 
}

  // GF乘法
  static gfMult(a, b) {
    let result = 0;
    while (b > 0) {
      if (b & 1) {
        result ^= a;
      }
      a <<= 1;
      if (a & 0x10) {
        a ^= 0x13; // x^4 + x + 1
      }
      b >>= 1;
    }
    return result;
  }

  // GF加法就是异或
  static gfAdd(a, b) {
    return a ^ b; 
  }

  // 子字节变换
  static subBytes(a) {
    let inv = SimplifiedAES.gfMult(a, 0x0b);
    return SimplifiedAES.gfAdd(inv, 0x03);
  }

  // 逆子字节变换
  static invSubBytes(a) {
    let inv = SimplifiedAES.gfMult(a, 0x0b);
    return SimplifiedAES.gfAdd(inv, 0x09);
  }

  static keyExpansion(key) {
    const w = [];

    w[0] = (key & 0xff00) >> 8;
    w[1] = key & 0x00ff;

    const Rcon1 = 0x80;
    const Rcon2 = 0x30;

    w[2] = SimplifiedAES.gfAdd(
      w[0],
      SimplifiedAES.subBytes(SimplifiedAES.rotWord(w[1])) ^ Rcon1
    );
    w[3] = SimplifiedAES.gfAdd(w[2], w[1]);
    w[4] = SimplifiedAES.gfAdd(
      w[2],
      SimplifiedAES.subBytes(SimplifiedAES.rotWord(w[3])) ^ Rcon2
    );
    w[5] = SimplifiedAES.gfAdd(w[4], w[3]);

    return [
      SimplifiedAES.intToState((w[0] << 8) + w[1]),
      SimplifiedAES.intToState((w[2] << 8) + w[3]),
      SimplifiedAES.intToState((w[4] << 8) + w[5]),
    ];
  }

  static rotWord(word) {
    return ((word & 0x0f) << 4) + ((word & 0xf0) >> 4); 
  }

  addRoundKey(state, roundKey) {
    return [state[0] ^ roundKey[0], state[1] ^ roundKey[1]];
  }

  static shiftRows(state) {
    const shiftedState = [state[0], state[1]];
    shiftedState[1] = 
      state[1] ^ (state[1] >> 2) ^ (state[1] << 6) ^ (state[1] << 7);
    shiftedState[0] =  
      state[0] ^  
      (shiftedState[1] & 0x80) ^  
      (shiftedState[1] << 1) ^  
      (shiftedState[1] << 2);
    return shiftedState;
  }

  static invShiftRows(state) {
    const shiftedState = [state[0], state[1]];
    shiftedState[0] =
      state[0] ^ (state[0] >> 1) ^ (state[0] >> 2) ^ (state[0] >> 3);
    shiftedState[1] =  
      state[1] ^ (state[1] << 7) ^ (state[1] >> 1) ^ (state[1] >> 2);
    return shiftedState;
  }
 // 列混淆
 static mixColumns(state) {
  const mixedState = [...state];
  const a = state[0];
  const b = state[1];
  mixedState[0] =
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(a, 0x04),
      SimplifiedAES.gfMult(b, 0x01)
    ) ^
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(b, 0x02),
      SimplifiedAES.gfMult(b, 0x03)
    );
  mixedState[1] =
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(b, 0x04),
      SimplifiedAES.gfMult(a, 0x01)
    ) ^
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(a, 0x02),
      SimplifiedAES.gfMult(a, 0x03)
    );
  return mixedState;
}

// 逆列混淆
static invMixColumns(state) {
  const mixedState = [state[0], state[1]];
  const a = state[0];
  const b = state[1];
  mixedState[0] =
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(a, 0x09),
      SimplifiedAES.gfMult(b, 0x0e)
    ) ^
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(b, 0x0b),
      SimplifiedAES.gfMult(b, 0x0d)
    );
  mixedState[1] =
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(b, 0x09),
      SimplifiedAES.gfMult(a, 0x0e)
    ) ^
    SimplifiedAES.gfAdd(
      SimplifiedAES.gfMult(a, 0x0b),
      SimplifiedAES.gfMult(a, 0x0d)
    );
  return mixedState;
}

// 加密
encrypt(plaintext) {

  console.log("明文:", plaintext);

  // 将明文转换为状态
  let state = this.intToState(plaintext);

  console.log("转换后的状态:", state);

  // 加入初始轮密钥
  state = SimplifiedAES.gfAdd(state, this.preRoundKey);

  // 第一轮
  state = SimplifiedAES.subBytes(state);

  state = SimplifiedAES.shiftRows(state);  

  state = SimplifiedAES.mixColumns(state);

  state = SimplifiedAES.gfAdd(state, this.round1Key);

  // 第二轮
  state = SimplifiedAES.subBytes(state);

  state = SimplifiedAES.shiftRows(state);

  state = SimplifiedAES.gfAdd(state, this.round2Key);

  // 返回密文
  return (state[0] << 8) + state[1];

}

// 解密
decrypt(ciphertext) {

  console.log("密文:", ciphertext);

  // 将密文转换为状态
  let state = this.intToState(ciphertext);  

  console.log("转换后的状态:", state);

  // 第二轮
  state = SimplifiedAES.gfAdd(state, this.round2Key);

  state = SimplifiedAES.invShiftRows(state);

  state = SimplifiedAES.invSubBytes(state);

  // 第一轮
  state = SimplifiedAES.gfAdd(state, this.round1Key);

  state = SimplifiedAES.invMixColumns(state);  

  state = SimplifiedAES.invShiftRows(state);

  state = SimplifiedAES.invSubBytes(state);

  // 加入初始轮密钥
  state = SimplifiedAES.gfAdd(state, this.preRoundKey);

  // 返回明文
  return (state[0] << 8) + state[1];

}
}

const plaintext = 0x3e2a; // 明文
const key = 0x4567; // 密钥

const cipher = new SimplifiedAES(key); // 使用密钥初始化加密器

const ciphertext = cipher.encrypt(plaintext); // 加密

console.log("明文: ", plaintext.toString(16));
console.log("密文: ", ciphertext.toString(16));

const decryptedText = cipher.decrypt(ciphertext); // 解密

console.log("解密后的明文: ", decryptedText.toString(16));