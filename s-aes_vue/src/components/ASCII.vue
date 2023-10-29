<template>
    <div>
      <h2>ASCII</h2>
      <div>
        <label for="key">密钥：</label>
        <input type="text" v-model="key" id="key" />
      </div>
      <div>
        <label for="plainText">明文：</label>
        <input type="text" v-model="plainText" id="plainText" />
      </div>
      <div>
        <button @click="encrypt">加密</button>
        <button @click="decrypt">解密</button>
      </div>
      <div v-if="encrypted !== null">
        <p>加密结果：{{ encrypted }}</p>
      </div>
      <div v-if="decrypted !== null">
        <p>解密结果：{{ decrypted }}</p>
      </div>
    </div>
  </template>

<script>
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
    let state = this.intToState(plainText.charCodeAt(0)); // 将明文的第一个字符转换为整数
    state = this.addRoundKey(state, this.preRoundKey);
    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.mixColumns(state);
    state = this.addRoundKey(state, this.round1Key);
    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.addRoundKey(state, this.round2Key);
    return String.fromCharCode((state[0] << 8) + state[1]); // 将加密结果转换为字符
  }

  decrypt(cipherText) {
    let state = this.intToState(cipherText.charCodeAt(0)); // 将加密结果的第一个字符转换为整数
    state = this.addRoundKey(state, this.round2Key);
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    state = this.addRoundKey(state, this.round1Key);
    state = this.invMixColumns(state);
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    state = this.addRoundKey(state, this.preRoundKey);
    return String.fromCharCode((state[0] << 8) + state[1]); // 将解密结果转换为字符
  }
}

export default {
  data() {
    return {
      key: "2b7e", // 初始密钥
      plainText: "A", // 初始明文，这里设置为单个字符
      encrypted: null,
      decrypted: null,
    };
  },
  methods: {
    encrypt() {
      const key = parseInt(this.key, 16); // 将十六进制密钥转换为整数
      const aes = new SimplifiedAES(key);
      this.encrypted = aes.encrypt(this.plainText);
      this.decrypted = null; // 重置解密结果
    },
    decrypt() {
      const key = parseInt(this.key, 16); // 将十六进制密钥转换为整数
      const aes = new SimplifiedAES(key);
      this.decrypted = aes.decrypt(this.encrypted);
    },
  },
};
</script>
