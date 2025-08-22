import { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, FileText, Users } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { cs } from 'date-fns/locale'

export default function EditEventModal({ event, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    title: event.title || '',
    date: event.date || '',
    time: event.time || '',
    endTime: event.end_time || '',
    location: event.location || '',
    description: event.description || '',
    groupId: event.group_id || null
  })
  const [groups, setGroups] = useState([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [isMultiDay, setIsMultiDay] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups')
      setGroups(response.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        ...data,
        endDate: isMultiDay ? data.endDate : null,
        endTime: data.endTime || null
      }
      
      console.log('Sending event data:', eventData)
      
      const response = await api.put(`/events/${event.id}`, eventData)
      console.log('Response from server:', response.data)
      
      toast.success('Událost byla úspěšně upravena')
      onUpdated(response.data)
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.response?.data?.error || 'Chyba při úpravě události')
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date) => {
    setData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
    setShowDatePicker(false)
  }

  const handleTimeSelect = (time) => {
    setData(prev => ({ ...prev, time }))
    setShowTimePicker(false)
  }

  const handleEndTimeSelect = (time) => {
    setData(prev => ({ ...prev, endTime: time }))
    setShowEndTimePicker(false)
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(time)
      }
    }
    return options
  }

  const generateDateOptions = () => {
    const options = []
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const date = addDays(today, i)
      options.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, d. MMMM yyyy', { locale: cs })
      })
    }
    return options
  }

  const timeOptions = generateTimeOptions()
  const dateOptions = generateDateOptions()

  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-blue-600">
          <h2 className="text-xl font-bold text-white">
            Upravit událost
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white font-bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Název události *
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              placeholder="Název události"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Datum *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.date ? dateOptions.find(d => d.value === data.date)?.label || data.date : ''}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium cursor-pointer"
                  placeholder="Vyber datum"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border-2 border-gray-300 max-h-60 overflow-y-auto">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDateSelect(new Date(option.value))}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 font-medium"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Čas
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.time}
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium cursor-pointer"
                  placeholder="Vyber čas"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {showTimePicker && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border-2 border-gray-300 max-h-60 overflow-y-auto">
                    {timeOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 font-medium"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Konec
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.endTime}
                onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium cursor-pointer"
                placeholder="Vyber konec"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {showEndTimePicker && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border-2 border-gray-300 max-h-60 overflow-y-auto">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleEndTimeSelect(time)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 font-medium"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Místo
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.location}
                onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                placeholder="Místo konání"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Skupina
            </label>
            <div className="relative">
              <select
                value={data.groupId || ''}
                onChange={(e) => setData(prev => ({ ...prev, groupId: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                <option value="">Bez skupiny</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Popis
            </label>
            <div className="relative">
              <textarea
                value={data.description}
                onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium resize-none"
                placeholder="Popis události"
              />
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700 font-bold text-white transition-colors"
            >
              {loading ? 'Ukládám...' : 'Uložit změny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
