import Redis from 'ioredis'
import logger from './logger'

const redis = new Redis(process.env.REDIS_URL)

redis.on('connect', () => {
  logger.info('Connected to Redis')
})

redis.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`)
})

export const connectRedis = () => redis

export default redis