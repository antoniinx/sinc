import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const InvitationsModal = ({ onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invitations');
      setInvitations(response.data);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Chyba při načítání pozvánek');
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId, status) => {
    try {
      setResponding(invitationId);
      
      const data = { status };
      if (status === 'suggested') {
        if (!suggestedDate || !suggestedTime) {
          toast.error('Zadejte navrhovaný termín');
          return;
        }
        data.suggestedDate = suggestedDate;
        data.suggestedTime = suggestedTime;
      }

      await api.put(`/invitations/${invitationId}`, data);
      
      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status }
            : inv
        )
      );

      const statusText = {
        accepted: 'přijal/a',
        declined: 'odmítl/a',
        suggested: 'navrhl/a jiný termín'
      }[status];

      toast.success(`Pozvánku jste ${statusText}`);
      
      // Reset form
      setSuggestedDate('');
      setSuggestedTime('');
      setResponding(null);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Chyba při odpovídání na pozvánku');
      setResponding(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'declined':
        return 'text-red-600 bg-red-100';
      case 'suggested':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Čeká na odpověď';
      case 'accepted':
        return 'Přijato';
      case 'declined':
        return 'Odmítnuto';
      case 'suggested':
        return 'Navržen jiný termín';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pozvánky na události</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Invitations list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Načítání...</p>
          ) : invitations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Žádné pozvánky</p>
          ) : (
            <div className="space-y-4">
              {invitations.map(invitation => (
                <div
                  key={invitation.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{invitation.event_title}</h3>
                      <p className="text-gray-600">
                        Pozval/a: {invitation.inviter_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(invitation.event_date)} {invitation.event_time && `v ${invitation.event_time}`}
                      </p>
                      {invitation.event_location && (
                        <p className="text-sm text-gray-500">📍 {invitation.event_location}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                      {getStatusText(invitation.status)}
                    </span>
                  </div>

                  {invitation.message && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{invitation.message}</p>
                    </div>
                  )}

                  {invitation.suggested_date && invitation.suggested_time && (
                    <div className="mb-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800">Navrhovaný termín:</p>
                      <p className="text-sm text-blue-700">
                        {formatDate(invitation.suggested_date)} v {invitation.suggested_time}
                      </p>
                    </div>
                  )}

                  {invitation.status === 'pending' && (
                    <div className="space-y-3">
                      {/* Suggested date/time inputs */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={suggestedDate}
                          onChange={(e) => setSuggestedDate(e.target.value)}
                          placeholder="Navrhované datum"
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          type="time"
                          value={suggestedTime}
                          onChange={(e) => setSuggestedTime(e.target.value)}
                          placeholder="Navrhovaný čas"
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToInvitation(invitation.id, 'accepted')}
                          disabled={responding === invitation.id}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {responding === invitation.id ? 'Odesílání...' : 'Přijmout'}
                        </button>
                        <button
                          onClick={() => respondToInvitation(invitation.id, 'declined')}
                          disabled={responding === invitation.id}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                          {responding === invitation.id ? 'Odesílání...' : 'Odmítnout'}
                        </button>
                        <button
                          onClick={() => respondToInvitation(invitation.id, 'suggested')}
                          disabled={responding === invitation.id || !suggestedDate || !suggestedTime}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                          {responding === invitation.id ? 'Odesílání...' : 'Navrhnout termín'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationsModal;
