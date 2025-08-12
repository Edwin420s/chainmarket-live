import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { useWeb3Store } from './stores/web3Store'
import AppRoutes from './routes'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

function App() {
  const { initialize: initAuth } = useAuthStore()
  const { initialize: initWeb3 } = useWeb3Store()

  useEffect(() => {
    initAuth()
    initWeb3()
  }, [initAuth, initWeb3])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App