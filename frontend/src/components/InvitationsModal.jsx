import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const InvitationsModal = ({ isOpen, onClose, onResponded }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');

  useEffect(() => {
    console.log('InvitationsModal useEffect - isOpen:', isOpen);
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    console.log('Loading invitations...');
    setLoading(true);
    try {
      const response = await api.get('/events/invitations/pending');
      console.log('Invitations response:', response.data);
      setInvitations(response.data);
    } catch (error) {
      console.error('Error loading invitations:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Chyba při načítání pozvánek');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (eventId, status) => {
    if (status === 'maybe' && !suggestedDate) {
      toast.error('Pro "možná" navrhni jiný termín');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/events/${eventId}/respond`, {
        status,
        suggestedDate: status === 'maybe' ? suggestedDate : null,
        suggestedTime: status === 'maybe' ? suggestedTime : null
      });
      
      toast.success('Odpověď byla odeslána!');
      setRespondingTo(null);
      setSuggestedDate('');
      setSuggestedTime('');
      onResponded && onResponded();
      loadInvitations();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Chyba při odesílání odpovědi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'yes': return 'text-green-600 bg-green-100';
      case 'no': return 'text-red-600 bg-red-100';
      case 'maybe': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'yes': return 'Pojedu';
      case 'no': return 'Nepojedu';
      case 'maybe': return 'Možná';
      default: return 'Čeká na odpověď';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pozvánky na události</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading && invitations.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Načítám pozvánky...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nemáš žádné čekající pozvánky</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map(invitation => (
              <div key={invitation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{invitation.title}</h3>
                    <p className="text-gray-600">{invitation.group_name}</p>
                    <p className="text-sm text-gray-500">
                      Od: {invitation.creator_name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                    {getStatusText(invitation.status)}
                  </span>
                </div>

                {invitation.description && (
                  <p className="text-gray-700 mb-3">{invitation.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Datum:</span>
                    <p>{format(new Date(invitation.date), 'EEEE d. MMMM yyyy', { locale: cs })}</p>
                  </div>
                  {invitation.time && (
                    <div>
                      <span className="font-medium">Čas:</span>
                      <p>{invitation.time}</p>
                    </div>
                  )}
                  {invitation.location && (
                    <div className="col-span-2">
                      <span className="font-medium">Místo:</span>
                      <p>{invitation.location}</p>
                    </div>
                  )}
                </div>

                {respondingTo === invitation.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Navrhovaný termín (pro "možná"):
                      </label>
                      <input
                        type="date"
                        value={suggestedDate}
                        onChange={(e) => setSuggestedDate(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Navrhovaný čas:
                      </label>
                      <input
                        type="time"
                        value={suggestedTime}
                        onChange={(e) => setSuggestedTime(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespond(invitation.id, 'yes')}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Pojedu
                      </button>
                      <button
                        onClick={() => handleRespond(invitation.id, 'maybe')}
                        disabled={loading || !suggestedDate}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Možná
                      </button>
                      <button
                        onClick={() => handleRespond(invitation.id, 'no')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Nepojedu
                      </button>
                      <button
                        onClick={() => setRespondingTo(null)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingTo(invitation.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Odpovědět
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsModal;
