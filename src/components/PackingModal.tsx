import { useState } from 'react';
import { PackingItem, PackingCategory } from '../types';
import { X, Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS: { value: PackingCategory; label: string; emoji: string }[] = [
  { value: 'clothing',    label: '衣類',      emoji: '👕' },
  { value: 'toiletry',   label: '洗面用具',  emoji: '🪥' },
  { value: 'document',   label: '書類',      emoji: '📄' },
  { value: 'electronics',label: '電子機器',  emoji: '🔌' },
  { value: 'medicine',   label: '薬・衛生',  emoji: '💊' },
  { value: 'other',      label: 'その他',    emoji: '🎒' },
];

interface Props {
  initial?: PackingItem;
  onSave: (data: Omit<PackingItem, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function PackingModal({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    category: initial?.category ?? 'other' as PackingCategory,
    name: initial?.name ?? '',
    notes: initial?.notes ?? '',
    isChecked: initial?.isChecked ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {initial ? '持ち物を編集' : '持ち物を追加'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: opt.value })}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    form.category === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">持ち物名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例：パスポート"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="例：有効期限を確認"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
