// Hash algorithm implementations using @noble/hashes v2
import { sha1 } from '@noble/hashes/legacy.js'
import { sha224, sha256, sha384, sha512, sha512_224, sha512_256 } from '@noble/hashes/sha2.js'
import {
  sha3_224, sha3_256, sha3_384, sha3_512,
  keccak_224, keccak_256, keccak_384, keccak_512,
  shake128, shake256,
} from '@noble/hashes/sha3.js'
import { cshake128, cshake256, kmac128, kmac256 } from '@noble/hashes/sha3-addons.js'
import { blake2b, blake2s } from '@noble/hashes/blake2.js'
import { blake3 } from '@noble/hashes/blake3.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { hmac } from '@noble/hashes/hmac.js'
import { bytesToHex, bytesToBase64 } from './utils'

// ─── MD5 ──────────────────────────────────────────────────────────────────────
function md5Impl(input: Uint8Array): Uint8Array {
  const S = [
    7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
    5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
    6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21,
  ]
  const K = new Uint32Array(64)
  for (let i = 0; i < 64; i++) K[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0

  const msgLen = input.length
  const bitLen = msgLen * 8
  const padLen = ((msgLen % 64 < 56 ? 56 : 120) - msgLen % 64)
  const padded = new Uint8Array(msgLen + padLen + 8)
  padded.set(input); padded[msgLen] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(msgLen + padLen, bitLen >>> 0, true)
  view.setUint32(msgLen + padLen + 4, Math.floor(bitLen / 0x100000000) >>> 0, true)

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16)
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(offset + i * 4, true)
    let [A, B, C, D] = [a0, b0, c0, d0]
    for (let i = 0; i < 64; i++) {
      let F: number; let g: number
      if (i < 16) { F = (B & C) | (~B & D); g = i }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16 }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16 }
      else { F = C ^ (B | ~D); g = (7 * i) % 16 }
      F = (F + A + K[i] + M[g]) >>> 0
      A = D; D = C; C = B
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0
  }

  const result = new Uint8Array(16)
  const rv = new DataView(result.buffer)
  rv.setUint32(0, a0, true); rv.setUint32(4, b0, true)
  rv.setUint32(8, c0, true); rv.setUint32(12, d0, true)
  return result
}

// ─── MD4 ──────────────────────────────────────────────────────────────────────
function md4Impl(input: Uint8Array): Uint8Array {
  const msgLen = input.length
  const bitLen = msgLen * 8
  const padLen = ((msgLen % 64 < 56 ? 56 : 120) - (msgLen % 64))
  const padded = new Uint8Array(msgLen + padLen + 8)
  padded.set(input); padded[msgLen] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(msgLen + padLen, bitLen >>> 0, true)
  view.setUint32(msgLen + padLen + 4, Math.floor(bitLen / 0x100000000) >>> 0, true)

  let A = 0x67452301, B = 0xefcdab89, C = 0x98badcfe, D = 0x10325476

  const rol = (x: number, n: number) => (x << n) | (x >>> (32 - n))
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z)
  const G = (x: number, y: number, z: number) => (x & y) | (x & z) | (y & z)
  const H = (x: number, y: number, z: number) => x ^ y ^ z

  for (let offset = 0; offset < padded.length; offset += 64) {
    const X = new Uint32Array(16)
    for (let i = 0; i < 16; i++) X[i] = view.getUint32(offset + i * 4, true)
    let [a, b, c, d] = [A, B, C, D]

    const r1s = [3,7,11,19]
    for (let i = 0; i < 16; i++) { a = rol((a + F(b,c,d) + X[i]) >>> 0, r1s[i%4]); [a,b,c,d]=[d,a,b,c] }
    const r2s = [3,5,9,13]; const r2i = [0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15]
    for (let i = 0; i < 16; i++) { a = rol((a + G(b,c,d) + X[r2i[i]] + 0x5a827999) >>> 0, r2s[i%4]); [a,b,c,d]=[d,a,b,c] }
    const r3s = [3,9,11,15]; const r3i = [0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15]
    for (let i = 0; i < 16; i++) { a = rol((a + H(b,c,d) + X[r3i[i]] + 0x6ed9eba1) >>> 0, r3s[i%4]); [a,b,c,d]=[d,a,b,c] }

    A = (A+a)>>>0; B = (B+b)>>>0; C = (C+c)>>>0; D = (D+d)>>>0
  }

  const result = new Uint8Array(16); const rv = new DataView(result.buffer)
  rv.setUint32(0,A,true); rv.setUint32(4,B,true); rv.setUint32(8,C,true); rv.setUint32(12,D,true)
  return result
}

