import { REQUEST_URL } from "../constant/common"
import { FetcherParams } from "../types/common"
import { request } from "../utils/request"

interface UserAuthData {
  tokenId: string,
  token: string,
}

export const authUserReq = (fetcherParams?: FetcherParams<{password: string, username: string}>, isMock = false) => {
  return request<UserAuthData>({
    isMock,
    method: 'POST',
    url: REQUEST_URL.AUTH_USER_REQ,
    body: fetcherParams?.body,
  });
}