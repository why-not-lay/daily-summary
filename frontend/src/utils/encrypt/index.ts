import { pki, cipher, util } from 'node-forge';

export const encryptByAes = (key: string, data: string) => {
  const iv = process.env.REACT_APP_KEY_IV;
  if (typeof iv !== 'string' || iv.length !== 16) {
    throw Error('AES 加密失败：iv 值设置有误');
  }
  const cp = cipher.createCipher('AES-CBC', key)
  cp.start({ iv });
  cp.update(util.createBuffer(data, 'utf8'));
  cp.finish()
  const encrypted = cp.output.toHex();
  return encrypted;
}

export const encryptByRSA = (data: string) => {
  const pem = process.env.REACT_APP_KEY_RSA;
  if (typeof pem !== 'string') {
    throw Error('RSA 加密失败：公钥设置有误');
  }
  const publicKey = pki.publicKeyFromPem(pem);
  const encrypted = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5');
  return util.encode64(encrypted);
}