// ─── MD2 ──────────────────────────────────────────────────────────────────────
function md2Impl(input: Uint8Array): Uint8Array {
  const PI_SUBST = [41,46,67,201,162,216,124,1,61,54,84,161,236,240,6,19,98,167,5,243,192,199,115,140,152,147,43,217,188,76,130,202,30,155,87,60,253,212,224,22,103,66,111,24,138,23,229,18,190,78,196,214,218,158,222,73,160,251,245,142,187,47,238,122,169,104,121,145,21,178,7,63,148,194,16,137,11,34,95,33,128,127,93,154,90,144,50,39,53,62,204,231,191,247,151,3,255,25,48,179,72,165,181,209,215,94,146,42,172,86,170,198,79,184,56,210,150,164,125,182,118,252,107,226,156,116,4,241,69,157,112,89,100,113,135,32,134,91,207,101,230,45,168,2,27,96,37,173,174,176,185,246,28,70,97,105,52,64,126,15,85,71,163,35,221,81,175,58,195,92,249,206,186,197,234,38,44,83,13,110,133,40,132,9,211,223,205,244,65,129,77,82,106,220,55,200,108,193,171,250,36,225,123,8,12,189,177,74,120,136,149,139,227,99,232,109,233,203,213,254,59,0,29,57,242,239,183,14,102,88,208,228,166,119,114,248,235,117,75,10,49,68,80,180,143,237,31,26,219,153,141,51,159,17,131,20]
  const msgLen = input.length; const padLen = 16 - (msgLen % 16)
  const padded = new Uint8Array(msgLen + padLen + 16)
  padded.set(input); for (let i = 0; i < padLen; i++) padded[msgLen + i] = padLen
  const checksum = new Uint8Array(16); let L = 0
  for (let i = 0; i < msgLen + padLen; i++) { const c = padded[i]; checksum[i%16] ^= PI_SUBST[c^L]; L = checksum[i%16] }
  padded.set(checksum, msgLen + padLen)
  const state = new Uint8Array(48)
  for (let i = 0; i <= msgLen + padLen; i += 16) {
    for (let j = 0; j < 16; j++) { state[16+j] = padded[i+j]; state[32+j] = padded[i+j] ^ state[j] }
    let t = 0
    for (let j = 0; j < 18; j++) { for (let k = 0; k < 48; k++) { state[k] ^= PI_SUBST[t]; t = state[k] } t = (t+j)%256 }
  }
  return state.slice(0,16)
}

// ─── RIPEMD-128 ───────────────────────────────────────────────────────────────
function ripemd128Impl(data: Uint8Array): Uint8Array {
  const rol = (x: number, n: number) => (x << n) | (x >>> (32-n))
  const f1 = (x: number, y: number, z: number) => x^y^z
  const f2 = (x: number, y: number, z: number) => (x&y)|(~x&z)
  const f3 = (x: number, y: number, z: number) => (x|~y)^z
  const f4 = (x: number, y: number, z: number) => (x&z)|(y&~z)
  const msgLen = data.length; const bitLen = msgLen * 8
  const padLen = ((msgLen % 64 < 56 ? 56 : 120) - msgLen % 64)
  const padded = new Uint8Array(msgLen + padLen + 8); padded.set(data); padded[msgLen] = 0x80
  const dv = new DataView(padded.buffer)
  dv.setUint32(msgLen + padLen, bitLen >>> 0, true); dv.setUint32(msgLen + padLen + 4, 0, true)
  let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476
  const RL=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2]
  const RR=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14]
  const SL=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12]
  const SR=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8]
  const KL=[0,0x5a827999,0x6ed9eba1,0x8f1bbcdc]; const KR=[0x50a28be6,0x5c4dd124,0x6d703ef3,0]
  for (let off=0; off<padded.length; off+=64) {
    const X=new Uint32Array(16); for (let i=0;i<16;i++) X[i]=dv.getUint32(off+i*4,true)
    let [al,bl,cl,dl]=[h0,h1,h2,h3],[ar,br,cr,dr]=[h0,h1,h2,h3]
    for (let i=0;i<64;i++) {
      const round=Math.floor(i/16); let fl:number,fr:number
      if(round===0){fl=f1(bl,cl,dl);fr=f4(br,cr,dr)}else if(round===1){fl=f2(bl,cl,dl);fr=f3(br,cr,dr)}else if(round===2){fl=f3(bl,cl,dl);fr=f2(br,cr,dr)}else{fl=f4(bl,cl,dl);fr=f1(br,cr,dr)}
      let T=rol((al+fl+X[RL[i]]+KL[round])>>>0,SL[i]); al=dl;dl=cl;cl=bl;bl=T
      T=rol((ar+fr+X[RR[i]]+KR[round])>>>0,SR[i]); ar=dr;dr=cr;cr=br;br=T
    }
    const T=(h1+cl+dr)>>>0; h1=(h2+dl+ar)>>>0; h2=(h3+al+br)>>>0; h3=(h0+bl+cr)>>>0; h0=T
  }
  const result=new Uint8Array(16); const rv=new DataView(result.buffer)
  rv.setUint32(0,h0,true); rv.setUint32(4,h1,true); rv.setUint32(8,h2,true); rv.setUint32(12,h3,true)
  return result
}

