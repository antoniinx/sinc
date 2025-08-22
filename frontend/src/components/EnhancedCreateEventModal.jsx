import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { X, Calendar, Clock, MapPin, Image, Users, Plus, UserPlus } from 'lucide-react'
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns'
import { cs } from 'date-fns/locale'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import InviteParticipantsModal from './InviteParticipantsModal'

export default function EnhancedCreateEventModal({ onClose, onCreated, groups, selectedSlot = null }) {
  const [loading, setLoading] = useState(false)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invitedUsers, setInvitedUsers] = useState([])
  
  const datePickerRef = useRef(null)
  const endDatePickerRef = useRef(null)
  const timePickerRef = useRef(null)
  const endTimePickerRef = useRef(null)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm()

  const watchedDate = watch('date')
  const watchedEndDate = watch('endDate')
  const watchedTime = watch('time')
  const watchedEndTime = watch('endTime')

  // Initialize form with selected slot data
  useEffect(() => {
    if (selectedSlot) {
      const { start, end } = selectedSlot
      setValue('date', format(start, 'yyyy-MM-dd'))
      setValue('time', format(start, 'HH:mm'))
      
      if (end && !isSameDay(start, end)) {
        setIsMultiDay(true)
        setValue('endDate', format(end, 'yyyy-MM-dd'))
        setValue('endTime', format(end, 'HH:mm'))
      } else if (end) {
        setValue('endTime', format(end, 'HH:mm'))
      }
    }
  }, [selectedSlot, setValue])

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false)
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target)) {
        setShowEndDatePicker(false)
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowTimePicker(false)
      }
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target)) {
        setShowEndTimePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const eventData = {
        ...data,
        endDate: isMultiDay ? data.endDate : null,
        endTime: data.endTime || null  // Always send endTime if it exists, regardless of isMultiDay
      }
      
      console.log('Sending event data:', eventData)
      console.log('isMultiDay:', isMultiDay)
      console.log('data.endTime:', data.endTime)
      console.log('eventData.endTime:', eventData.endTime)
      
      const response = await api.post('/events', eventData)
      console.log('Response from server:', response.data)
      
      // If there are invited users, invite them to the event
      if (invitedUsers.length > 0) {
        console.log('Inviting users:', invitedUsers)
        try {
          const inviteResponse = await api.post(`/events/${response.data.id}/invite`, {
            userIds: invitedUsers
          })
          console.log('Invite response:', inviteResponse.data)
          toast.success(`Událost byla úspěšně vytvořena a ${invitedUsers.length} pozvánek bylo odesláno`)
        } catch (inviteError) {
          console.error('Error inviting users:', inviteError)
          console.error('Error response:', inviteError.response?.data)
          toast.success('Událost byla vytvořena, ale chyba při odesílání pozvánek')
        }
      } else {
        toast.success('Událost byla úspěšně vytvořena')
      }
      
      onCreated(response.data)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.error || 'Chyba při vytváření události')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteParticipants = (userIds) => {
    setInvitedUsers(userIds)
  }

  const handleDateSelect = (date) => {
    setValue('date', format(date, 'yyyy-MM-dd'))
    setShowDatePicker(false)
  }

  const handleEndDateSelect = (date) => {
    setValue('endDate', format(date, 'yyyy-MM-dd'))
    setShowEndDatePicker(false)
  }

  const handleTimeSelect = (time) => {
    setValue('time', time)
    setShowTimePicker(false)
  }

  const handleEndTimeSelect = (time) => {
    setValue('endTime', time)
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
      <div className="glass-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            Vytvořit novou událost
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 p-2 rounded-full glass-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-2" />
                Skupina *
              </label>
              <select
                {...register('groupId', { 
                  required: 'Výběr skupiny je povinný'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název události *
              </label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Název události je povinný'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Název události"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Multi-day Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="multiDay"
                checked={isMultiDay}
                onChange={(e) => setIsMultiDay(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="multiDay" className="text-sm font-medium text-gray-700">
                Vícedenní událost
              </label>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Začátek *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('date', { 
                      required: 'Datum je povinné'
                    })}
                    readOnly
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                    placeholder="Vyberte datum"
                    value={watchedDate ? dateOptions.find(d => d.value === watchedDate)?.label || watchedDate : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                                 {showDatePicker && (
                   <div ref={datePickerRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                     <select
                       size="8"
                       className="w-full p-2 custom-scrollbar"
                       onChange={(e) => handleDateSelect(new Date(e.target.value))}
                     >
                       {dateOptions.map((option) => (
                         <option key={option.value} value={option.value}>
                           {option.label}
                         </option>
                       ))}
                     </select>
                   </div>
                 )}
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Start Time */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Čas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('time')}
                    readOnly
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                    placeholder="Vyberte čas"
                    value={watchedTime || ''}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                                 {showTimePicker && (
                   <div ref={timePickerRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                     <select
                       size="8"
                       className="w-full p-2 custom-scrollbar"
                       onChange={(e) => handleTimeSelect(e.target.value)}
                     >
                       <option value="">Vyberte čas</option>
                       {timeOptions.map((time) => (
                         <option key={time} value={time}>
                           {time}
                         </option>
                       ))}
                     </select>
                   </div>
                 )}
              </div>

              {/* End Date (for multi-day events) */}
              {isMultiDay && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Konec *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('endDate', { 
                        required: isMultiDay ? 'Koncové datum je povinné' : false,
                        validate: value => {
                          if (isMultiDay && value && watchedDate) {
                            return isAfter(new Date(value), new Date(watchedDate)) || 'Koncové datum musí být po začátku'
                          }
                          return true
                        }
                      })}
                      readOnly
                      onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      placeholder="Vyberte datum"
                      value={watchedEndDate ? dateOptions.find(d => d.value === watchedEndDate)?.label || watchedEndDate : ''}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                                     {showEndDatePicker && (
                     <div ref={endDatePickerRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                       <select
                         size="8"
                         className="w-full p-2 custom-scrollbar"
                         onChange={(e) => handleEndDateSelect(new Date(e.target.value))}
                       >
                         {dateOptions.map((option) => (
                           <option key={option.value} value={option.value}>
                             {option.label}
                           </option>
                         ))}
                       </select>
                     </div>
                   )}
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              )}

              {/* End Time */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Koncový čas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('endTime')}
                    readOnly
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                    placeholder="Vyberte čas"
                    value={watchedEndTime || ''}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                                 {showEndTimePicker && (
                   <div ref={endTimePickerRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                     <select
                       size="8"
                       className="w-full p-2 custom-scrollbar"
                       onChange={(e) => handleEndTimeSelect(e.target.value)}
                     >
                       <option value="">Vyberte čas</option>
                       {timeOptions.map((time) => (
                         <option key={time} value={time}>
                           {time}
                         </option>
                       ))}
                     </select>
                   </div>
                 )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Místo
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Místo konání"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows="3"
                placeholder="Popis události (volitelné)"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="inline h-4 w-4 mr-2" />
                URL obrázku
              </label>
              <input
                type="url"
                {...register('imageUrl')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <UserPlus className="inline h-4 w-4 mr-2" />
                  Účastníci
                </label>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Pozvat lidi
                </button>
              </div>
              {invitedUsers.length > 0 ? (
                <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Pozváno: <span className="font-medium">{invitedUsers.length} lidí</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Zatím žádní pozvaní účastníci
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-6 py-3 text-sm font-medium rounded-lg"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vytváření...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Vytvořit událost
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <InviteParticipantsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvited={handleInviteParticipants}
      />
    </div>
  )
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd')
}
