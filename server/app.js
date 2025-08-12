import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/auth.routes'
import listingsRoutes from './routes/listings.routes'
import errorHandler from './middlewares/error'
import { initSocket } from './sockets/listings.socket'
import { connectRedis } from './utils/redis'
import rateLimiter from './middlewares/rateLimiter'

const app = express()
const httpServer = createServer(app)

// Redis connection
connectRedis()

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
})

// Middlewares
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(rateLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingsRoutes)

// Error handling
app.use(errorHandler)

// Socket.io initialization
initSocket(io)

export { httpServer as server }