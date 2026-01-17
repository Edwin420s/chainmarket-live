import { createListing, getListings, getListingById } from '../models/Listing'
import { uploadToIPFS } from '../services/ipfs'
import { broadcastListingUpdate } from '../sockets/listings.socket'

export const createListing = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const ipfsHash = await uploadToIPFS(req.file.buffer, req.file.originalname)
    const metadataUri = `ipfs://${ipfsHash}`

    const listing = await createListing({
      ...req.body,
      sellerId: req.user.id,
      metadataUri
    })

    broadcastListingUpdate(req.io, listing.id, listing)
    res.status(201).json(listing)
  } catch (error) {
    next(error)
  }
}

export const getActiveListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const listings = await getListings({
      status: 'ACTIVE',
      page: parseInt(page),
      limit: parseInt(limit)
    })
    res.json(listings)
  } catch (error) {
    next(error)
  }
}
