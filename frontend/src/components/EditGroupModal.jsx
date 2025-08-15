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

  const updateMemberRole = async (userId, role) => {
    try {
      await api.put(`/groups/${group.id}/members/${userId}/role`, { role })
      toast.success('Role člena byla aktualizována')
      loadMembers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při aktualizaci role')
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm('Opravdu chcete smazat tuto skupinu? Tato akce je nevratná.')) {
      return
    }

    try {
      await api.delete(`/groups/${group.id}`)
      toast.success('Skupina byla smazána')
      onDeleted?.(group.id)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při mazání skupiny')
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm('Opravdu chcete opustit tuto skupinu?')) {
      return
    }

    try {
      await api.post(`/groups/${group.id}/leave`)
      toast.success('Skupina byla opuštěna')
      onDeleted?.(group.id)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při opouštění skupiny')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Vlastník'
      case 'admin':
        return 'Správce'
      default:
        return 'Člen'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40"></div>
      <div className="relative bg-white border border-gray-200 rounded-none w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-900">
            {userRole === 'owner' ? 'Upravit skupinu' : userRole === 'admin' ? 'Spravovat skupinu' : 'Zobrazit skupinu'}: {group?.name}
          </h2>
                     <div className="flex items-center gap-2">
             {(userRole === 'owner' || userRole === 'admin') && (
               <button
                 onClick={handleDeleteGroup}
                 className="btn btn-danger btn-sm inline-flex items-center"
                 title="Smazat skupinu"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
             )}
             {userRole === 'member' && (
               <button
                 onClick={handleLeaveGroup}
                 className="btn btn-outline btn-sm inline-flex items-center"
                 title="Opustit skupinu"
               >
                 Opustit
               </button>
             )}
             <button onClick={onClose} className="btn btn-ghost btn-nav"><X className="h-5 w-5" /></button>
           </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Základní informace - pouze pro vlastníky */}
            {userRole === 'owner' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-md font-extrabold text-gray-900">Základní informace</h3>
              
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
                  className="input"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                 <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                  Popis skupiny
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="input"
                  rows="3"
                  placeholder="Volitelný popis skupiny"
                />
              </div>

                             <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                   Barva skupiny
                 </label>
                 <div className="grid grid-cols-5 gap-2">
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
                         className={`w-8 h-8 rounded-none border-2 transition-all ${
                           watch('color') === color.value
                             ? 'border-gray-800 scale-110'
                             : 'border-gray-300 hover:border-gray-400'
                         }`}
                         style={{ backgroundColor: color.value }}
                       />
                       <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                     </label>
                   ))}
                 </div>
               </div>

                               <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isPublic')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-gray-900">
                      Veřejná skupina {watch('isPublic') ? '(zaškrtnuto)' : '(nezaškrtnuto)'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Veřejné skupiny jsou viditelné pro všechny uživatele a mohou se k nim připojit bez pozvánky.
                  </p>
                </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? 'Ukládání...' : 'Uložit změny'}
                </button>
              </div>
            </form>
            )}

            {/* Správa členů - pro adminy a vlastníky */}
            {(userRole === 'admin' || userRole === 'owner') && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Členové skupiny
              </h3>

              {/* Přidání nového člena */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">
                  Přidat nového člena
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="input flex-1"
                    placeholder="Hledat uživatele..."
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    <button
                      type="button"
                      onClick={() => addMember(user.id)}
                      className="btn btn-sm btn-primary"
                    >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seznam členů */}
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-900">
                  Současní členové ({members.length})
                </label>
                <div className="bg-gray-50 p-0 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-white border">
                        <div className="flex items-center space-x-2 min-w-0">
                          {getRoleIcon(member.role)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.role !== 'owner' && userRole === 'owner' && (
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className="text-xs border px-2 py-1 max-w-[110px]"
                            >
                              <option value="member">Člen</option>
                              <option value="admin">Správce</option>
                            </select>
                          )}
                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              onClick={() => removeMember(member.id)}
                              className="btn btn-danger btn-sm inline-flex items-center"
                              title="Odebrat člena"
                            >
                              <UserMinus className="h-4 w-4" />
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
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Členové skupiny
                </h3>
                <div className="bg-gray-50 p-0 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-white border">
                        <div className="flex items-center space-x-2 min-w-0">
                          {getRoleIcon(member.role)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap"></span>
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
