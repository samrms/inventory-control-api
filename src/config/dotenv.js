const envVarible = process.env

const varibles = ['PORT', 'DB_URL']

for (const varible of varibles) {
    if (!envVarible[varible]) {
        const strError = `env ${varible} does not exits`
        throw new Error(strError)
    }
}

export const env = {
    port: process.env.PORT,
    db_url: process.env.DB_URL,
}
