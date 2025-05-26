import { ec } from 'elliptic';

const EC = new ec('secp256k1'); // for testing; use BabyJubJub onchain-compatible in prod

export type ECPoint = { x: string; y: string };
export type Cipher = { c1: ECPoint; c2: ECPoint };

export function genKeypair() {
  const key = EC.genKeyPair();
  return {
    privKey: key.getPrivate('hex'),
    pubKey: pointToObj(key.getPublic()),
  };
}

export function encrypt(amount: bigint, pubKey: ECPoint): Cipher {
  const G = EC.g;
  const pk = EC.keyFromPublic(objToPoint(pubKey)).getPublic();
  const r = EC.genKeyPair().getPrivate();

  const c1 = G.mul(r);
  const mG = G.mul(amount);
  const rPK = pk.mul(r);
  const c2 = mG.add(rPK);

  return {
    c1: pointToObj(c1),
    c2: pointToObj(c2),
  };
}

export function decrypt(cipher: Cipher, privKeyHex: string): bigint {
  const privKey = EC.keyFromPrivate(privKeyHex, 'hex');
  const c1 = objToPoint(cipher.c1);
  const c2 = objToPoint(cipher.c2);
  const shared = c1.mul(privKey.getPrivate());
  const mG = c2.sub(shared);

  // Brute-force recovery (for small balances)
  for (let i = 0n; i < 10000n; i++) {
    const guess = EC.g.mul(i);
    if (guess.getX().eq(mG.getX()) && guess.getY().eq(mG.getY())) return i;
  }

  throw new Error('Balance not found');
}

function pointToObj(point: ec.BasePoint): ECPoint {
  return {
    x: point.getX().toString(10),
    y: point.getY().toString(10),
  };
}

function objToPoint({ x, y }: ECPoint): ec.BasePoint {
  return EC.curve.point(x, y);
}
