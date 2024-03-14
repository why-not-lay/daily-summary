export enum RESPONSE_CODE {
  SUCCESS = 0,
  // 没有设置 mocker
  UNSET_MOCKER = -1,
  // 响应数据没有封装
  UNSET_WRAPPER = 0,
}

export enum REQUEST_URL {
  DAILY_LIST_REQ = '/record/get',
  DAILY_OPT_REQ = '/record/getOpts',
  AUTH_USER_REQ = '/auth/user',
}

export const numStr = '0123456789';
export const lowerCaseLetterStr = 'abcdefghijklmnopqrstuvwxyz';
export const upperCaseLetterStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isAllMock = !!(process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK);