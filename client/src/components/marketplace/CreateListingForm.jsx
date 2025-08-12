import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useWeb3Store } from '../../stores/web3Store'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import FileUpload from '../ui/FileUpload'

export default function CreateListingForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const { contract, account } = useWeb3Store()
  const { token } = useAuthStore()
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please upload an image')
      return
    }
    if (!contract || !account) {
      toast.error('Please connect your wallet')
      return
    }

    setIsLoading(true)
    
    try {
      // 1. Upload to IPFS via backend
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('price', data.price)
      formData.append('currency', 'ETH')

      const response = await api.post('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      const { metadataUri, id } = response.data

      // 2. Create on-chain listing
      const tx = await contract.listItem(
        process.env.VITE_NFT_CONTRACT_ADDRESS,
        id, // Using DB ID as tokenId for simplicity
        ethers.utils.parseEther(data.price.toString()),
        metadataUri
      )
      
      await tx.wait()
      
      toast.success('Listing created successfully!')
      reset()
      setFile(null)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create listing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title
        </label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Price (ETH)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          {...register('price', { 
            required: 'Price is required',
            min: { value: 0.01, message: 'Price must be at least 0.01 ETH' }
          })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Image
        </label>
        <FileUpload 
          accept="image/*" 
          onChange={setFile}
          maxSize={5 * 1024 * 1024} // 5MB
        />
        {!file && (
          <p className="mt-1 text-sm text-red-500">Image is required</p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
      >
        Create Listing
      </Button>
    </form>
  )
}