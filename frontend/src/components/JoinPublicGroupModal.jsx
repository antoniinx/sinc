import { useState, useEffect } from 'react'
import { X, Search, Users, User } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function JoinPublicGroupModal({ onClose, onJoined }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    searchGroups()
  }, [searchTerm])

  const searchGroups = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/groups/search/public?q=${encodeURIComponent(searchTerm)}`)
      setGroups(response.data)
    } catch (error) {
      console.error('Error searching groups:', error)
      toast.error('Chyba při vyhledávání skupin')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId) => {
    setJoining(groupId)
    try {
      const response = await api.post(`/groups/${groupId}/join`)
      toast.success('Úspěšně jste se připojili ke skupině!')
      onJoined(response.data)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při připojování ke skupině')
    } finally {
      setJoining(null)
    }
  }

  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Najít a připojit se ke skupině
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 glass-button rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-hidden">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Hledat veřejné skupiny..."
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Načítání...</div>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">
                  {searchTerm ? 'Žádné skupiny nenalezeny' : 'Zadejte název skupiny pro vyhledávání'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: group.color }}
                          />
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Vlastník: {group.owner_name}</span>
                          </div>
                          <div>
                            Vytvořeno: {new Date(group.created_at).toLocaleDateString('cs-CZ')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={joining === group.id}
                        className="btn btn-primary btn-sm ml-4"
                      >
                        {joining === group.id ? 'Připojování...' : 'Připojit se'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
