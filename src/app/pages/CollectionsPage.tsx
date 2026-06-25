import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layers, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const COLOR_SWATCHES = [
  '#8B5CF6', '#EC4899', '#E8820C', '#E85D04', '#3B82F6',
  '#6D28D9', '#CC0000', '#0D9488'
];

export default function CollectionsPage() {
  const { user, collections, addCollection, deleteCollection } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_SWATCHES[0]);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/collections');
  }, [user]);

  if (!user) return null;

  const handleCreate = () => {
    if (!name.trim()) { toast.error('Collection name is required'); return; }
    addCollection({ name: name.trim(), description: description.trim(), color, items: [] });
    toast.success('Collection saved!');
    setName(''); setDescription(''); setColor(COLOR_SWATCHES[0]); setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteCollection(id);
    toast.success('Collection deleted');
    setShowDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#CCCCCC] px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#FFF2EB' }} className="p-2 rounded-xl">
              <Layers size={22} style={{ color: '#E85D04' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Collections</h1>
              <p className="text-sm text-[#888888]">Organize your sourcing into lists</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E85D04' }}
          >
            <Plus size={16} /> New Collection
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#FFF2EB' }}>
              <Layers size={48} className="text-[#CCCCCC]" />
            </div>
            <h2 className="text-xl font-semibold text-[#444444] mb-2">No collections yet</h2>
            <p className="text-sm text-[#888888] mb-8">Create your first collection to organize your product sourcing.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E85D04' }}
            >
              <Plus size={18} /> New Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {collections.map(col => (
              <div
                key={col.id}
                className="bg-white rounded-xl overflow-hidden border border-[#CCCCCC] hover:shadow-lg hover:border-[#E85D04] transition-all cursor-pointer relative group"
                onClick={() => navigate(`/collections/${col.id}`)}
              >
                {/* Main card body */}
                <div className="p-6 flex flex-col items-start min-h-36">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: col.color + '20' }}>
                    <Layers size={24} style={{ color: col.color }} />
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] mb-1 truncate w-full">{col.name}</h3>
                  {col.description && (
                    <p className="text-sm text-[#888888] line-clamp-2 mb-3">{col.description}</p>
                  )}
                  <div className="mt-auto flex items-center gap-1 text-xs text-[#888888]">
                    <Layers size={12} />
                    <span>{col.items.length} items</span>
                  </div>
                </div>
                {/* Color accent strip */}
                <div className="h-1.5 w-full" style={{ backgroundColor: col.color }} />

                {/* Delete button */}
                <button
                  onClick={e => { e.stopPropagation(); setShowDeleteId(col.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <X size={14} className="text-[#888888] hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create collection modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} className="text-[#888888]" />
            </button>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">Create Collection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="dresses"
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="i well..."
                  rows={3}
                  className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E85D04] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444444] mb-2">COLOR</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 border-2"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? '#1A1A1A' : 'transparent',
                        boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E85D04' }}>
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Delete Collection?</h2>
            <p className="text-sm text-[#888888] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteId(null)} className="flex-1 py-2.5 border border-[#CCCCCC] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteId)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: '#CC0000' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
