import { useState } from 'react';
import { Accommodation } from '../types';
import { X } from 'lucide-react';

interface Props {
  initial?: Accommodation;
  tripStartDate: string;
  tripEndDate: string;
  onSave: (data: Omit<Accommodation, 'id'>) => void;
  onClose: () => void;
}

export default function AccommodationModal({ initial, tripStartDate, tripEndDate, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Accommodation, 'id'>>({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    checkIn: initial?.checkIn ?? tripStartDate,
    checkOut: initial?.checkOut ?? tripEndDate,
    notes: initial?.notes ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {initial ? '宿泊先を編集' : '宿泊先を追加'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">宿泊先名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：ANAインターコンチネンタル石垣リゾート"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所（任意）</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="例：沖縄県石垣市真栄里354-1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">チェックイン</label>
                <input
                  type="date"
                  value={form.checkIn}
                  min={tripStartDate}
                  max={tripEndDate}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">チェックアウト</label>
                <input
                  type="date"
                  value={form.checkOut}
                  min={form.checkIn}
                  max={tripEndDate}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="部屋タイプ、特別リクエスト、チェックイン時間など"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 bg-sky-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
              >
                保存する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
