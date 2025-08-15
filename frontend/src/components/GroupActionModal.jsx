import { Plus, Users, Search, X } from 'lucide-react'

export default function GroupActionModal({ onClose, onCreateGroup, onJoinPublicGroup }) {
  return (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/20 glass-header rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Skupiny
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 glass-button rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <button
              onClick={onCreateGroup}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Vytvořit novou skupinu</h3>
                  <p className="text-sm text-gray-600">Vytvořte vlastní skupinu pro organizaci událostí</p>
                </div>
              </div>
            </button>

            <button
              onClick={onJoinPublicGroup}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Připojit se ke skupině</h3>
                  <p className="text-sm text-gray-600">Najděte a připojte se k veřejným skupinám</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full btn btn-outline"
            >
              Zrušit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
