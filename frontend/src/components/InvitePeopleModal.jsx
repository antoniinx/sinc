import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const InvitePeopleModal = ({ isOpen, onClose, eventId, groupId, onInvited }) => {
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupMembers();
    }
  }, [isOpen, groupId]);

  const loadGroupMembers = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setGroupMembers(response.data);
    } catch (error) {
      console.error('Error loading group members:', error);
      toast.error('Chyba při načítání členů skupiny');
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Vyber alespoň jednoho člověka');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/events/${eventId}/invite`, {
        userIds: selectedUsers
      });
      
      toast.success('Pozvánky byly odeslány!');
      setSelectedUsers([]);
      onInvited && onInvited();
      onClose();
    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error('Chyba při odesílání pozvánek');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <p className="text-gray-600 mb-3">
            Vyber lidi ze skupiny, které chceš pozvat:
          </p>
          
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {groupMembers.map(member => (
              <div
                key={member.user_id}
                className={`flex items-center p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedUsers.includes(member.user_id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleUserToggle(member.user_id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(member.user_id)}
                  onChange={() => handleUserToggle(member.user_id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Zrušit
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || selectedUsers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Odesílám...' : `Pozvat (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePeopleModal;
