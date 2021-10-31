import config from './ormconfig';
import { ConnectionOptions } from 'typeorm';

const ormseedconfig: ConnectionOptions = {
  ...config,

  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormseedconfig;
