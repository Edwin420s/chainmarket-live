import { getListingById } from '../controllers/listings.controller'
import logger from '../utils/logger'

export function initSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    socket.on('join_listing', async ({ listingId }) => {
      try {
        socket.join(`listing_${listingId}`)
        logger.info(`Socket ${socket.id} joined listing ${listingId}`)

        // Send current listing state to new subscriber
        const listing = await getListingById(listingId)
        socket.emit('listing_state', listing)
      } catch (error) {
        logger.error(`Error joining listing room: ${error.message}`)
        socket.emit('error', { message: 'Failed to join listing' })
      }
    })

    socket.on('leave_listing', ({ listingId }) => {
      socket.leave(`listing_${listingId}`)
      logger.info(`Socket ${socket.id} left listing ${listingId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })
}

export function broadcastListingUpdate(io, listingId, updateData) {
  io.to(`listing_${listingId}`).emit('listing_update', updateData)
}

export function broadcastNewBid(io, listingId, bid) {
  io.to(`listing_${listingId}`).emit('new_bid', bid)
}