// ─── RIPEMD-256 ───────────────────────────────────────────────────────────────
function ripemd256Impl(data: Uint8Array): Uint8Array {
  const rol=(x:number,n:number)=>(x<<n)|(x>>>(32-n))
  const f1=(x:number,y:number,z:number)=>x^y^z
  const f2=(x:number,y:number,z:number)=>(x&y)|(~x&z)
  const f3=(x:number,y:number,z:number)=>(x|~y)^z
  const f4=(x:number,y:number,z:number)=>(x&z)|(y&~z)
  const msgLen=data.length; const bitLen=msgLen*8
  const padLen=((msgLen%64<56?56:120)-msgLen%64)
  const padded=new Uint8Array(msgLen+padLen+8); padded.set(data); padded[msgLen]=0x80
  const dv=new DataView(padded.buffer); dv.setUint32(msgLen+padLen,bitLen>>>0,true)
  let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476
  let h4=0x76543210,h5=0xfedcba98,h6=0x89abcdef,h7=0x01234567
  const RL=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2]
  const RR=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14]
  const SL=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12]
  const SR=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8]
  const KL=[0,0x5a827999,0x6ed9eba1,0x8f1bbcdc]; const KR=[0x50a28be6,0x5c4dd124,0x6d703ef3,0]
  for (let off=0;off<padded.length;off+=64) {
    const X=new Uint32Array(16); for(let i=0;i<16;i++) X[i]=dv.getUint32(off+i*4,true)
    let [al,bl,cl,dl]=[h0,h1,h2,h3],[ar,br,cr,dr]=[h4,h5,h6,h7]
    for(let i=0;i<64;i++){
      const round=Math.floor(i/16); let fl:number,fr:number
      if(round===0){fl=f1(bl,cl,dl);fr=f4(br,cr,dr)}else if(round===1){fl=f2(bl,cl,dl);fr=f3(br,cr,dr)}else if(round===2){fl=f3(bl,cl,dl);fr=f2(br,cr,dr)}else{fl=f4(bl,cl,dl);fr=f1(br,cr,dr)}
      let T=rol((al+fl+X[RL[i]]+KL[round])>>>0,SL[i]); al=dl;dl=cl;cl=bl;bl=T
      T=rol((ar+fr+X[RR[i]]+KR[round])>>>0,SR[i]); ar=dr;dr=cr;cr=br;br=T
      if(i===15){const t=al;al=ar;ar=t}else if(i===31){const t=bl;bl=br;br=t}else if(i===47){const t=cl;cl=cr;cr=t}else if(i===63){const t=dl;dl=dr;dr=t}
    }
    h0=(h0+al)>>>0;h1=(h1+bl)>>>0;h2=(h2+cl)>>>0;h3=(h3+dl)>>>0
    h4=(h4+ar)>>>0;h5=(h5+br)>>>0;h6=(h6+cr)>>>0;h7=(h7+dr)>>>0
  }
  const result=new Uint8Array(32); const rv=new DataView(result.buffer)
  rv.setUint32(0,h0,true);rv.setUint32(4,h1,true);rv.setUint32(8,h2,true);rv.setUint32(12,h3,true)
  rv.setUint32(16,h4,true);rv.setUint32(20,h5,true);rv.setUint32(24,h6,true);rv.setUint32(28,h7,true)
  return result
}

