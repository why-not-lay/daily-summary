
export enum ERROR_NAME {
  PAGE_NOT_FOUNT,
  UNKNOWN,
  REQ_QUERY,
  REQ_BODY,
  INTERNAL_SERVER,
  OTHER,
  DATA_READ,
  DATA_WRITE,
  NO_AUTHORITY,
}

type ErrorType = Record<ERROR_NAME, {
  code: number,
  desc: string,
}>

const getCode = (type: ERROR_NAME) => -(type + 1);

export const SERVER_ERRORS: ErrorType = {
  [ERROR_NAME.PAGE_NOT_FOUNT]: {
    code: getCode(ERROR_NAME.PAGE_NOT_FOUNT),
    desc: '页面未找到',
  },
  [ERROR_NAME.UNKNOWN]: {
    code: getCode(ERROR_NAME.UNKNOWN),
    desc: '未知错误',
  },
  [ERROR_NAME.REQ_QUERY]: {
    code: getCode(ERROR_NAME.REQ_QUERY),
    desc: '请求参数有误'
  },
  [ERROR_NAME.REQ_BODY]: {
    code: getCode(ERROR_NAME.REQ_BODY),
    desc: '请求内容有误'
  },
  [ERROR_NAME.INTERNAL_SERVER]: {
    code: getCode(ERROR_NAME.INTERNAL_SERVER),
    desc: '服务器内部出错'
  },
  [ERROR_NAME.OTHER]: {
    code: getCode(ERROR_NAME.OTHER),
    desc: '其他错误'
  },
  [ERROR_NAME.DATA_READ]: {
    code: getCode(ERROR_NAME.DATA_READ),
    desc: '数据读取时出错',
  },
  [ERROR_NAME.DATA_WRITE]: {
    code: getCode(ERROR_NAME.DATA_WRITE),
    desc: '数据写入时出错'
  },
  [ERROR_NAME.NO_AUTHORITY]: {
    code: getCode(ERROR_NAME.NO_AUTHORITY),
    desc: '没有权限'
  }
}
