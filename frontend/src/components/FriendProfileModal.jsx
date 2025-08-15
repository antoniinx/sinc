import { useEffect, useState } from 'react'
import { X, Calendar as CalIcon, Mail, User, Trash2, UserPlus, Plus } from 'lucide-react'
import EnhancedCalendar from './EnhancedCalendar'
import { useMemo } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function FriendProfileModal({ friend, onClose, onFriendRemoved }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [friendEvents, setFriendEvents] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [friendRes, myRes] = await Promise.all([
          api.get(`/friends/${friend.id}/calendar`),
          api.get('/events')
        ])
        setEvents(friendRes.data || [])
        setMyEvents(myRes.data || [])
        
        // Načti události přítele s informacemi o účasti
        const friendEventsRes = await api.get(`/friends/${friend.id}/events`)
        setFriendEvents(friendEventsRes.data || [])
      } catch {
        setEvents([])
        setMyEvents([])
        setFriendEvents([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [friend?.id])

  // Společné akce - jen ty na které je přihlášený
  const sharedEvents = useMemo(() => {
    if (!friendEvents || friendEvents.length === 0) return []
    
    return friendEvents.filter(event => {
      // Najdi účast přítele na této události
      const friendAttendance = event.attendees?.find(a => String(a.id) === String(friend.id))
      return friendAttendance && friendAttendance.status === 'yes'
    })
  }, [friendEvents, friend?.id])

  const calendarReadyEvents = useMemo(() => {
    return (events || []).map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      end_date: e.end_date,
      time: e.time,
      end_time: e.end_time,
      group_id: e.group_id,
      color: e.group_color || e.color
    }))
  }, [events])

  const handleRemoveFriend = async () => {
    try {
      await api.delete(`/friends/${friend.friendship_id}`)
      toast.success('Přítel odstraněn')
      onFriendRemoved?.(friend.friendship_id)
      onClose()
    } catch {
      toast.error('Chyba při odstraňování přítele')
    }
  }

  const handleInviteToEvent = async (eventId) => {
    try {
      // Zde by byla logika pro pozvání přítele na událost
      // Pro teď jen zobrazíme toast
      toast.success('Pozvánka odeslána')
      setShowInviteModal(false)
      setSelectedEvent(null)
    } catch {
      toast.error('Chyba při odesílání pozvánky')
    }
  }

  return (
    <div className="w-full h-full bg-white border-0 rounded-none flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight truncate">{friend.name}</h2>
          {friend.email && <div className="text-sm text-gray-600 truncate">{friend.email}</div>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRemoveFriend} 
            className="btn btn-danger btn-sm inline-flex items-center" 
            title="Odstranit přítele"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-nav" aria-label="Zavřít profil">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-5 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Levý sloupec – profilové info */}
          <div className="border border-gray-300 p-5 h-full overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-3 inline-flex items-center"><User className="h-4 w-4 mr-2" />Profil</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary-600 text-white flex items-center justify-center text-xl font-semibold">
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                ) : (
                  friend.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{friend.name}</div>
                {friend.email && (
                  <div className="text-sm text-gray-600 inline-flex items-center"><Mail className="h-4 w-4 mr-1" />{friend.email}</div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900">Společné akce ({sharedEvents.length})</h4>
                <button 
                  onClick={() => setShowInviteModal(true)} 
                  className="btn btn-primary btn-sm inline-flex items-center"
                  title="Pozvat na akci"
                >
                  <Plus className="h-4 w-4 mr-1" />Pozvat
                </button>
              </div>
              
              {loading ? (
                <div className="text-sm text-gray-600">Načítání…</div>
              ) : sharedEvents.length === 0 ? (
                <div className="text-sm text-gray-500">Zatím žádné společné akce</div>
              ) : (
                <div className="space-y-2">
                  {sharedEvents.map(ev => (
                    <div key={ev.id} className="border border-gray-200 p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm text-gray-900">{ev.title}</div>
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ev.group_color || ev.color || '#3B82F6' }} />
                      </div>
                      <div className="text-xs text-gray-600">{ev.date}{ev.time ? ` • ${ev.time}` : ''}</div>
                      {ev.group_name && (
                        <div className="text-xs text-gray-500 mt-1">Skupina: {ev.group_name}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pravý sloupec – kalendář událostí přítele */}
          <div className="border border-gray-300 p-0 h-full overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-sm font-bold text-gray-900 inline-flex items-center"><CalIcon className="h-4 w-4 mr-2" />Kalendář</h3>
            </div>
            <div className="h-[calc(100%-52px)] overflow-y-auto">
              <EnhancedCalendar
                events={calendarReadyEvents}
                groups={[]}
                view={'month'}
                date={new Date()}
                hideToolbar={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal pro pozvání na akci */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Pozvat na akci</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {myEvents.map(event => (
                <div key={event.id} className="border border-gray-200 p-3 rounded">
                  <div className="font-semibold text-sm">{event.title}</div>
                  <div className="text-xs text-gray-600">{event.date}{event.time ? ` • ${event.time}` : ''}</div>
                  <button 
                    onClick={() => handleInviteToEvent(event.id)}
                    className="btn btn-primary btn-sm mt-2 w-full"
                  >
                    Pozvat na "{event.title}"
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setShowInviteModal(false)} 
                className="btn btn-outline flex-1"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