// ─── RIPEMD-320 ───────────────────────────────────────────────────────────────
function ripemd320Impl(data: Uint8Array): Uint8Array {
  const rol=(x:number,n:number)=>(x<<n)|(x>>>(32-n))
  const f1=(x:number,y:number,z:number)=>x^y^z
  const f2=(x:number,y:number,z:number)=>(x&y)|(~x&z)
  const f3=(x:number,y:number,z:number)=>(x|~y)^z
  const f4=(x:number,y:number,z:number)=>(x&z)|(y&~z)
  const f5=(x:number,y:number,z:number)=>x^(y|~z)
  const msgLen=data.length; const bitLen=msgLen*8
  const padLen=((msgLen%64<56?56:120)-msgLen%64)
  const padded=new Uint8Array(msgLen+padLen+8); padded.set(data); padded[msgLen]=0x80
  const dv=new DataView(padded.buffer); dv.setUint32(msgLen+padLen,bitLen>>>0,true)
  let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476,h4=0xc3d2e1f0
  let h5=0x76543210,h6=0xfedcba98,h7=0x89abcdef,h8=0x01234567,h9=0x3c2d1e0f
  const RL=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]
  const RR=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]
  const SL=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]
  const SR=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]
  const KL=[0,0x5a827999,0x6ed9eba1,0x8f1bbcdc,0xa953fd4e]; const KR=[0x50a28be6,0x5c4dd124,0x6d703ef3,0x7a6d76e9,0]
  for(let off=0;off<padded.length;off+=64){
    const X=new Uint32Array(16); for(let i=0;i<16;i++) X[i]=dv.getUint32(off+i*4,true)
    let [al,bl,cl,dl,el]=[h0,h1,h2,h3,h4],[ar,br,cr,dr,er]=[h5,h6,h7,h8,h9]
    for(let i=0;i<80;i++){
      const round=Math.floor(i/16); let fl:number,fr:number
      if(round===0){fl=f1(bl,cl,dl);fr=f5(br,cr,dr)}else if(round===1){fl=f2(bl,cl,dl);fr=f4(br,cr,dr)}else if(round===2){fl=f3(bl,cl,dl);fr=f3(br,cr,dr)}else if(round===3){fl=f4(bl,cl,dl);fr=f2(br,cr,dr)}else{fl=f5(bl,cl,dl);fr=f1(br,cr,dr)}
      let T=(rol((al+fl+X[RL[i]]+KL[round])>>>0,SL[i])+el)>>>0; al=el;el=dl;dl=rol(cl,10);cl=bl;bl=T
      T=(rol((ar+fr+X[RR[i]]+KR[round])>>>0,SR[i])+er)>>>0; ar=er;er=dr;dr=rol(cr,10);cr=br;br=T
      if(i===15){const t=bl;bl=br;br=t}else if(i===31){const t=dl;dl=dr;dr=t}else if(i===47){const t=al;al=ar;ar=t}else if(i===63){const t=cl;cl=cr;cr=t}else if(i===79){const t=el;el=er;er=t}
    }
    h0=(h0+al)>>>0;h1=(h1+bl)>>>0;h2=(h2+cl)>>>0;h3=(h3+dl)>>>0;h4=(h4+el)>>>0
    h5=(h5+ar)>>>0;h6=(h6+br)>>>0;h7=(h7+cr)>>>0;h8=(h8+dr)>>>0;h9=(h9+er)>>>0
  }
  const result=new Uint8Array(40); const rv=new DataView(result.buffer)
  rv.setUint32(0,h0,true);rv.setUint32(4,h1,true);rv.setUint32(8,h2,true);rv.setUint32(12,h3,true);rv.setUint32(16,h4,true)
  rv.setUint32(20,h5,true);rv.setUint32(24,h6,true);rv.setUint32(28,h7,true);rv.setUint32(32,h8,true);rv.setUint32(36,h9,true)
  return result
}

// ─── CRC-32 ───────────────────────────────────────────────────────────────────
function crc32(data: Uint8Array): Uint8Array {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let j = 0; j < 8; j++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  crc = (crc ^ 0xffffffff) >>> 0
  const result = new Uint8Array(4); new DataView(result.buffer).setUint32(0, crc, false)
  return result
}

// ─── Public API ───────────────────────────────────────────────────────────────
export type HashOptions = {
  outputFormat: string
  outputLen?: number
  hmacEnabled?: boolean
  hmacKey?: Uint8Array
  hmacKeyEncoding?: string
  cshakeN?: string
  cshakeS?: string
  kmacKey?: Uint8Array
}

