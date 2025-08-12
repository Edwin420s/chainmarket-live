import { server } from './app'
import { prisma } from './utils/prisma'
import logger from './utils/logger'

const PORT = process.env.PORT || 4000

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...')
  await prisma.$disconnect()
  server.close(() => {
    logger.info('Server has been shut down')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})