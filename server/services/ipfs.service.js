import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import logger from '../utils/logger'

const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const INFURA_API_URL = 'https://ipfs.infura.io:5001/api/v0/add'

class IPFSService {
  constructor() {
    this.pinataEnabled = !!process.env.PINATA_API_KEY
    this.infuraEnabled = !!process.env.INFURA_PROJECT_ID
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      if (this.pinataEnabled) {
        return await this._uploadToPinata(fileBuffer, fileName)
      }
      if (this.infuraEnabled) {
        return await this._uploadToInfura(fileBuffer, fileName)
      }
      throw new Error('No IPFS service configured')
    } catch (error) {
      logger.error(`IPFS upload failed: ${error.message}`)
      throw error
    }
  }

  async _uploadToPinata(fileBuffer, fileName) {
    const formData = new FormData()
    formData.append('file', new Blob([fileBuffer]), fileName)

    const response = await axios.post(PINATA_API_URL, formData, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET,
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      }
    })

    return `ipfs://${response.data.IpfsHash}`
  }

  async _uploadToInfura(fileBuffer, fileName) {
    const tempPath = path.join('/tmp', fileName)
    await writeFile(tempPath, fileBuffer)

    const formData = new FormData()
    formData.append('file', fs.createReadStream(tempPath))

    const response = await axios.post(INFURA_API_URL, formData, {
      auth: {
        username: process.env.INFURA_PROJECT_ID,
        password: process.env.INFURA_PROJECT_SECRET
      },
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      }
    })

    await unlink(tempPath)
    return `ipfs://${response.data.Hash}`
  }
}

export default new IPFSService()
