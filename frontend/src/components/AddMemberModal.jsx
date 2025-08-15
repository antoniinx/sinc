import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Search } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function AddMemberModal({ groupId, onClose, onAdded }) {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const searchQuery = watch('search')

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await api.get(`/contacts/search?q=${query}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddMember = async (userId) => {
    setLoading(true)
    try {
      await api.post(`/groups/${groupId}/members`, { userId })
      onAdded()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při přidávání člena')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Přidat člena do skupiny
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 glass-button rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat uživatele
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                {...register('search')}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10"
                placeholder="Zadejte jméno nebo email"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searching && (
              <div className="text-center py-4 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2">Vyhledávání...</p>
              </div>
            )}
            
            {!searching && searchResults.length > 0 && (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id)}
                    disabled={loading}
                    className="btn btn-primary text-sm"
                  >
                    {loading ? 'Přidávání...' : 'Přidat'}
                  </button>
                </div>
              ))
            )}
            
            {!searching && searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nebyli nalezeni žádní uživatelé
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="glass-button px-4 py-2 rounded-lg"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
