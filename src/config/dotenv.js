const envVarible = process.env

const varibles = ['PORT', 'DB_URL']

for (const varible of varibles) {
  if (!envVarible[varible]) {
    throw new Error(`env ${varible} does not exits`)
  }
}

export const env = {
  port: process.env.PORT,
  db_url: process.env.DB_URL,
}