export async function computeHash(algorithmId: string, data: Uint8Array, opts: HashOptions): Promise<string> {
  const algId = algorithmId.replace(/-file$/, '')
  const outLen = opts.outputLen ?? 32

  // Noble hash functions with HMAC support
  type NobleHash = (data: Uint8Array) => Uint8Array
  const nobleMap: Record<string, NobleHash> = {
    'sha1':          (d) => sha1(d),
    'sha224':        (d) => sha224(d),
    'sha256':        (d) => sha256(d),
    'sha256-double': (d) => sha256(sha256(d)),
    'sha384':        (d) => sha384(d),
    'sha512':        (d) => sha512(d),
    'sha512-224':    (d) => sha512_224(d),
    'sha512-256':    (d) => sha512_256(d),
    'sha3-224':      (d) => sha3_224(d),
    'sha3-256':      (d) => sha3_256(d),
    'sha3-384':      (d) => sha3_384(d),
    'sha3-512':      (d) => sha3_512(d),
    'keccak-224':    (d) => keccak_224(d),
    'keccak-256':    (d) => keccak_256(d),
    'keccak-384':    (d) => keccak_384(d),
    'keccak-512':    (d) => keccak_512(d),
    'shake128':      (d) => shake128(d, { dkLen: outLen }),
    'shake256':      (d) => shake256(d, { dkLen: outLen }),
    'blake2b':       (d) => blake2b(d),
    'blake2s':       (d) => blake2s(d),
    'blake3':        (d) => blake3(d),
    'ripemd160':     (d) => ripemd160(d),
    'md5':           (d) => md5Impl(d),
    'md4':           (d) => md4Impl(d),
    'md2':           (d) => md2Impl(d),
    'crc':           (d) => crc32(d),
    'ripemd128':     (d) => ripemd128Impl(d),
    'ripemd256':     (d) => ripemd256Impl(d),
    'ripemd320':     (d) => ripemd320Impl(d),
    'cshake128':     (d) => cshake128(d, { dkLen: outLen, personalization: opts.cshakeS ? new TextEncoder().encode(opts.cshakeS) : undefined, NISTfn: opts.cshakeN || undefined }),
    'cshake256':     (d) => cshake256(d, { dkLen: outLen, personalization: opts.cshakeS ? new TextEncoder().encode(opts.cshakeS) : undefined, NISTfn: opts.cshakeN || undefined }),
    'kmac128':       (d) => kmac128(opts.kmacKey ?? new Uint8Array(0), d, { dkLen: outLen, personalization: opts.cshakeS ? new TextEncoder().encode(opts.cshakeS) : undefined }),
    'kmac256':       (d) => kmac256(opts.kmacKey ?? new Uint8Array(0), d, { dkLen: outLen, personalization: opts.cshakeS ? new TextEncoder().encode(opts.cshakeS) : undefined }),
  }

  // HMAC-capable noble hash constructors
  type HMACableHash = Parameters<typeof hmac>[0]
  const hmacMap: Record<string, HMACableHash> = {
    'sha1': sha1, 'sha224': sha224, 'sha256': sha256, 'sha384': sha384, 'sha512': sha512,
    'sha3-224': sha3_224, 'sha3-256': sha3_256, 'sha3-384': sha3_384, 'sha3-512': sha3_512,
    'ripemd160': ripemd160, 'blake2b': blake2b, 'blake2s': blake2s,
  }

  let result: Uint8Array

  if (opts.hmacEnabled && opts.hmacKey && opts.hmacKey.length > 0) {
    if (hmacMap[algId]) {
      result = hmac(hmacMap[algId], opts.hmacKey, data)
    } else if (nobleMap[algId]) {
      // Manual HMAC for non-noble algos
      const blockSize = 64
      let key = opts.hmacKey
      if (key.length > blockSize) key = nobleMap[algId](key)
      if (key.length < blockSize) { const k = new Uint8Array(blockSize); k.set(key); key = k }
      const iPad = new Uint8Array(blockSize + data.length)
      const oPad = new Uint8Array(blockSize)
      for (let i = 0; i < blockSize; i++) { iPad[i] = key[i] ^ 0x36; oPad[i] = key[i] ^ 0x5c }
      iPad.set(data, blockSize)
      const inner = nobleMap[algId](iPad)
      const outer = new Uint8Array(blockSize + inner.length)
      outer.set(oPad); outer.set(inner, blockSize)
      result = nobleMap[algId](outer)
    } else {
      throw new Error(`Unknown algorithm: ${algId}`)
    }
  } else if (nobleMap[algId]) {
    result = nobleMap[algId](data)
  } else {
    throw new Error(`Unknown algorithm: ${algId}`)
  }

  if (opts.outputFormat === 'Hex (Upper Case)') return bytesToHex(result, true)
  if (opts.outputFormat === 'Base64') return bytesToBase64(result)
  return bytesToHex(result, false)
}
