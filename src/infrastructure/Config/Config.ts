import convict from 'convict';
import validator from 'convict-format-with-validator';
import { IConfig } from './IConfig.js';
import {injectable} from 'inversify';

import * as dotenv from 'dotenv';
import path from 'node:path';
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

convict.addFormats(validator);

@injectable()
export class Config implements IConfig{
  innerConfig: convict.Config<IConfig>;

  constructor() {
    this.innerConfig = convict<IConfig>({
      env: {
        doc: 'The application environment.',
        format: ['production', 'development'],
        default: 'development',
        env: 'NODE_ENV'
      },
      port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 5050,
        env: 'PORT'
      },
      dbip: {
        doc: 'Database IP address.',
        format: 'ipaddress',
        default: '127.0.0.1',
        env: 'DBIP'
      },
      salt: {
        doc: 'Salt for passwords.',
        format: String,
        default: '',
        env: 'SALT'
      },
      DB_USER: {
        doc: 'Username to connect to the database',
        format: String,
        env: 'DB_USER',
        default: '',
      },
      DB_PASSWORD: {
        doc: 'Password to connect to the database',
        format: String,
        env: 'DB_PASSWORD',
        default: '',
      },
      DB_PORT: {
        doc: 'Port to connect to the database (MongoDB)',
        format: 'port',
        env: 'DB_PORT',
        default: '27017',
      },
      DB_NAME: {
        doc: 'Database name (MongoDB)',
        format: String,
        env: 'DB_NAME',
        default: 'buy-and-sell'
      },
      UPLOAD_DIR: {
        doc: 'Dir for static files',
        format: String,
        env: 'UPLOAD_DIR',
        default: 'statics',
      },
    });


    this.innerConfig.validate({ allowed: 'strict' });
  }

  get env(): string {
    return this.innerConfig.get('env');
  }

  get port(): number {
    return this.innerConfig.get('port');
  }

  get dbip(): string {
    return this.innerConfig.get('dbip');
  }

  get salt(): string {
    return this.innerConfig.get('salt');
  }

  get DB_NAME(): string {
    return this.innerConfig.get('DB_NAME');
  }

  get DB_USER(): string {
    return this.innerConfig.get('DB_USER');
  }

  get DB_PASSWORD(): string {
    return this.innerConfig.get('DB_PASSWORD');
  }

  get DB_PORT(): string {
    return this.innerConfig.get('DB_PORT');
  }

  get UPLOAD_DIR(): string {
    return this.innerConfig.get('UPLOAD_DIR');
  }
}
