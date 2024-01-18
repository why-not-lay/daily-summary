import { useCallback, useEffect, useState } from "react";
import { LVPair } from "../../../types/common";
import { dailyOptReq } from "../../../api/daily-list";

export const useOptions = () => {
  const [statusOptions, setStatusOptions] = useState<LVPair<string>[]>([]);
  const [sourceOptions, setSourceOptions] = useState<LVPair<string>[]>([]);
  
  const getStatusOptions = useCallback(async () => {
    try {
      const resp = await dailyOptReq({
        body: {
          type: 'status'
        }
      });
      const { data, code, msg } = resp;
      if(code === 0) {
        setStatusOptions(data.res.map(status => ({
          label: status,
          value: status,
        })));
      } else {
        console.error(msg);
      }
    } catch (error) {
      console.error(error)
    }
  }, []);

  const getSourceOptions = useCallback(async () => {
    try {
      const resp = await dailyOptReq({
        body: {
          type: 'source'
        }
      });
      const { data, code, msg } = resp;
      if(code === 0) {
        setSourceOptions(data.res.map(source => ({
          label: source,
          value: source,
        })));
      } else {
        console.error(msg);
      }
    } catch (error) {
      console.error(error)
    }
  }, []);

  useEffect(() => {
    getSourceOptions();
    getStatusOptions();
  }, [getSourceOptions, getStatusOptions])

  return {
    statusOptions,
    sourceOptions,
  }
}