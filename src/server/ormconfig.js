require('dotenv').config();

const {
  DB_NAME,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_PORT,
} = process.env;

module.exports = {
  type: 'postgres',
  database: DB_NAME,
  host: DB_HOST,
  username: DB_USER,
  password: DB_PASS,
  port: +DB_PORT,
  seeds: ['src/server/seeds/**/*.seed.ts'],
  factories: ['src/server/seeds/factories/**/*.factory.ts'],
  entities: ['src/server/**/*.entity.ts'],
  migrations: ['src/server/migrations/*.ts'],
  synchronize: false,
  logging: false,
  migrationsRun: true,
  cli: {
    migrationsDir: 'src/server/migrations',
  },
};
