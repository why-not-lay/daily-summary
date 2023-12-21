import { RESPONSE_CODE } from "../constant/common"
import { numStr, lowerCaseLetterStr, upperCaseLetterStr } from "../constant/common"

// 生成随机id
export const generateRandomId = () => {
  const str = `${lowerCaseLetterStr}${numStr}${upperCaseLetterStr}`;
  const len = str.length;
  return [
    'AD',
    new Array(4).fill(0).map(() => str[Math.floor(Math.random() * len)]).join(''),
    new Array(4).fill(0).map(() => str[Math.floor(Math.random() * len)]).join(''),
    new Array(4).fill(0).map(() => str[Math.floor(Math.random() * len)]).join(''),
    new Array(4).fill(0).map(() => str[Math.floor(Math.random() * len)]).join(''),
  ].join('-');
}

// 本地封装数据
export const responseWrapper = (data :any) => {
  return {
    data,
    code: RESPONSE_CODE.UNSET_WRAPPER,
    msg: '',
  }
}