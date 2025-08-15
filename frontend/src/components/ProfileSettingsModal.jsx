import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, User, Mail, Bell, Shield, Users, Settings, Camera, Save, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function ProfileSettingsModal({ user, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm()

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('notifications', user.notifications || true)
    }
  }, [user, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.put('/users/profile', data)
      onUpdated(response.data)
      toast.success('Profil byl úspěšně aktualizován')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při aktualizaci profilu')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('avatar', file)
      try {
        const res = await api.put('/users/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setAvatarPreview(res.data.avatar)
        onUpdated(res.data)
        toast.success('Profilová fotka aktualizována')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Chyba při nahrávání profilové fotky')
      }
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Oznámení', icon: Bell },
    { id: 'security', name: 'Zabezpečení', icon: Shield },
    { id: 'groups', name: 'Skupiny', icon: Users }
  ]

  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Nastavení účtu
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 glass-button rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/20 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white/40 text-primary-700'
                        : 'text-gray-800 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Profilové informace</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                       {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <User className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Profilová fotka</h4>
                      <p className="text-sm text-gray-500">JPG, PNG nebo GIF. Max. 2MB.</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Jméno
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name', { 
                        required: 'Jméno je povinné',
                        minLength: {
                          value: 2,
                          message: 'Jméno musí mít alespoň 2 znaky'
                        }
                      })}
                      className="input"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'E-mail je povinný',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Neplatný e-mail'
                        }
                      })}
                      className="input"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Ukládání...' : 'Uložit změny'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Nastavení oznámení</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">E-mailová oznámení</h4>
                      <p className="text-sm text-gray-500">Dostávejte oznámení o nových událostech a změnách</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('notifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Oznámení o nových událostech</h4>
                      <p className="text-sm text-gray-500">Dostávejte oznámení když někdo vytvoří novou událost</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('eventNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Oznámení o komentářích</h4>
                      <p className="text-sm text-gray-500">Dostávejte oznámení o nových komentářích k událostem</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('commentNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Zabezpečení účtu</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Změna hesla</h4>
                    <p className="text-sm text-gray-500 mb-4">Změňte své heslo pro zvýšení bezpečnosti</p>
                    <button className="btn btn-secondary">
                      Změnit heslo
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Dvoufaktorová autentizace</h4>
                    <p className="text-sm text-gray-500 mb-4">Přidejte další vrstvu zabezpečení k vašemu účtu</p>
                    <button className="btn btn-secondary">
                      Nastavit 2FA
                    </button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Nebezpečná zóna</h4>
                    <p className="text-sm text-red-700 mb-4">Smazání účtu je nevratné. Všechna vaše data budou odstraněna.</p>
                    <button className="btn btn-danger flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Smazat účet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Správa skupin</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Moje skupiny</h4>
                    <p className="text-sm text-gray-500 mb-4">Spravujte skupiny, které jste vytvořili nebo jste jejich členem</p>
                    <button className="btn btn-primary">
                      Zobrazit skupiny
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Pozvánky do skupin</h4>
                    <p className="text-sm text-gray-500 mb-4">Zobrazte a spravujte pozvánky do skupin</p>
                    <button className="btn btn-secondary">
                      Zobrazit pozvánky
                    </button>
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
