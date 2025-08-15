import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageCircle, CheckCircle, XCircle, HelpCircle, Plus, Trash2, Check, Loader2, UserPlus, UserX, Square, CheckSquare } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'

export default function EventDetail() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [userStatus, setUserStatus] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`)
      setEvent(response.data)
      setTasks(response.data?.tasks || [])
      // Prefer explicit user_status; otherwise infer from attendees
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

  const refreshTasks = async () => {
    try {
      const res = await api.get(`/events/${eventId}/tasks`)
      setTasks(res.data)
    } catch {}
  }

  const handleAttendance = async (status) => {
    // Optimisticky vybarvit tlačítko hned
    setUserStatus(status)
    try {
      await api.put(`/events/${eventId}/attend`, { status })
      toast.success('Účast aktualizována')
      // Pro jistotu načíst z DB (stav členů se mohl změnit)
      fetchEvent()
    } catch (error) {
      toast.error('Chyba při aktualizaci účasti')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      await api.post('/comments', {
        eventId: parseInt(eventId),
        text: newComment
      })
      setNewComment('')
      toast.success('Komentář přidán')
      fetchEvent()
    } catch (error) {
      toast.error('Chyba při přidávání komentáře')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Tasks API actions
  const handleAddTask = async () => {
    const text = newTask.trim()
    if (!text) return
    setTaskLoading(true)
    try {
      const res = await api.post(`/events/${eventId}/tasks`, { text })
      setNewTask('')
      setTasks([res.data, ...tasks])
    } catch (e) {
      toast.error('Chyba při přidávání úkolu')
    } finally {
      setTaskLoading(false)
    }
  }

  const handleAssignTask = async (taskId, assigneeId) => {
    try {
      const res = await api.put(`/events/tasks/${taskId}/assign`, { assigneeId })
      setTasks(tasks.map(t => t.id === taskId ? res.data : t))
    } catch { toast.error('Chyba při přiřazení úkolu') }
  }

  const handleToggleDone = async (taskId, done) => {
    try {
      const res = await api.put(`/events/tasks/${taskId}/status`, { status: done ? 'done' : 'open' })
      setTasks(tasks.map(t => t.id === taskId ? res.data : t))
    } catch { toast.error('Chyba při změně stavu úkolu') }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/events/tasks/${taskId}`)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch { toast.error('Chyba při mazání úkolu') }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'yes': return 'text-green-600'
      case 'maybe': return 'text-yellow-600'
      case 'no': return 'text-red-600'
      default: return 'text-gray-500'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Událost nebyla nalezena</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-500">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header unified with Dashboard */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700 p-2 border border-gray-200">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{event.title}</h1>
                <p className="text-sm text-gray-500">{event.group_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-none shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
                
                {event.image_url && (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{format(new Date(event.date), 'EEEE, d. MMMM yyyy', { locale: cs })}</span>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-3" />
                    <span>Vytvořil: {event.creator_name}</span>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Popis</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
              </div>

              {/* Attendance */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaše účast</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAttendance('yes')}
                    aria-pressed={userStatus === 'yes'}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      userStatus === 'yes'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Účastním se
                  </button>
                  <button
                    onClick={() => handleAttendance('maybe')}
                    aria-pressed={userStatus === 'maybe'}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      userStatus === 'maybe'
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                        : 'border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-500'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Možná
                  </button>
                  <button
                    onClick={() => handleAttendance('no')}
                    aria-pressed={userStatus === 'no'}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      userStatus === 'no'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-500'
                    }`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Neúčastním se
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* To-Do / Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Seznam úkolů
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Napsat, co je potřeba zařídit..."
                  className="input flex-1 h-10"
                />
                <button onClick={handleAddTask} disabled={taskLoading} className="btn btn-primary h-10 px-3 flex items-center justify-center">
                  {taskLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <span className="text-lg leading-none">+</span>
                  )}
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-none px-3 py-2 border ${
                      task.status === 'done' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        title={task.status === 'done' ? 'Otevřít' : 'Označit jako hotovo'}
                        onClick={() => handleToggleDone(task.id, task.status !== 'done')}
                        className="h-6 w-6 flex items-center justify-center border border-gray-400 hover:border-gray-600 flex-shrink-0"
                      >
                        {task.status === 'done' ? <Check className="h-4 w-4 text-green-600" /> : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-base ${task.status === 'done' ? 'line-through text-gray-700' : 'text-gray-900'}`}>{task.text}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-none border whitespace-nowrap ${
                            task.assignee_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            <User className="h-3 w-3" />
                            {task.assignee_name ? task.assignee_name : 'Neobsazeno'}
                          </span>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <button
                              title={task.assignee_id ? 'Zrušit přiřazení' : 'Přihlásit se k úkolu'}
                              onClick={() => handleAssignTask(task.id, task.assignee_id ? null : user?.id)}
                              className="h-8 w-8 flex items-center justify-center rounded-none border border-gray-300 hover:bg-blue-50 text-blue-700"
                            >
                              {task.assignee_id ? <UserX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            </button>
                            <button
                              title="Smazat"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 flex items-center justify-center rounded-none border border-red-200 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-sm text-gray-500">Zatím žádné úkoly</div>
                )}
              </div>
            </div>
            {/* Attendees */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Účastníci ({event.attendees?.length || 0})
              </h3>
              
              <div className="space-y-2">
                {event.attendees?.map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{attendee.name}</div>
                      <div className="text-sm text-gray-500 truncate">{attendee.email}</div>
                    </div>
                    <div className="ml-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm whitespace-nowrap ${
                        attendee.status === 'yes' ? 'bg-green-50 text-green-700 border border-green-200' :
                        attendee.status === 'maybe' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        attendee.status === 'no' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {getStatusIcon(attendee.status)}
                        <span className="ml-1">
                          {attendee.status === 'yes' && 'Účastní se'}
                          {attendee.status === 'maybe' && 'Možná'}
                          {attendee.status === 'no' && 'Neúčastní se'}
                          {attendee.status === 'pending' && 'Nerozhodnuto'}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
                
                {(!event.attendees || event.attendees.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    Zatím žádní účastníci
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-[460px]">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat ({event.comments?.length || 0})
              </h3>
              {/* Chat List */}
              <div className="space-y-3 flex-1 overflow-y-auto mb-3">
                {event.comments?.map((comment) => (
                  <div key={comment.id} className={`p-3 rounded-md border ${String(comment.user_id) === String(user?.id) ? 'bg-blue-50 border-blue-200 ml-8' : 'bg-gray-50 border-gray-200 mr-8'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm truncate">{comment.user_name}</div>
                      <div className="text-xs text-gray-500 ml-3 whitespace-nowrap">
                        {format(new Date(comment.created_at), 'd.M.yyyy H:mm')}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))}
                
                {(!event.comments || event.comments.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    Zatím žádné komentáře
                  </div>
                )}
              </div>

              {/* Composer at bottom */}
              <form onSubmit={handleAddComment} className="flex items-center space-x-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Napsat zprávu..."
                  className="input flex-1 h-10"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="btn btn-primary h-10 px-4"
                >
                  Odeslat
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
