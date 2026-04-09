import { useState } from 'react';
import { Trip } from '../types';
import { Plus, Plane, Trash2, MapPin, Calendar, LogOut, Loader2 } from 'lucide-react';

const EMOJI_OPTIONS = ['🏝️', '🗻', '🌸', '🏔️', '🌴', '🎌', '🗼', '🌊', '🏕️', '✈️', '🚢', '🌺'];

interface Props {
  trips: Trip[];
  loading: boolean;
  userEmail: string;
  onCreate: (data: Omit<Trip, 'id' | 'flights' | 'accommodations' | 'scheduleItems' | 'wishlist' | 'packingItems' | 'createdAt'>) => Promise<void>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onSignOut: () => void;
}

export default function TripListPage({ trips, loading, userEmail, onCreate, onSelect, onDelete, onSignOut }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    coverEmoji: '✈️',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.destination || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await onCreate({ ...form, isShared: false, shareToken: '' });
      setShowModal(false);
      setForm({ name: '', destination: '', startDate: '', endDate: '', coverEmoji: '✈️' });
    } finally {
      setSaving(false);
    }
  }

  function getTripNights(trip: Trip): number {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getTripStatus(trip: Trip): { label: string; color: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (today < start) return { label: '予定', color: 'bg-blue-100 text-blue-700' };
    if (today > end) return { label: '終了', color: 'bg-gray-100 text-gray-600' };
    return { label: '旅行中', color: 'bg-green-100 text-green-700' };
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 30%, #f0f9ff 60%, #ecfeff 100%)' }}>
      {/* Sky Hero Banner */}
      <div className="relative overflow-hidden" style={{ height: '160px' }}>
        <img
          src="/sky.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        <div className="relative h-full max-w-5xl mx-auto px-6 flex items-end pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow">旅行プランナー</h1>
                <p className="text-xs text-white/80">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white text-sky-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-50 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                旅行を追加
              </button>
              <button
                onClick={onSignOut}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-8 min-h-screen">
        {/* Decorative blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 70%)' }} />
          <div className="absolute top-40 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a5f3fc, transparent 70%)' }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #bae6fd, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #cffafe, transparent 70%)' }} />
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-gray-500 text-lg mb-6">まだ旅行が登録されていません</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors"
            >
              最初の旅行を追加する
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              旅行一覧 ({trips.length}件)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => {
                const status = getTripStatus(trip);
                const nights = getTripNights(trip);
                return (
                  <div
                    key={trip.id}
                    onClick={() => onSelect(trip.id)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-sky-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{trip.coverEmoji}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`「${trip.name}」を削除しますか？`)) onDelete(trip.id);
                          }}
                          className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        {' 〜 '}
                        {new Date(trip.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        {' '}({nights}泊{nights + 1}日)
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add card */}
              <div
                onClick={() => setShowModal(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 cursor-pointer hover:border-sky-300 hover:bg-sky-50 transition-all flex flex-col items-center justify-center min-h-[180px] gap-3"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-sky-500" />
                </div>
                <span className="text-sm font-medium text-sky-500">新しい旅行を追加</span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal sky header */}
            <div className="relative h-28 overflow-hidden">
              <img src="/sky.png" alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white drop-shadow">新しい旅行を追加</h2>
                <span className="text-2xl">✈️</span>
              </div>
            </div>
            <div className="p-6 pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">アイコン</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, coverEmoji: emoji })}
                        className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center border-2 transition-colors ${
                          form.coverEmoji === emoji ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">旅行名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例：沖縄旅行 2026"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目的地 *</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="例：沖縄県 石垣島"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">出発日 *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">帰宅日 *</label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-sky-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    作成する
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
