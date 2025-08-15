import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/groups', data)
      onCreated(response.data)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při vytváření skupiny')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Vytvořit novou skupinu
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 glass-button rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
              placeholder="Např. Rodina, Tým ve škole"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    defaultChecked={color.value === '#3B82F6'}
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
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

          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Veřejná skupina
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Veřejné skupiny může kdokoliv najít a připojit se k nim bez pozvánky
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-4 py-2 rounded-lg text-sm"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Vytváření...' : 'Vytvořit skupinu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
