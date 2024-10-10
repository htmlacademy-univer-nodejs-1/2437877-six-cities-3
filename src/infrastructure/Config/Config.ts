import convict from 'convict';
import validator from 'convict-format-with-validator';
import { IConfig } from './IConfig.js';
import {injectable} from 'inversify';

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
        default: 'FIWUIUWUGUOYY423423',
        env: 'SALT'
      }
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
}
