import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
})

// Prisma middleware
prisma.$use(async (params, next) => {
  // Example middleware: measure query performance
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})

export default prisma
