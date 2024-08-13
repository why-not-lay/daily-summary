import { createHash } from "crypto";
import axios from "axios"
import { ApiOriginPair } from "../../src/types/define";
import knex from "knex";
import { publicEncrypt, createDecipheriv, constants as cryptoConstants, createCipheriv } from 'crypto';
import { config } from "../../src/config";

const bind = async (origin: string, pairs: ApiOriginPair[]) => {
  let data = {
    code: -1,
    msg: '',
    data: '',
  }
  try {
    const resp = await axios.post(`${origin}/bind`, {
      pairs,
    });
    data = resp.data;
  } catch (error: any) {
    if (error?.response?.data) {
      data = error.response.data;
    } else {
      console.error(error);
    }
  }
  return data;
}

const login = async (origin: string, username: string, password: string) => {
  const hash = createHash('sha256') .update(password).digest('hex');
  let data = {
    code: -1,
    msg: '',
    data: {
      tid: '',
      token: '',
    },
  };
  try {
    const resp = await axios.post(origin, {
      username,
      password: hash,
    });
    data = resp.data;
  } catch (error: any) {
    if (error.response) {
      data = error.response.data;
    } else {
      console.error(error);
    }
  }
  return data;
}

const createKnex = async (config: {
  host: string,
  port: number,
  password: string,
  user: string,
}) => {
  const { host, port, password, user } = config;
  const db = knex({
    client: 'mysql2',
    connection: {
      host,
      port,
      user,
      password,
      database : 'gateway_db'
    },
  });
  return db;
}

const getRandomBits = (len: number) => {
  const bits = '0123456789abcdefghijklmnopqrstuvwxyz';
  return Array.from({length: len}, () => bits[Math.floor(Math.random() * bits.length)]).join('');
}

const request = async (config: {
  url: string,
  method: string,
  headers?: Record<string, string>,
  body?: any,
  params?: any,
}) => {
  const { url, method, headers, body, params} = config;
  let respData: {code: number, msg: string, data: any} = {
    code: -997,
    data: null,
    msg: 'uninited',
  }
  try {
    const resp = await axios.request({
      url,
      method,
      params,
      headers,
      data: body,
    });
    respData = resp.data;
  } catch (error: any) {
    if (error?.response?.data) {
      respData = error.response.data;
    } else {
      console.error(error);
    }
  }
  return respData;
}


const encryptFromRSA = (data: string) => {
  const encrypted = publicEncrypt({
    key: config.key.public,
    padding: cryptoConstants.RSA_PKCS1_PADDING,
  }, Buffer.from(data, 'utf-8'));
  return encrypted.toString('base64');
}

const decryptFromAES = (data: string, key: string) => {
  const algorithmn = 'aes-256-cbc';
  const decipher = createDecipheriv(algorithmn, Buffer.from(key, 'hex'), config.key.iv);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;  
}

const encryptFromAES = (data: string, key: string) => {
  const algorithmn = 'aes-256-cbc';
  const cipher = createCipheriv(algorithmn, Buffer.from(key, 'hex'), config.key.iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;  
}

const createTempApi = async (tempServerOrigin: string, config: {
  id: string,
  method: string,
  statusCode: number,
  resp: any,
}) => {
  const resp = await axios.post(`${tempServerOrigin}/temp/api/create`, {...config, api: config.id});
  if (resp.data) {
    throw Error(`创建临时接口${config.id}失败`);
  }
  return {
    targetApi: `/temp/${config.id}`,
    stop: async () => {
      await axios.post(`${tempServerOrigin}/temp/api/remove`, {
        api: config.id,
      });
    }
  }
}

export {
  bind,
  login,
  request,
  createKnex,
  getRandomBits,
  encryptFromAES,
  encryptFromRSA,
  decryptFromAES,
  createTempApi,
}