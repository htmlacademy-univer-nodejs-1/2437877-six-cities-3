import 'dotenv/config.js';
import {isIP} from 'is-ip';

export const Environments = {
  PORT: Number(process.env.PORT),
  IP: isIP(process.env.DBIP ?? '') ? process.env.DBIP : undefined,
  SALT: process.env.SALT
};

if(Environments.IP == undefined){
  throw new Error('Invalid database ip');
}
