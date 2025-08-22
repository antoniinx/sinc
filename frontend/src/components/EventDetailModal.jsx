import { useEffect, useState } from 'react'
import { X, Calendar as CalIcon, Clock, MapPin, User, MessageCircle, CheckCircle, XCircle, HelpCircle, Loader2, UserPlus, UserX, Trash2, Check, MoreVertical, Mail } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import InvitePeopleModal from './InvitePeopleModal'
import EditEventModal from './EditEventModal'

export default function EventDetailModal({ eventId, onClose, onDeleted }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)
  const [userStatus, setUserStatus] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState('attendees') // 'attendees' or 'chat'

  useEffect(() => {
    fetchEvent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const fetchEvent = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/events/${eventId}`)
      setEvent(response.data)
      setTasks(response.data?.tasks || [])
      let inferred = response.data?.user_status || null
      if (!inferred && response.data?.attendees && user?.id != null) {
        const me = response.data.attendees.find(a => String(a.id) === String(user.id))
        if (me && me.status) inferred = me.status
      }
      setUserStatus(inferred)
    } catch (error) {
      toast.error('Chyba při načítání události')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendance = async (status) => {
    setUserStatus(status)
    try {
      await api.put(`/events/${eventId}/attend`, { status })
      fetchEvent()
    } catch {
      toast.error('Chyba při aktualizaci účasti')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    const text = newComment.trim()
    if (!text) return
    setSubmittingComment(true)
    try {
      await api.post('/comments', { eventId: parseInt(eventId), text })
      setNewComment('')
      fetchEvent()
    } catch {
      toast.error('Chyba při přidávání komentáře')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleAddTask = async () => {
    const text = newTask.trim()
    if (!text) return
    setTaskLoading(true)
    try {
      const res = await api.post(`/events/${eventId}/tasks`, { text })
      setNewTask('')
      setTasks([res.data, ...tasks])
    } catch {
      toast.error('Chyba při přidávání úkolu')
    } finally {
      setTaskLoading(false)
    }
  }

  const handleAssignTask = async (taskId, assigneeId) => {
    try {
      const res = await api.put(`/events/tasks/${taskId}/assign`, { assigneeId })
      setTasks(tasks.map(t => t.id === taskId ? res.data : t))
    } catch {
      toast.error('Chyba při přiřazení úkolu')
    }
  }

  const handleToggleDone = async (taskId, done) => {
    try {
      const res = await api.put(`/events/tasks/${taskId}/status`, { status: done ? 'done' : 'open' })
      setTasks(tasks.map(t => t.id === taskId ? res.data : t))
    } catch {
      toast.error('Chyba při změně stavu úkolu')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/events/tasks/${taskId}`)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch {
      toast.error('Chyba při mazání úkolu')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${eventId}`)
      onDeleted(eventId)
    } catch {
      toast.error('Chyba při mazání události')
    }
  }

  const handleInvitePeople = () => {
    setShowInviteModal(true)
  }

  const handleInvited = () => {
    fetchEvent()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'yes': return <CheckCircle className="h-4 w-4" />
      case 'maybe': return <HelpCircle className="h-4 w-4" />
      case 'no': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'yes': return 'bg-green-600 text-white border-green-700'
      case 'maybe': return 'bg-yellow-600 text-white border-yellow-700'
      case 'no': return 'bg-red-600 text-white border-red-700'
      default: return 'bg-gray-600 text-white border-gray-700'
    }
  }

  return (
    <div className="w-full h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 flex-shrink-0 bg-blue-600">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white tracking-wide truncate">{event?.title || 'Událost'}</h2>
            {event?.group_name && (<div className="text-sm font-medium text-blue-100 truncate">{event.group_name}</div>)}
          </div>
          <div className="flex items-center gap-3 relative">
            <button onClick={() => setShowMenu(v => !v)} className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors rounded-sm" aria-label="Menu">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="18" r="2"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-200 shadow-lg z-10 min-w-48">
                <button onClick={() => setShowEditModal(true)} className="flex items-center px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 w-full transition-colors">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Upravit událost
                </button>
                <button onClick={handleDelete} className="flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 w-full transition-colors">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Smazat událost
                </button>
              </div>
            )}
            <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors rounded-sm" aria-label="Zavřít detail události">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      {loading ? (
        <div className="flex-1 p-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left side - Attendees/Chat tabs */}
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex space-x-1 mb-4 bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab('attendees')}
                  className={`flex-1 py-2 px-3 text-sm font-bold transition-colors ${activeTab === 'attendees' ? 'bg-white text-blue-700' : 'text-gray-800 hover:text-gray-900'}`}
                >
                  Účastníci ({event?.attendees?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 px-3 text-sm font-bold transition-colors ${activeTab === 'chat' ? 'bg-white text-blue-700' : 'text-gray-800 hover:text-gray-900'}`}
                >
                  Chat ({event?.comments?.length || 0})
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'attendees' ? (
                <div className="border-2 border-gray-200 p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide">
                      <User className="h-5 w-5 mr-2 text-purple-600" />
                      Účastníci
                    </h3>
                    <button
                      onClick={handleInvitePeople}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 border-2 border-purple-700 font-bold text-white transition-colors flex items-center text-xs"
                      title="Pozvat lidi"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Pozvat
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {event?.attendees?.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between border-2 border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold truncate text-sm">{attendee.name}</div>
                          <div className="text-xs text-gray-500 truncate font-medium">{attendee.email}</div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-2 text-xs font-bold border-2 w-32 justify-center ${getStatusColor(attendee.status)}`}>
                          {getStatusIcon(attendee.status)}
                          <span className="ml-2">
                            {attendee.status === 'yes' ? 'Účastní se' : 
                             attendee.status === 'maybe' ? 'Možná' : 
                             attendee.status === 'no' ? 'Neúčastní se' : 
                             'Čeká na odpověď'}
                          </span>
                        </span>
                      </div>
                    ))}
                    {(!event?.attendees || event.attendees.length === 0) && <div className="text-sm text-gray-500 font-medium">Zatím žádní účastníci</div>}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-200 p-5 flex flex-col h-full overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center tracking-wide">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Chat
                  </h3>
                  <div className="space-y-3 flex-1 overflow-y-auto mb-4">
                    {event?.comments?.map((comment) => (
                      <div key={comment.id} className={`p-4 border-2 ${String(comment.user_id) === String(user?.id) ? 'bg-blue-50 border-blue-300 ml-8' : 'bg-gray-50 border-gray-300 mr-8'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm truncate">{comment.user_name}</div>
                          <div className="text-xs text-gray-500 ml-3 whitespace-nowrap font-medium">{format(new Date(comment.created_at), 'd.M.yyyy H:mm')}</div>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap font-medium">{comment.text}</p>
                      </div>
                    ))}
                    {(!event?.comments || event.comments.length === 0) && <div className="text-sm text-gray-500 font-medium">Zatím žádné komentáře</div>}
                  </div>
                  <form onSubmit={handleAddComment} className="flex items-center gap-3">
                    <input 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Napsat zprávu..." 
                      className="flex-1 px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium" 
                    />
                    <button 
                      type="submit" 
                      disabled={submittingComment || !newComment.trim()} 
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700 font-bold text-white transition-colors"
                    >
                      Odeslat
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="flex flex-col h-full overflow-y-auto space-y-6 pr-1">
              <div className="border-2 border-gray-200 p-5">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-800 font-bold">
                    <CalIcon className="h-5 w-5 mr-3 text-blue-600" />
                    <span>{event?.date ? format(new Date(event.date), 'EEEE, d. MMMM yyyy', { locale: cs }) : ''}</span>
                  </div>
                  {event?.time && (
                    <div className="flex items-center text-gray-800 font-bold">
                      <Clock className="h-5 w-5 mr-3 text-purple-600" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event?.location && (
                    <div className="flex items-center text-gray-800 font-bold">
                      <MapPin className="h-5 w-5 mr-3 text-green-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-800 font-bold">
                    <User className="h-5 w-5 mr-3 text-orange-600" />
                    <span>Vytvořil: {event?.creator_name}</span>
                  </div>
                </div>
                {event?.description && (
                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Popis</h3>
                    <p className="text-gray-900 whitespace-pre-wrap font-medium">{event.description}</p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-200 pt-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-wide">Vaše účast</h3>
                <div className="flex gap-3 flex-wrap">
                  <button 
                    onClick={() => handleAttendance('yes')} 
                    className={`px-6 py-3 text-sm font-bold border-2 transition-colors ${userStatus === 'yes' ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-600 border-green-600 hover:bg-green-50'}`}
                  >
                    Účastním se
                  </button>
                  <button 
                    onClick={() => handleAttendance('maybe')} 
                    className={`px-6 py-3 text-sm font-bold border-2 transition-colors ${userStatus === 'maybe' ? 'bg-yellow-600 text-white border-yellow-700' : 'bg-white text-yellow-600 border-yellow-600 hover:bg-yellow-50'}`}
                  >
                    Možná
                  </button>
                  <button 
                    onClick={() => handleAttendance('no')} 
                    className={`px-6 py-3 text-sm font-bold border-2 transition-colors ${userStatus === 'no' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-red-600 border-red-600 hover:bg-red-50'}`}
                  >
                    Neúčastním se
                  </button>
                </div>
              </div>

              <div className="border-2 border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center tracking-wide">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Seznam úkolů
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <input 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)} 
                    placeholder="Napsat, co je potřeba zařídit..." 
                    className="flex-1 px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium" 
                  />
                                      <button 
                      onClick={handleAddTask} 
                      disabled={taskLoading} 
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-700 font-bold text-white transition-colors text-xl"
                    >
                      {taskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                    </button>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className={`px-4 py-3 border-2 ${task.status === 'done' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleToggleDone(task.id, task.status !== 'done')} 
                          className="w-6 h-6 flex items-center justify-center border-2 border-gray-400 hover:border-green-600 transition-colors"
                        >
                          {task.status === 'done' ? <Check className="h-4 w-4 text-green-600 font-bold" /> : null}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-gray-700' : 'text-gray-900'}`}>{task.text}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold border-2 ${task.assignee_id ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                              <User className="h-3 w-3" />
                              {task.assignee_name ? task.assignee_name : 'Neobsazeno'}
                            </span>
                            <div className="flex items-center gap-2 ml-3">
                              <button 
                                onClick={() => handleAssignTask(task.id, task.assignee_id ? null : user?.id)} 
                                className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 text-blue-700 hover:bg-blue-50 transition-colors"
                              >
                                {task.assignee_id ? <UserX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteTask(task.id)} 
                                className="w-8 h-8 flex items-center justify-center border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && <div className="text-sm text-gray-500 font-medium">Zatím žádné úkoly</div>}
                </div>
              </div>


            </div>
          </div>
        </div>
      )}

      <InvitePeopleModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        eventId={eventId}
        groupId={event?.group_id}
        onInvited={handleInvited}
      />

      {showEditModal && event && (
        <EditEventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedEvent) => {
            setEvent(updatedEvent)
            setShowEditModal(false)
            toast.success('Událost byla úspěšně upravena!')
          }}
        />
      )}
    </div>
  )
}


