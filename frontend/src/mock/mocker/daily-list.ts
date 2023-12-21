import { FetcherParams } from "../../types/common"
import { generateRandomId, responseWrapper } from "../../utils/common";
const SOURCE_TYPES = [
  'browser: chrome',
  'mobile: android',
  'app: windows',
  'app: linux',
];

const ACTION_TYPES =  [
  'chrome: start',
  'chrome: keep',
  'chrome: end',
  'link1: start',
  'link1: keep',
  'link1: end',
];

const generateData = () => {
  const total = 100;
  const totalData = new Array(total).fill(0).map(() => ({
    id: generateRandomId(),
    source: SOURCE_TYPES[Math.floor(Math.random() * SOURCE_TYPES.length)],
    action: ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)],
    createTime: Date.now(),
  }));

  const getData = (
    pageSize: number,
    pageNum: number,
    filterConfig?: {
      id?: string,
      source?: string,
      action?: string,
      createTimeStart?: number,
      createTimeEnd?: number,
    }
  ) => {
    const { id, source, action, createTimeStart, createTimeEnd } = filterConfig ?? {};
    console.log(filterConfig)
    const filterData = totalData.filter(row => (
      (!id || row.id === id)
      && (!source || row.source === source)
      && (!action || row.action === action)
      && (!createTimeStart || !createTimeEnd || (createTimeStart! <= row.createTime && createTimeEnd >= row.createTime))
    ));
    const offset = (pageNum - 1) * pageSize;
    const records = filterData.slice(offset, offset + pageSize);
    return {
      records,
      total: filterData.length,
    }
  }

  return getData;
}

const getData = generateData();

export const dailyListMocker = async (fetcherParams?: FetcherParams) => {
  const { params = {} } = fetcherParams ?? {};
  const { pageSize = 20, pageNum = 1 } = params;
  const data = getData(pageSize, pageNum, params);
  return responseWrapper(data);
}