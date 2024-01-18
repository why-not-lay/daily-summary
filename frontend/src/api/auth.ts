import { REQUEST_URL } from "../constant/common"
import { FetcherParams } from "../types/common"
import { request } from "../utils/request"

export const authUserReq = (fetcherParams?: FetcherParams<{key: string}>, isMock = false) => {
  return request<null>({
    isMock,
    method: 'POST',
    url: REQUEST_URL.AUTH_USER_REQ,
    body: fetcherParams?.body,
  });
}