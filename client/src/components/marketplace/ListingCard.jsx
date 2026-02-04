import { Link } from 'react-router-dom'
import { formatEther } from 'ethers/lib/utils'

export default function ListingCard({ listing }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <Link to={`/listings/${listing.id}`}>
        <div className="relative pb-[100%] bg-gray-700">
          {listing.metadata?.image && (
            <img 
              src={listing.metadata.image} 
              alt={listing.title}
              className="absolute h-full w-full object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
          <p className="text-gray-400 text-sm truncate">{listing.description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-blue-400 font-bold">
              {formatEther(listing.price)} ETH
            </span>
            <span className="text-sm text-gray-500">
              {listing.bids?.length || 0} bids
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
