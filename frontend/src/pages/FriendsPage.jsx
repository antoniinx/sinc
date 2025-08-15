import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, Calendar, Search, X, Check, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import EnhancedCalendar from '../components/EnhancedCalendar'

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [friendEvents, setFriendEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('friends')

  useEffect(() => {
    fetchFriendsData()
  }, [])

  const fetchFriendsData = async () => {
    try {
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/pending'),
        api.get('/friends/sent')
      ])
      setFriends(friendsRes.data)
      setPendingRequests(pendingRes.data)
      setSentRequests(sentRes.data)
    } catch (error) {
      toast.error('Chyba při načítání přátel')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await api.get(`/friends/search/${searchEmail}`)
      setSearchResults(response.data)
    } catch (error) {
      toast.error('Chyba při vyhledávání')
    }
  }

  const handleSendFriendRequest = async (friendEmail) => {
    try {
      await api.post('/friends/request', { friendEmail })
      toast.success('Žádost o přátelství odeslána')
      setSearchEmail('')
      setSearchResults([])
      fetchFriendsData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při odesílání žádosti')
    }
  }

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await api.put(`/friends/accept/${friendshipId}`)
      toast.success('Žádost o přátelství přijata')
      fetchFriendsData()
    } catch (error) {
      toast.error('Chyba při přijímání žádosti')
    }
  }

  const handleRejectRequest = async (friendshipId) => {
    try {
      await api.put(`/friends/reject/${friendshipId}`)
      toast.success('Žádost o přátelství zamítnuta')
      fetchFriendsData()
    } catch (error) {
      toast.error('Chyba při zamítání žádosti')
    }
  }

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await api.delete(`/friends/${friendshipId}`)
      toast.success('Přítel odstraněn')
      fetchFriendsData()
      if (selectedFriend) {
        setSelectedFriend(null)
        setFriendEvents([])
      }
    } catch (error) {
      toast.error('Chyba při odstraňování přítele')
    }
  }

  const handleViewFriendCalendar = async (friend) => {
    try {
      const response = await api.get(`/friends/${friend.id}/calendar`)
      // Transform events to match the expected format
      const transformedEvents = response.data.map(event => ({
        ...event,
        group_id: null, // We don't have group_id for friend events
        color: event.group_color // Use group_color directly
      }))
      setFriendEvents(transformedEvents)
      setSelectedFriend(friend)
    } catch (error) {
      toast.error('Chyba při načítání kalendáře přítele')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Přátelé
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'friends'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Přátelé ({friends.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Žádosti ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'sent'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Odeslané ({sentRequests.length})
                </button>
              </div>

              {/* Search for new friends */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Přidat přítele</h3>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="E-mail uživatele"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                    className="flex-1 input text-sm"
                  />
                  <button
                    onClick={handleSearchUsers}
                    className="btn btn-primary btn-sm"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(user.email)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Přidat přítele"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content based on active tab */}
              {activeTab === 'friends' && (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div key={friend.friendship_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            friend.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{friend.name}</div>
                          <div className="text-xs text-gray-500">{friend.email}</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewFriendCalendar(friend)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Zobrazit kalendář"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.friendship_id)}
                          className="text-red-600 hover:text-red-700"
                          title="Odstranit přítele"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {friends.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Zatím nemáte žádné přátele
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.friendship_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                          {request.avatar ? (
                            <img src={request.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            request.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{request.name}</div>
                          <div className="text-xs text-gray-500">{request.email}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(request.request_created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAcceptRequest(request.friendship_id)}
                          className="text-green-600 hover:text-green-700"
                          title="Přijmout"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.friendship_id)}
                          className="text-red-600 hover:text-red-700"
                          title="Odmítnout"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingRequests.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Žádné čekající žádosti
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sent' && (
                <div className="space-y-2">
                  {sentRequests.map((request) => (
                    <div key={request.friendship_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                          {request.avatar ? (
                            <img src={request.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            request.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{request.name}</div>
                          <div className="text-xs text-gray-500">{request.email}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(request.request_created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Čeká na odpověď
                      </div>
                    </div>
                  ))}
                  
                  {sentRequests.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Žádné odeslané žádosti
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedFriend ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                      {selectedFriend.avatar ? (
                        <img src={selectedFriend.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        selectedFriend.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Kalendář - {selectedFriend.name}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedFriend.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFriend(null)
                      setFriendEvents([])
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="h-[600px]">
                  <EnhancedCalendar 
                    events={friendEvents}
                    groups={[]}
                    onEventClick={(event) => {
                      // Navigate to event detail if needed
                      console.log('Friend event clicked:', event)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Vyberte přítele
                  </h3>
                  <p className="text-gray-500">
                    Klikněte na ikonu kalendáře u přítele pro zobrazení jeho kalendáře
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
