import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const InvitePeopleModal = ({ event, onClose, onInvited }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Chyba při načítání přátel');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleFriendToggle = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleEmailInvite = () => {
    if (!emailInput.trim()) {
      toast.error('Zadejte email');
      return;
    }
    
    if (!selectedFriends.includes(emailInput)) {
      setSelectedFriends(prev => [...prev, emailInput]);
    }
    setEmailInput('');
  };

  const handleSendInvitations = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Vyberte alespoň jednoho člověka');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedFriends.map(async (friendOrEmail) => {
        // Check if it's an email or friend ID
        const isEmail = friendOrEmail.includes('@');
        
        if (isEmail) {
          // Send invitation by email
          return api.post('/invitations', {
            eventId: event.id,
            inviteeEmail: friendOrEmail,
            message: message || undefined
          });
        } else {
          // Find friend by ID and get their email
          const friend = friends.find(f => f.id === friendOrEmail);
          if (friend) {
            return api.post('/invitations', {
              eventId: event.id,
              inviteeEmail: friend.email,
              message: message || undefined
            });
          }
        }
      });

      await Promise.all(promises);
      
      toast.success('Pozvánky byly odeslány!');
      onInvited?.();
      onClose();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Chyba při odesílání pozvánek');
    } finally {
      setLoading(false);
    }
  };

  const removeSelected = (friendOrEmail) => {
    setSelectedFriends(prev => prev.filter(item => item !== friendOrEmail));
  };

  const getSelectedName = (friendOrEmail) => {
    if (friendOrEmail.includes('@')) {
      return friendOrEmail; // Email
    }
    const friend = friends.find(f => f.id === friendOrEmail);
    return friend ? friend.name : 'Neznámý';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pozvat lidi na událost</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Událost:</h3>
          <p className="text-gray-700">{event.title}</p>
          <p className="text-sm text-gray-500">
            {event.date} {event.time && `v ${event.time}`}
          </p>
        </div>

        {/* Email input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Pozvat podle emailu:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleEmailInvite()}
            />
            <button
              onClick={handleEmailInvite}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Přidat
            </button>
          </div>
        </div>

        {/* Friends list */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Pozvat přátele:
          </label>
          {loadingFriends ? (
            <p className="text-gray-500">Načítání přátel...</p>
          ) : (
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md">
              {friends.length === 0 ? (
                <p className="p-2 text-gray-500">Žádní přátelé</p>
              ) : (
                friends.map(friend => (
                  <label key={friend.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => handleFriendToggle(friend.id)}
                      className="mr-2"
                    />
                    <span>{friend.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected people */}
        {selectedFriends.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Pozvaní lidé:
            </label>
            <div className="space-y-1">
              {selectedFriends.map(friendOrEmail => (
                <div key={friendOrEmail} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{getSelectedName(friendOrEmail)}</span>
                  <button
                    onClick={() => removeSelected(friendOrEmail)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Zpráva (volitelně):
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Napište zprávu k pozvánce..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Zrušit
          </button>
          <button
            onClick={handleSendInvitations}
            disabled={loading || selectedFriends.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Odesílání...' : 'Odeslat pozvánky'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePeopleModal;
