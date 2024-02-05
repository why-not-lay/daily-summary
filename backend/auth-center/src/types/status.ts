export enum STATUS {
  /**
   * 成功
   */
  SUCCESS = 0,
  /**
   * 错误
   */
  // 未知错误
  ERROR_UNKNOWN = -1,
  // 非白名单 ip
  ERROR_NOT_WHITE_LIST = -2,
  // 请求参数/body有误
  ERROR_REQ_BODY_PARAMS = -3,
  // 请求方法有误
  ERROR_REQ_METHOD = -4,
  // 不支持请求方法
  ERROR_NOT_SUPPORT_METHOD = -5,
  // 服务器错误
  ERROR_SERVER = -6,
  // body 为空
  ERROR_EMPTY_BODY = -7,
  // 内容长度不合
  ERROR_CONTENT_LENGTH = -8,
  // 媒体类型有误
  ERROR_MEDIA_TYPE = -9,
  // 未找到资源
  ERROR_NOT_FOUND = -10,
  // 解密失败
  ERROR_DECRYPT = -11,
  // 未通过认证
  ERROR_AUTH = -12,
  // 加密失败
  ERROR_ENCRYPT = -13
}