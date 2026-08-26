const variables = ['PORT', 'DATABASE_URL', 'JWT_SECRET']

for (const variable of variables) {
    if (!process.env[variable]) {
        throw new Error(`env ${variable} does not exist`)
    }
}

export const env = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
}
