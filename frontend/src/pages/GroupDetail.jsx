import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Calendar, Trash2, UserPlus } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import CalendarView from '../components/CalendarView'
import AddMemberModal from '../components/AddMemberModal'

export default function GroupDetail() {
  const { groupId } = useParams()
  const [group, setGroup] = useState(null)
  const [events, setEvents] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [groupId])

  const fetchData = async () => {
    try {
      const [groupRes, eventsRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/events/group/${groupId}`)
      ])
      setGroup(groupRes.data)
      setEvents(eventsRes.data)
    } catch (error) {
      toast.error('Chyba při načítání dat')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/groups/${groupId}/members/${userId}`)
      toast.success('Člen odebrán')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při odebírání člena')
    }
  }

  const handleMemberAdded = () => {
    setShowAddMember(false)
    fetchData()
    toast.success('Člen přidán')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Skupina nebyla nalezena</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-500">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = group.members?.find(m => m.id === group.owner_id)?.role === 'owner'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="mr-4 text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-500">Vlastník: {group.owner_name}</p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddMember(true)}
                className="btn btn-primary flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Přidat člena
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Členové ({group.members?.length || 0})
                </h2>
              </div>
              
              <div className="space-y-3">
                {group.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-xs text-gray-400">
                        {member.role === 'owner' ? 'Vlastník' : 'Člen'}
                      </div>
                    </div>
                    {isOwner && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Odebrat člena"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Kalendář skupiny
                </h2>
                <Link
                  to="/"
                  className="btn btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nová událost
                </Link>
              </div>
              
              <CalendarView 
                events={events}
                onEventClick={(event) => {
                  window.location.href = `/events/${event.id}`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId}
          onClose={() => setShowAddMember(false)}
          onAdded={handleMemberAdded}
        />
      )}
    </div>
  )
}
