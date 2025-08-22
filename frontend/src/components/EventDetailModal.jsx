import { useEffect, useState, Fragment } from 'react'
import { X, Calendar as CalIcon, Clock, MapPin, User, MessageCircle, CheckCircle, XCircle, HelpCircle, Loader2, UserPlus, UserX, Trash2, Check, MoreVertical, Mail } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import InvitePeopleModal from './InvitePeopleModal'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'yes': return <CheckCircle className="h-4 w-4" />
      case 'maybe': return <HelpCircle className="h-4 w-4" />
      case 'no': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Fragment>
      <div className="w-full h-full bg-white rounded-none shadow-none border-0 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight truncate">{event?.title || 'Událost'}</h2>
            {event?.group_name && (<div className="text-sm font-semibold text-gray-600 truncate">{event.group_name}</div>)}
            </div>
            <div className="flex items-center gap-2 relative">
              <button onClick={() => setShowMenu(v => !v)} className="btn btn-ghost btn-nav" aria-label="Menu">
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-sm z-10">
                  <button onClick={handleDelete} className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                    <Trash2 className="h-4 w-4 mr-2" />Smazat událost
                  </button>
                </div>
              )}
              <button onClick={onClose} className="btn btn-ghost btn-nav" aria-label="Zavřít detail události">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 p-10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="flex-1 p-5 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="border border-gray-300 p-4 flex flex-col h-full overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center tracking-wide"><MessageCircle className="h-4 w-4 mr-2" />Chat ({event?.comments?.length || 0})</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto mb-2">
                    {event?.comments?.map((comment) => (
                      <div key={comment.id} className={`p-3 border ${String(comment.user_id) === String(user?.id) ? 'bg-blue-50 border-blue-200 ml-8' : 'bg-gray-50 border-gray-200 mr-8'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-xs truncate">{comment.user_name}</div>
                          <div className="text-[11px] text-gray-500 ml-3 whitespace-nowrap">{format(new Date(comment.created_at), 'd.M.yyyy H:mm')}</div>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    ))}
                    {(!event?.comments || event.comments.length === 0) && <div className="text-sm text-gray-500">Zatím žádné komentáře</div>}
                  </div>
                  <form onSubmit={handleAddComment} className="flex items-center gap-2">
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Napsat zprávu..." className="input h-9 flex-1" />
                    <button type="submit" disabled={submittingComment || !newComment.trim()} className="btn btn-primary h-9 px-3">Odeslat</button>
                  </form>
                </div>

                <div className="flex flex-col h-full overflow-y-auto space-y-6 pr-1">
                  <div className="border border-gray-300 p-5">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-800 font-semibold"><CalIcon className="h-5 w-5 mr-3" /><span>{event?.date ? format(new Date(event.date), 'EEEE, d. MMMM yyyy', { locale: cs }) : ''}</span></div>
                  {event?.time && (<div className="flex items-center text-gray-800 font-semibold"><Clock className="h-5 w-5 mr-3" /><span>{event.time}</span></div>)}
                  {event?.location && (<div className="flex items-center text-gray-800 font-semibold"><MapPin className="h-5 w-5 mr-3" /><span>{event.location}</span></div>)}
                  <div className="flex items-center text-gray-800 font-semibold"><User className="h-5 w-5 mr-3" /><span>Vytvořil: {event?.creator_name}</span></div>
                    </div>
                    {event?.description && (
                      <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Popis</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{event.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 tracking-wide">Vaše účast</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleAttendance('yes')} aria-pressed={userStatus === 'yes'} className={`px-3 py-2 text-sm font-semibold ${userStatus === 'yes' ? 'bg-green-600 text-white' : 'btn-outline'}`}>Účastním se</button>
                      <button onClick={() => handleAttendance('maybe')} aria-pressed={userStatus === 'maybe'} className={`px-3 py-2 text-sm font-semibold ${userStatus === 'maybe' ? 'btn-amber' : 'btn-outline'}`}>Možná</button>
                      <button onClick={() => handleAttendance('no')} aria-pressed={userStatus === 'no'} className={`px-3 py-2 text-sm font-semibold ${userStatus === 'no' ? 'btn-danger' : 'btn-outline'}`}>Neúčastním se</button>
                      {event?.creator_id === user?.id && (
                        <button onClick={() => setShowInviteModal(true)} className="btn btn-primary btn-sm inline-flex items-center gap-1" title="Pozvat lidi">
                          <Mail className="h-4 w-4" />
                          Pozvat
                        </button>
                      )}
                      <button onClick={handleDelete} className="ml-auto btn btn-danger btn-sm inline-flex items-center" title="Smazat událost"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="border border-gray-300 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center tracking-wide"><Check className="h-4 w-4 mr-2" />Seznam úkolů</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Napsat, co je potřeba zařídit..." className="input h-9 flex-1" />
                      <button onClick={handleAddTask} disabled={taskLoading} className="btn btn-primary h-9 px-3">{taskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}</button>
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className={`px-3 py-2 border ${task.status === 'done' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleDone(task.id, task.status !== 'done')} className="h-5 w-5 flex items-center justify-center border border-gray-400">{task.status === 'done' ? <Check className="h-3 w-3 text-green-600" /> : null}</button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-gray-700' : 'text-gray-900'}`}>{task.text}</div>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-none border whitespace-nowrap ${task.assignee_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}><User className="h-3 w-3" />{task.assignee_name ? task.assignee_name : 'Neobsazeno'}</span>
                                <div className="flex items-center gap-1 ml-2">
                                  <button onClick={() => handleAssignTask(task.id, task.assignee_id ? null : user?.id)} className="h-7 w-7 flex items-center justify-center border border-gray-300 text-blue-700 hover:bg-blue-50">{task.assignee_id ? <UserX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}</button>
                                  <button onClick={() => handleDeleteTask(task.id)} className="h-7 w-7 flex items-center justify-center border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {tasks.length === 0 && <div className="text-sm text-gray-500">Zatím žádné úkoly</div>}
                    </div>
                  </div>

                  <div className="border border-gray-300 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center tracking-wide"><User className="h-4 w-4 mr-2" />Účastníci ({event?.attendees?.length || 0})</h3>
                    <div className="space-y-2">
                      {event?.attendees?.map((attendee) => (
                        <div key={attendee.id} className="flex items-center justify-between border border-gray-200 px-3 py-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate text-sm">{attendee.name}</div>
                            <div className="text-xs text-gray-500 truncate">{attendee.email}</div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-none whitespace-nowrap ${attendee.status === 'yes' ? 'bg-green-50 text-green-700 border border-green-200' : attendee.status === 'maybe' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : attendee.status === 'no' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                            {getStatusIcon(attendee.status)}
                            <span className="ml-1">{attendee.status === 'yes' ? 'Účastní se' : attendee.status === 'maybe' ? 'Možná' : attendee.status === 'no' ? 'Neúčastní se' : 'Nerozhodnuto'}</span>
                          </span>
                        </div>
                      ))}
                      {(!event?.attendees || event.attendees.length === 0) && <div className="text-sm text-gray-500">Zatím žádní účastníci</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showInviteModal && (
        <InvitePeopleModal
          event={event}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false);
            fetchEvent();
          }}
        />
      )}
    </Fragment>
  )
}


