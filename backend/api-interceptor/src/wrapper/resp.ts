export const RespWrapper = {
  info(code: number, data: any, msg?: string) {
    return {
      code,
      data,
      msg: msg ?? null
    }
  },
  success(data: any) {
    return this.info(0, data, 'success');
  },
}
