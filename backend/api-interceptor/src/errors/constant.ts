import { STATUS } from "../types/status.js";
import { ServerError } from "../wrapper/resp.js";

const errorString = {
  UNKNOWN: '未知错误',
  FORBIDDEN: '没有权限',
  REQ_BODY_PARAMS: '参数错误',
  METHOD: '请求方法错误',
  NOT_SUPPORT_METHOD: '不支持请求该请求方法',
  SERVER: '服务器出错',
  EMPTY_BODY: '请求体不能为空',
  CONTENT_LENGTH: '内容长度不符合',
  MEDIA_TYPE: '媒体类型有误',
  NOT_FOUND: '未找到资源',
  DECRYPT: '数据解密失败',
  AUTH: '未通过认证',
}

export const errorMapping: Record<string, ServerError & { statusCode: number, type: string }> = {
  // 未知错误
  ERROR_UNKNOWN: {
    statusCode: 500,
    type: 'ERROR_UNKNOWN',
    code: STATUS.ERROR_UNKNOWN,
    msg: errorString.UNKNOWN,
  },
  // 非白名单用户
  ERROR_NOT_WHITE_LIST: {
    statusCode: 403,
    type: 'ERROR_NOT_WHITE_LIST',
    code: STATUS.ERROR_NOT_WHITE_LIST,
    msg: errorString.FORBIDDEN,
  },
  // 请求参数/body有误
  ERROR_REQ_BODY_PARAMS: {
    statusCode: 400,
    type: 'ERROR_REQ_BODY_PARAMS',
    code: STATUS.ERROR_REQ_BODY_PARAMS,
    msg: errorString.REQ_BODY_PARAMS,
  },
  FST_ERR_VALIDATION: {
    statusCode: 400,
    type: 'FST_ERR_VALIDATION',
    code: STATUS.ERROR_REQ_BODY_PARAMS,
    msg: errorString.REQ_BODY_PARAMS,
  },
  // 请求方法有误
  FST_ERR_ROUTE_METHOD_INVALID: {
    statusCode: 400,
    type: 'FST_ERR_ROUTE_METHOD_INVALID',
    code: STATUS.ERROR_REQ_METHOD,
    msg: errorString.METHOD,
  },
  // 不支持该请求方法
  FST_ERR_ROUTE_METHOD_NOT_SUPPORTED: {
    statusCode: 400,
    type: 'FST_ERR_ROUTE_METHOD_NOT_SUPPORTED',
    code: STATUS.ERROR_NOT_SUPPORT_METHOD,
    msg: errorString.NOT_SUPPORT_METHOD,
  },
  // 服务器出错
  ERROR_SERVER: {
    statusCode: 503, 
    type: 'ERROR_SERVER',
    code: STATUS.ERROR_SERVER,
    msg: errorString.SERVER,
  },
  // 请求体为空
  FST_ERR_CTP_EMPTY_JSON_BODY: {
    statusCode: 400,
    type: 'FST_ERR_CTP_EMPTY_JSON_BODY',
    code: STATUS.ERROR_EMPTY_BODY,
    msg: errorString.EMPTY_BODY,
  },
  // 内容长度不符合
  FST_ERR_CTP_INVALID_CONTENT_LENGTH: {
    statusCode: 400,
    type: 'FST_ERR_CTP_INVALID_CONTENT_LENGTH',
    code: STATUS.ERROR_CONTENT_LENGTH,
    msg: errorString.CONTENT_LENGTH,
  },
  // 媒体类型有误
  FST_ERR_CTP_INVALID_MEDIA_TYPE: {
    statusCode: 400,
    type: 'FST_ERR_CTP_INVALID_MEDIA_TYPE',
    code: STATUS.ERROR_MEDIA_TYPE,    
    msg: errorString.MEDIA_TYPE,
  },
  // 未找到资源
  ERROR_NOT_FOUND: {
    statusCode: 404,
    type: 'ERROR_NOT_FOUND',
    code: STATUS.ERROR_NOT_FOUND,
    msg: errorString.NOT_FOUND,
  },
  FST_ERR_NOT_FOUND: {
    statusCode: 404,
    type: 'FST_ERR_NOT_FOUND',
    code: STATUS.ERROR_NOT_FOUND,
    msg: errorString.NOT_FOUND,
  },
  // 数据解密失败
  ERROR_DECRYPT: {
    statusCode: 503,
    type: 'ERROR_DECRYPT',
    code: STATUS.ERROR_DECRYPT,
    msg: errorString.DECRYPT,
  },
  // 未通过认证
  ERROR_AUTH: {
    statusCode: 403,
    type: 'ERROR_AUTH',
    code: STATUS.ERROR_AUTH,
    msg: errorString.AUTH,
  },
}