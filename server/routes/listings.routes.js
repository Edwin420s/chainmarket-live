import express from 'express'
import {
  createListing,
  getListings,
  getListingById,
  placeBid,
  updateListing,
  deleteListing
} from '../controllers/listings.controller'
import authenticate from '../middlewares/auth'
import upload from '../middlewares/upload'
import validate from '../middlewares/validate'
import {
  createListingSchema,
  updateListingSchema,
  placeBidSchema
} from '../validations/listings.validation'

const router = express.Router()

router.get('/', getListings)
router.get('/:id', getListingById)

router.use(authenticate)

router.post('/', upload.single('file'), validate(createListingSchema), createListing)
router.put('/:id', validate(updateListingSchema), updateListing)
router.delete('/:id', deleteListing)
router.post('/:id/bid', validate(placeBidSchema), placeBid)

export default router
