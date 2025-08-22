import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Users, UserPlus, UserMinus, Crown, Shield, User, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function EditGroupModal({ group, onClose, onUpdated, onDeleted, userRole }) {
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm()

  useEffect(() => {
    if (group) {
      console.log('Loading group data:', group)
      console.log('is_public from group:', group.is_public, 'type:', typeof group.is_public)
      setValue('name', group.name)
      setValue('description', group.description || '')
      setValue('color', group.color || '#3B82F6')
      const isPublicValue = Boolean(group.is_public)
      setValue('isPublic', isPublicValue)
      console.log('Set isPublic to:', isPublicValue, 'from:', group.is_public)
      loadMembers()
    }
  }, [group, setValue])

  const loadMembers = async () => {
    try {
      const response = await api.get(`/groups/${group.id}`)
      console.log('Loaded group data from API:', response.data)
      setMembers(response.data.members || [])
    } catch (error) {
      toast.error('Chyba při načítání členů skupiny')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Always send isPublic explicitly, even if false
      const updateData = {
        name: data.name,
        description: data.description,
        color: data.color,
        isPublic: Boolean(data.isPublic)
      }
      console.log('Sending group update data:', updateData)
      console.log('isPublic value:', updateData.isPublic, 'type:', typeof updateData.isPublic)
      const response = await api.put(`/groups/${group.id}`, updateData)
      console.log('Response from server:', response.data)
      console.log('is_public from response:', response.data.is_public, 'type:', typeof response.data.is_public)
      
      // Update the local group data with the response
      const updatedGroup = { ...group, ...response.data }
      onUpdated(updatedGroup)
      toast.success('Skupina byla úspěšně aktualizována')
    } catch (error) {
      console.error('Group update error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Chyba při aktualizaci skupiny')
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await api.get(`/contacts/search?q=${query}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const addMember = async (userId) => {
    try {
      await api.post(`/groups/${group.id}/members`, { userId })
      toast.success('Člen byl přidán do skupiny')
      loadMembers()
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při přidávání člena')
    }
  }

  const removeMember = async (userId) => {
    try {
      await api.delete(`/groups/${group.id}/members/${userId}`)
      toast.success('Člen byl odebrán ze skupiny')
      loadMembers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při odebírání člena')
    }
  }

  const updateMemberRole = async (userId, newRole) => {
    try {
      await api.put(`/groups/${group.id}/members/${userId}/role`, { role: newRole })
      toast.success('Role člena byla aktualizována')
      loadMembers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při aktualizaci role')
    }
  }

  const handleDeleteGroup = async () => {
    if (window.confirm('Opravdu chcete smazat tuto skupinu? Tato akce je nevratná.')) {
      try {
        await api.delete(`/groups/${group.id}`)
        onDeleted(group.id)
        toast.success('Skupina byla smazána')
      } catch (error) {
        toast.error(error.response?.data?.error || 'Chyba při mazání skupiny')
      }
    }
  }

  const handleLeaveGroup = async () => {
    if (window.confirm('Opravdu chcete opustit tuto skupinu?')) {
      try {
        await api.post(`/groups/${group.id}/leave`)
        onClose()
        toast.success('Opustili jste skupinu')
      } catch (error) {
        toast.error(error.response?.data?.error || 'Chyba při opouštění skupiny')
      }
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return (
          <div className="w-8 h-8 bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">
            <Crown className="h-4 w-4" />
          </div>
        )
      case 'admin':
        return (
          <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            <Shield className="h-4 w-4" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            <User className="h-4 w-4" />
          </div>
        )
    }
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'owner': return 'Vlastník'
      case 'admin': return 'Správce'
      default: return 'Člen'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nastavení skupiny</h2>
              <p className="text-sm text-blue-100 font-medium">{group?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userRole === 'owner' && (
              <button
                onClick={handleDeleteGroup}
                className="w-8 h-8 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                title="Smazat skupinu"
              >
                <Trash2 className="h-4 w-4 text-white font-bold" />
              </button>
            )}
            {userRole === 'member' && (
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 border-2 border-red-700 font-bold text-white transition-colors"
              >
                Opustit
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white font-bold" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Základní informace - pouze pro vlastníky */}
            {userRole === 'owner' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Základní informace</h3>
              
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                    Název skupiny
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { 
                      required: 'Název skupiny je povinný',
                      minLength: {
                        value: 2,
                        message: 'Název musí mít alespoň 2 znaky'
                      }
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                    Popis skupiny
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium resize-none"
                    rows="3"
                    placeholder="Volitelný popis skupiny"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Barva skupiny
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { value: '#3B82F6', name: 'Modrá' },
                      { value: '#EF4444', name: 'Červená' },
                      { value: '#10B981', name: 'Zelená' },
                      { value: '#F59E0B', name: 'Oranžová' },
                      { value: '#8B5CF6', name: 'Fialová' },
                      { value: '#EC4899', name: 'Růžová' },
                      { value: '#06B6D4', name: 'Cyan' },
                      { value: '#84CC16', name: 'Lime' },
                      { value: '#F97316', name: 'Tmavě oranžová' },
                      { value: '#6366F1', name: 'Indigo' }
                    ].map((color) => (
                      <label
                        key={color.value}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={color.value}
                          {...register('color')}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-10 border-2 transition-all ${
                            watch('color') === color.value
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs text-gray-600 mt-1 font-medium">{color.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isPublic')}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-gray-900">
                      Veřejná skupina
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Veřejné skupiny jsou viditelné pro všechny uživatele a mohou se k nim připojit bez pozvánky.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700 font-bold text-white transition-colors"
                  >
                    {loading ? 'Ukládání...' : 'Uložit změny'}
                  </button>
                </div>
              </form>
            )}

            {/* Správa členů - pro adminy a vlastníky */}
            {(userRole === 'admin' || userRole === 'owner') && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Členové skupiny
                </h3>

                {/* Přidání nového člena */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Přidat nového člena
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-medium"
                      placeholder="Hledat uživatele..."
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="border-2 border-gray-200 p-3 space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-2 border-gray-100 transition-colors">
                          <div>
                            <p className="text-sm font-bold">{user.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addMember(user.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 border-2 border-purple-700 font-bold text-white transition-colors flex items-center"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Přidat
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seznam členů */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Současní členové ({members.length})
                  </label>
                  <div className="border-2 border-gray-200 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2 p-3">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0">
                            {getRoleIcon(member.role)}
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{member.name}</p>
                              <p className="text-xs text-gray-500 truncate font-medium">{member.email}</p>
                              <p className="text-xs text-gray-400 font-medium">{getRoleText(member.role)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {member.role !== 'owner' && userRole === 'owner' && (
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                className="px-3 py-2 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium text-sm"
                              >
                                <option value="member">Člen</option>
                                <option value="admin">Správce</option>
                              </select>
                            )}
                            {member.role !== 'owner' && (
                              <button
                                type="button"
                                onClick={() => removeMember(member.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 border-2 border-red-700 font-bold text-white transition-colors flex items-center"
                                title="Odebrat člena"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Odebrat
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zobrazení členů pro všechny role */}
            {userRole === 'member' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Členové skupiny
                </h3>
                <div className="border-2 border-gray-200 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2 p-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          {getRoleIcon(member.role)}
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate font-medium">{member.email}</p>
                            <p className="text-xs text-gray-400 font-medium">{getRoleText(member.role)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
