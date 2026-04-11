import { useState } from 'react';
import { WishlistItem, WishlistCategory, WishlistPriority } from '../types';
import { X } from 'lucide-react';

interface Props {
  initial?: WishlistItem;
  onSave: (data: Omit<WishlistItem, 'id'>) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: WishlistCategory; label: string }[] = [
  { value: 'restaurant', label: '🍽️ 飲食店' },
  { value: 'spot', label: '📍 スポット' },
  { value: 'shop', label: '🛍️ ショップ' },
  { value: 'activity', label: '🎯 アクティビティ' },
];

const PRIORITY_OPTIONS: { value: WishlistPriority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'border-red-400 bg-red-50 text-red-700' },
  { value: 'medium', label: '中', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { value: 'low', label: '低', color: 'border-gray-300 bg-gray-50 text-gray-600' },
];

export default function WishlistModal({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<WishlistItem, 'id'>>({
    category: initial?.category ?? 'spot',
    name: initial?.name ?? '',
    notes: initial?.notes ?? '',
    priority: initial?.priority ?? 'medium',
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
              {initial ? 'リストを編集' : '行きたい場所を追加'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: opt.value })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                      form.category === opt.value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：川平湾"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, priority: opt.value })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      form.priority === opt.value ? opt.color : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="営業時間、予算、おすすめポイントなど"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
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
                className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                追加する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
