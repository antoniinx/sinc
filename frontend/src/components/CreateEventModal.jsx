import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function CreateEventModal({ onClose, onCreated, groups }) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/events', data)
      onCreated(response.data)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při vytváření události')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Vytvořit novou událost
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-2">
                Skupina *
              </label>
              <select
                id="groupId"
                {...register('groupId', { 
                  required: 'Výběr skupiny je povinný'
                })}
                className="input"
              >
                <option value="">Vyberte skupinu</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.groupId && (
                <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Název události *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { 
                  required: 'Název události je povinný'
                })}
                className="input"
                placeholder="Název události"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Popis
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="input"
                rows="3"
                placeholder="Popis události (volitelné)"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                id="date"
                type="date"
                {...register('date', { 
                  required: 'Datum je povinné'
                })}
                className="input"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Čas
              </label>
              <input
                id="time"
                type="time"
                {...register('time')}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Místo
              </label>
              <input
                id="location"
                type="text"
                {...register('location')}
                className="input"
                placeholder="Místo konání"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL obrázku
              </label>
              <input
                id="imageUrl"
                type="url"
                {...register('imageUrl')}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Vytváření...' : 'Vytvořit událost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
