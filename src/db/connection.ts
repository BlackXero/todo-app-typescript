import knex, { Knex } from 'knex';
import knexConfig from '../config/knex';
import { config } from '../config';

const environment = config.nodeEnv === 'production'
  ? 'production'
  : config.nodeEnv === 'test'
  ? 'test'
  : 'development';

const db: Knex = knex(knexConfig[environment]);

export default db;
