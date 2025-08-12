import { create } from 'zustand'
import { ethers } from 'ethers'
import ChainMarketABI from '../../contracts/artifacts/ChainMarket.json'

const useWeb3Store = create((set, get) => ({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  contract: null,
  isConnected: false,
  loading: false,
  error: null,

  connect: async () => {
    set({ loading: true, error: null })
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found')

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const network = await provider.getNetwork()
      
      const contract = new ethers.Contract(
        process.env.VITE_CONTRACT_ADDRESS,
        ChainMarketABI.abi,
        signer
      )

      set({
        provider,
        signer,
        account: accounts[0],
        chainId: network.chainId,
        contract,
        isConnected: true,
        loading: false
      })

      // Set up event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        set({ account: accounts[0] || null, isConnected: accounts.length > 0 })
      })

      window.ethereum.on('chainChanged', (chainId) => {
        set({ chainId: parseInt(chainId, 16) })
        window.location.reload()
      })

      return { provider, signer, account: accounts[0], contract }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  disconnect: () => {
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener('accountsChanged')
      window.ethereum.removeListener('chainChanged')
    }
    set({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      contract: null,
      isConnected: false
    })
  },

  initialize: async () => {
    if (!window.ethereum) return
    if (get().isConnected) return

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        await get().connect()
      }
    } catch (error) {
      console.error('Web3 initialization error:', error)
    }
  },

  switchNetwork: async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error) {
      if (error.code === 4902) {
        throw new Error('Please add this network to your wallet first')
      }
      throw error
    }
  }
}))

export default useWeb3Store