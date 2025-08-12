import { prisma } from '../utils/prisma'
import { broadcastListingUpdate, broadcastNewBid } from '../sockets/listings.socket'

export const createListing = async (data) => {
  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency || 'ETH',
      sellerId: data.sellerId,
      metadataUri: data.metadataUri,
      status: 'ACTIVE'
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          wallet: true
        }
      }
    }
  })

  return listing
}

export const getListingById = async (id) => {
  return await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          wallet: true
        }
      },
      bids: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
              wallet: true
            }
          }
        }
      }
    }
  })
}

export const placeBid = async (listingId, bidderId, amount) => {
  const bid = await prisma.bid.create({
    data: {
      listingId,
      bidderId,
      amount
    },
    include: {
      bidder: {
        select: {
          id: true,
          name: true,
          wallet: true
        }
      }
    }
  })

  // Broadcast new bid to all subscribers
  broadcastNewBid(io, listingId, bid)

  // Update listing with new highest bid if applicable
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      price: {
        set: Math.max(amount, await getCurrentPrice(listingId))
      }
    }
  })

  broadcastListingUpdate(io, listingId, {
    price: listing.price
  })

  return bid
}

const getCurrentPrice = async (listingId) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { price: true }
  })
  return listing?.price || 0
}