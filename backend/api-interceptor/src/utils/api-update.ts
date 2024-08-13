import { Knex } from "knex"
import { API_FLAGS, ApiOriginPair, ApiRecord } from "../types/define";
import { config } from "../config";

const TABLE = 'apis';

const apiUpdator = (knex: Knex) => {

  const updateApis = async (pairs: ApiOriginPair[]) => {
    const targetFlag = API_FLAGS.BASE;
    const updates: ApiRecord[] = pairs.map(pair => ({
      ...pair,
      flag: targetFlag,
      update_time: Date.now(),
      create_time: Date.now(),
    }));
    await knex(TABLE).insert(updates).onConflict('api').merge(['origin', 'update_time', 'flag']);
  } 

  const removeApis = async (origins: string[]) => {
    origins = origins.map(origin => origin.replace(config.detect.api, ''));
    const targetFlag = API_FLAGS.DEL;
    const updates = {
      flag: targetFlag,
      update_time: Date.now(),
    }
    await knex(TABLE).update(updates).whereIn('origin', origins);
  }

  const getPair = async (api: string) => {
    const targetFlag = API_FLAGS.BASE;
    const condition = {
      api,
      flag: targetFlag,
    };
    const records = await knex(TABLE).select('api', 'origin').where(condition);
    const target = records.find(record => record.api === api);
    return target;
  };

  return {
    getPair,
    updateApis,
    removeApis,
  }
}

export {
  apiUpdator,
}