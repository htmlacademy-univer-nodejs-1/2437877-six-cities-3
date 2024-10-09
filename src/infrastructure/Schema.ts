import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

interface ConfigSchema {
  env: string;
  port: number;
  dbip: string;
  salt: string;
}

const innerConfig = convict<ConfigSchema>({
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


innerConfig.validate({ allowed: 'strict' });

export const config = {
  env: innerConfig.get('env'),
  port: innerConfig.get('port'),
  dbip: innerConfig.get('dbip'),
  salt: innerConfig.get('salt')
};
