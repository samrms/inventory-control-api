const envVarible = process.env

const varibles = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_URL',
]

for (const varible of varibles) {
  if (!envVarible[varible]) {
    throw new Error(`env ${varible} does not exits`)
  }
}

export const env = {
  port: process.env.PORT,
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  db_url: process.env.DB_URL,
}
