import convict from 'convict'

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['prod', 'dev', 'test'],
    env: 'NODE_ENV',
    default: 'dev',
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    env: 'PORT',
    default: '',
  },
  logLevel: {
    doc: 'Loggon level',
    format: ['debug', 'info', 'warn', 'error'],
    env: 'LOG_LEVEL',
    default: '',
  },
  db: {
    host: {
      doc: 'Database host name',
      format: String,
      env: 'DB_HOST',
      default: '',
      sensitive: true,
    },
    database: {
      doc: 'Database name',
      format: String,
      env: 'DB_DATABASE',
      default: 'recipebible',
      sensitive: true,
    },
    username: {
      doc: 'Database username',
      format: String,
      env: 'DB_USERNAME',
      default: 'postgres',
      sensitive: true,
    },
    password: {
      doc: 'Database password',
      format: String,
      env: 'DB_PASSWORD',
      default: '',
      sensitive: true,
    },
    port: {
      doc: 'Database port',
      format: 'port',
      env: 'DB_PORT',
      default: '5432',
      sensitive: true,
    },
  },
})

const env = process.env.NODE_ENV || config.get('env')
config.loadFile('./config/' + env + '.json')
config.validate({ allowed: 'strict' })

export default config

export type Config = typeof config
