import { useState, useEffect } from 'react'
import { Calendar, CalendarDays, Users, Plus, LogOut, User, Settings, ChevronDown, UserPlus, Search, X, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, addWeeks, addDays } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import EnhancedCalendar from '../components/EnhancedCalendar'
import EventDetailModal from '../components/EventDetailModal'
import FriendProfileModal from '../components/FriendProfileModal'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinPublicGroupModal from '../components/JoinPublicGroupModal'
import GroupActionModal from '../components/GroupActionModal'
import EnhancedCreateEventModal from '../components/EnhancedCreateEventModal'
import EditGroupModal from '../components/EditGroupModal'
import ProfileSettingsModal from '../components/ProfileSettingsModal'

export default function Dashboard() {
  const { user, logout, setUser } = useAuth()
  const [groups, setGroups] = useState([])
  const [events, setEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  // Multiple group selection support
  const [activeGroupIds, setActiveGroupIds] = useState(new Set())
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [friendEvents, setFriendEvents] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinPublicGroup, setShowJoinPublicGroup] = useState(false)
  const [showGroupAction, setShowGroupAction] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showEditGroup, setShowEditGroup] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [openEventId, setOpenEventId] = useState(null)
  const [activeTab, setActiveTab] = useState('groups')
  const [calendarView, setCalendarView] = useState('month')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [openFriendProfile, setOpenFriendProfile] = useState(null)

  const handlePrev = () => {
    setCalendarDate(prev => {
      if (calendarView === 'month') return addMonths(prev, -1)
      if (calendarView === 'week') return addWeeks(prev, -1)
      return addDays(prev, -1)
    })
  }

  const handleNext = () => {
    setCalendarDate(prev => {
      if (calendarView === 'month') return addMonths(prev, 1)
      if (calendarView === 'week') return addWeeks(prev, 1)
      return addDays(prev, 1)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, eventsRes, friendsRes, pendingRes] = await Promise.all([
        api.get('/groups'),
        api.get('/events'),
        api.get('/friends'),
        api.get('/friends/pending')
      ])
      setGroups(groupsRes.data)
      setEvents(eventsRes.data)
      setFriends(friendsRes.data)
      setPendingRequests(pendingRes.data)
      // Initialize with all groups active by default
      setActiveGroupIds(new Set((groupsRes.data || []).map(g => g.id)))
    } catch (error) {
      toast.error('Chyba při načítání dat')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Odhlášení úspěšné')
    } catch (error) {
      toast.error('Chyba při odhlášení')
    }
  }

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev])
    setShowCreateGroup(false)
    setShowGroupAction(false)
    toast.success('Skupina vytvořena!')
  }

  const handleGroupJoined = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev])
    setShowJoinPublicGroup(false)
    setShowGroupAction(false)
    toast.success('Úspěšně jste se připojili ke skupině!')
  }

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev])
    setShowCreateEvent(false)
    setSelectedSlot(null)
    toast.success('Událost vytvořena!')
  }

  const handleEventDeleted = (deletedEventId) => {
    setEvents((prev) => prev.filter(event => event.id !== deletedEventId))
    setOpenEventId(null)
    toast.success('Událost smazána!')
  }

  const handleGroupUpdated = (updatedGroup) => {
    setGroups((prev) => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
    setShowEditGroup(false)
    setEditingGroup(null)
  }

  const handleGroupDeleted = (deletedGroupId) => {
    setGroups((prev) => prev.filter(g => g.id !== deletedGroupId))
    setShowEditGroup(false)
    setEditingGroup(null)
    // Remove from active groups if it was selected
    setActiveGroupIds(prev => {
      const copy = new Set(prev)
      copy.delete(deletedGroupId)
      return copy
    })
  }

  const handleEditGroup = (group) => {
    setEditingGroup(group)
    setShowEditGroup(true)
  }

  const handleManageGroup = (group) => {
    setEditingGroup(group)
    setShowEditGroup(true)
  }

  const handleProfileUpdated = (updatedUser) => {
    // Update the user in AuthContext
    // This would need to be implemented in AuthContext
    toast.success('Profil byl aktualizován')
    setShowProfileSettings(false)
  }

  // Friends functions
  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await api.get(`/friends/search/${encodeURIComponent(searchEmail)}`)
      setSearchResults(response.data)
    } catch (error) {
      toast.error('Chyba při vyhledávání')
    }
  }

  const handleSendFriendRequest = async (friendEmail) => {
    // Optimistická odezva
    toast.loading('Odesílám žádost…', { id: 'friend-req' })
    try {
      await api.post('/friends/request', { friendEmail })
      toast.success('Žádost o přátelství odeslána', { id: 'friend-req' })
      setSearchEmail('')
      setSearchResults([])
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Chyba při odesílání žádosti', { id: 'friend-req' })
    }
  }

  const handleAcceptRequest = async (friendshipId) => {
    toast.loading('Přijímám žádost…', { id: `acc-${friendshipId}` })
    try {
      await api.put(`/friends/accept/${friendshipId}`)
      toast.success('Žádost o přátelství přijata', { id: `acc-${friendshipId}` })
      fetchData()
    } catch (error) {
      toast.error('Chyba při přijímání žádosti', { id: `acc-${friendshipId}` })
    }
  }

  const handleRejectRequest = async (friendshipId) => {
    toast.loading('Zamítám žádost…', { id: `rej-${friendshipId}` })
    try {
      await api.put(`/friends/reject/${friendshipId}`)
      toast.success('Žádost o přátelství zamítnuta', { id: `rej-${friendshipId}` })
      fetchData()
    } catch (error) {
      toast.error('Chyba při zamítání žádosti', { id: `rej-${friendshipId}` })
    }
  }

  const handleRemoveFriend = async (friendshipId) => {
    toast.loading('Odstraňuji…', { id: `rem-${friendshipId}` })
    try {
      await api.delete(`/friends/${friendshipId}`)
      toast.success('Přítel odstraněn', { id: `rem-${friendshipId}` })
      fetchData()
      if (selectedFriend) {
        setSelectedFriend(null)
        setFriendEvents([])
      }
    } catch (error) {
      toast.error('Chyba při odstraňování přítele', { id: `rem-${friendshipId}` })
    }
  }

  const handleViewFriendCalendar = async (friend) => {
    try {
      const response = await api.get(`/friends/${friend.id}/calendar`)
      const transformedEvents = response.data.map(event => ({
        ...event,
        group_id: null,
        color: event.group_color
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

  // Memoized events for calendar, ensures consistent filtering and avoids recalculation in render
  const displayEvents = selectedFriend
    ? friendEvents
    : events.filter(e => activeGroupIds.has(e.group_id))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/favicon.svg" alt="SINC" className="h-8 w-8" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                SINC
              </h1>
            </div>
            {/* Calendar Controls in Navbar */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setCalendarDate(new Date())}
                className="btn btn-ghost btn-nav"
              >
                Dnes
              </button>
                   <div className="flex items-center space-x-1">
                <button onClick={handlePrev} className="btn-icon">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={handleNext} className="btn-icon">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="px-3 text-base md:text-lg font-semibold uppercase tracking-wide text-gray-900 min-w-[180px] text-center">
                {calendarDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
              </div>
                   <div className="segmented">
                <button onClick={() => setCalendarView('month')} className={`${calendarView === 'month' ? 'active' : ''}`}>Měsíc</button>
                <button onClick={() => setCalendarView('week')} className={`${calendarView === 'week' ? 'active' : ''}`}>Týden</button>
                <button onClick={() => setCalendarView('day')} className={`${calendarView === 'day' ? 'active' : ''}`}>Den</button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="btn btn-ghost btn-nav flex items-center space-x-2 pl-0 pr-3"
                >
                  <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white font-medium shrink-0 overflow-hidden rounded-none">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-nav flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Odhlásit
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-5">
              {/* Quick Action: Create Event at top */}
              <div className="mb-4">
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vytvořit událost
                </button>
              </div>
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'groups' ? 'bg-white text-primary-700' : 'text-gray-800 hover:text-gray-900'}`}
                >
                  Skupiny ({groups.length})
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'friends' ? 'bg-white text-primary-700' : 'text-gray-800 hover:text-gray-900'}`}
                >
                  Přátelé ({friends.length})
                </button>
              </div>

              {/* Groups Section */}
              {activeTab === 'groups' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Moje skupiny
                    </h2>
                    <button
                      onClick={() => setShowGroupAction(true)}
                      className="p-1 text-gray-700 hover:text-primary-700 border border-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                
                <div className="space-y-2">
                  {groups.map((group) => {
                    const isActive = activeGroupIds.has(group.id)
                    return (
                      <div
                        key={group.id}
                        className={`w-full p-3 list-row ${isActive ? 'border-transparent' : ''}`}
                        style={isActive ? { backgroundColor: group.color || '#3B82F6', color: '#fff' } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex-1 flex items-center space-x-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => {
                                setActiveGroupIds(prev => {
                                  const copy = new Set(prev)
                                  if (copy.has(group.id)) {
                                    copy.delete(group.id)
                                  } else {
                                    copy.add(group.id)
                                  }
                                  return copy
                                })
                                // When toggling groups, exit friend view
                                setSelectedFriend(null)
                                setFriendEvents([])
                              }}
                              className="custom-checkbox"
                              style={{ '--cbg': group.color || '#3B82F6' }}
                            />
                            <span className="font-medium">{group.name}</span>
                          </label>
                          <button
                            onClick={() => handleEditGroup(group)}
                            className={`inline-flex items-center px-2.5 py-1.5 text-sm font-medium rounded-none transition-colors ${isActive ? 'btn-outline-inverse' : 'btn-outline'}`}
                            title="Detail skupiny"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Nastavení
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                                     {groups.length === 0 && (
                     <div className="text-center py-4 text-gray-500">
                       Zatím nemáte žádné skupiny
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Friends Section */}
             {activeTab === 'friends' && (
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                     <UserPlus className="h-5 w-5 mr-2" />
                     Přátelé
                   </h2>
                 </div>

                  {/* Search for new friends */}
                  <div className="mb-4">
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
                          <div key={user.id} className="w-full p-3 list-row flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary-600 text-white flex items-center justify-center font-medium text-xs">
                                {user.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  user.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="text-sm font-medium">{user.name}</div>
                            </div>
                            <button
                              onClick={() => handleSendFriendRequest(user.email)}
                              className="btn btn-primary btn-sm inline-flex items-center"
                              title="Přidat přítele"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />Přidat
                            </button>
                          </div>
                        ))}
                      </div>
                   )}
                 </div>

                 {/* Pending requests */}
                 {pendingRequests.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Čekající žádosti</h3>
                      <div className="space-y-2">
                        {pendingRequests.map((request) => (
                          <div key={request.friendship_id} className="w-full p-3 list-row flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary-600 text-white flex items-center justify-center font-medium text-xs">
                                {request.avatar ? (
                                  <img src={request.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  request.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="text-sm font-medium">{request.name}</div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleAcceptRequest(request.friendship_id)}
                                className="btn btn-primary btn-sm inline-flex items-center"
                                title="Přijmout"
                              >
                                <Check className="h-3 w-3 mr-1" />Přijmout
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.friendship_id)}
                                className="btn btn-danger btn-sm inline-flex items-center"
                                title="Odmítnout"
                              >
                                <X className="h-3 w-3 mr-1" />Odmítnout
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 )}

                 {/* Friends list */}
                  <div className="space-y-2">
                   {friends.map((friend) => (
                      <div key={friend.friendship_id} className="w-full p-3 list-row flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary-600 text-white flex items-center justify-center font-medium text-xs">
                           {friend.avatar ? (
                              <img src={friend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             friend.name?.charAt(0)?.toUpperCase() || 'U'
                           )}
                         </div>
                          <div className="text-sm font-medium">{friend.name}</div>
                       </div>
                        <button
                          onClick={() => setOpenFriendProfile(friend)}
                          className="btn btn-primary btn-sm inline-flex items-center"
                          title="Profil"
                        >
                          <User className="h-4 w-4 mr-1" />Profil
                        </button>
                     </div>
                   ))}
                   
                   {friends.length === 0 && (
                     <div className="text-center py-4 text-gray-500">
                       Zatím nemáte žádné přátele
                     </div>
                   )}
                 </div>
               </div>
             )}

              
            </div>
          </div>

          {/* Main Content */}
           <div className="flex-1 mt-0">
            <div className="p-0 h-[calc(100vh-9rem)]">
              <div className="h-full relative">
                 <EnhancedCalendar 
                   events={displayEvents}
                   groups={groups}
                    view={calendarView}
                    date={calendarDate}
                    onView={setCalendarView}
                    onNavigate={setCalendarDate}
                    hideToolbar={true}
                   onOpenEvent={(event) => setOpenEventId(event.id)}
                   onSelectSlot={(slot) => {
                     setSelectedSlot(slot)
                     setShowCreateEvent(true)
                   }}
                  />
                  {openEventId && (
                   <>
                     <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setOpenEventId(null)}></div>
                     <div className="absolute inset-0 z-[70]">
                       <EventDetailModal
                         eventId={openEventId}
                         onClose={() => setOpenEventId(null)}
                         onDeleted={handleEventDeleted}
                       />
                     </div>
                   </>
                 )}

                  {openFriendProfile && (
                    <>
                      <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setOpenFriendProfile(null)}></div>
                      <div className="absolute inset-0 z-[70]">
                        <FriendProfileModal 
                          friend={openFriendProfile} 
                          onClose={() => setOpenFriendProfile(null)}
                          onFriendRemoved={handleRemoveFriend}
                        />
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGroupAction && (
        <GroupActionModal
          onClose={() => setShowGroupAction(false)}
          onCreateGroup={() => setShowCreateGroup(true)}
          onJoinPublicGroup={() => setShowJoinPublicGroup(true)}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={handleGroupCreated}
        />
      )}

      {showJoinPublicGroup && (
        <JoinPublicGroupModal
          onClose={() => setShowJoinPublicGroup(false)}
          onJoined={handleGroupJoined}
        />
      )}
      
      {showCreateEvent && (
        <EnhancedCreateEventModal
          groups={groups}
          selectedSlot={selectedSlot}
          onClose={() => {
            setShowCreateEvent(false)
            setSelectedSlot(null)
          }}
          onCreated={handleEventCreated}
        />
      )}

      {showEditGroup && editingGroup && (
        <EditGroupModal
          group={editingGroup}
          userRole={editingGroup.role}
          onClose={() => {
            setShowEditGroup(false)
            setEditingGroup(null)
          }}
          onUpdated={handleGroupUpdated}
          onDeleted={handleGroupDeleted}
        />
      )}

      {showProfileSettings && (
        <ProfileSettingsModal
          user={user}
          onClose={() => setShowProfileSettings(false)}
          onUpdated={handleProfileUpdated}
        />
      )}

      
    </div>
  )
}
