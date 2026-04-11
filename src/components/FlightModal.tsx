import { useState } from 'react';
import { Flight, FlightDirection } from '../types';
import { X } from 'lucide-react';

interface Props {
  initial?: Flight;
  tripStartDate: string;
  tripEndDate: string;
  onSave: (data: Omit<Flight, 'id'>) => void;
  onClose: () => void;
}

export default function FlightModal({ initial, tripStartDate, tripEndDate, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Flight, 'id'>>({
    direction: initial?.direction ?? 'outbound',
    airline: initial?.airline ?? '',
    flightNo: initial?.flightNo ?? '',
    departureAirport: initial?.departureAirport ?? '',
    arrivalAirport: initial?.arrivalAirport ?? '',
    date: initial?.date ?? tripStartDate,
    departureTime: initial?.departureTime ?? '',
    arrivalTime: initial?.arrivalTime ?? '',
    bookingRef: initial?.bookingRef ?? '',
    notes: initial?.notes ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {initial ? 'フライトを編集' : 'フライトを追加'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
              <div className="grid grid-cols-2 gap-2">
                {(['outbound', 'return'] as FlightDirection[]).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setForm({ ...form, direction: dir })}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      form.direction === dir
                        ? 'border-sky-500 bg-sky-50 text-sky-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {dir === 'outbound' ? '✈️ 往路' : '🛬 復路'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">航空会社</label>
                <input
                  type="text"
                  value={form.airline}
                  onChange={(e) => setForm({ ...form, airline: e.target.value })}
                  placeholder="ANA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">便名</label>
                <input
                  type="text"
                  value={form.flightNo}
                  onChange={(e) => setForm({ ...form, flightNo: e.target.value })}
                  placeholder="NH987"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出発空港</label>
              <input
                type="text"
                value={form.departureAirport}
                onChange={(e) => setForm({ ...form, departureAirport: e.target.value })}
                placeholder="羽田空港 (HND)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">到着空港</label>
              <input
                type="text"
                value={form.arrivalAirport}
                onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value })}
                placeholder="石垣空港 (ISG)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={form.date}
                min={tripStartDate}
                max={tripEndDate}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出発時刻</label>
                <input
                  type="time"
                  value={form.departureTime}
                  onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">到着時刻</label>
                <input
                  type="time"
                  value={form.arrivalTime}
                  onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予約番号（任意）</label>
              <input
                type="text"
                value={form.bookingRef}
                onChange={(e) => setForm({ ...form, bookingRef: e.target.value })}
                placeholder="ABC123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
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
