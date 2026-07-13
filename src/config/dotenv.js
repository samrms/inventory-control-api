const envVarible = process.env

const varibles = ['PORT']

for (const varible of varibles) {
  if (!envVarible[varible]) {
    throw new Error('env varible does not exits')
  }
}

export const env = {
  port: process.env.PORT,
}
