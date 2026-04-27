import { useState } from 'react';
import { Flight, FlightDirection, TransportType } from '../types';
import { X } from 'lucide-react';

interface Props {
  initial?: Flight;
  tripStartDate: string;
  tripEndDate: string;
  onSave: (data: Omit<Flight, 'id'>) => void;
  onClose: () => void;
}

type TransportConfig = {
  emoji: string;
  label: string;
  operatorLabel: string;
  numberLabel: string;
  fromLabel: string;
  toLabel: string;
  operatorPlaceholder: string;
  numberPlaceholder: string;
  fromPlaceholder: string;
  toPlaceholder: string;
};

const TRANSPORT_CONFIG: Record<TransportType, TransportConfig> = {
  flight:     { emoji: '✈️', label: '飛行機',    operatorLabel: '航空会社',       numberLabel: '便名',       fromLabel: '出発空港',   toLabel: '到着空港',   operatorPlaceholder: 'ANA',        numberPlaceholder: 'NH987',     fromPlaceholder: '羽田空港 (HND)', toPlaceholder: '石垣空港 (ISG)' },
  shinkansen: { emoji: '🚅', label: '新幹線',    operatorLabel: '鉄道会社',       numberLabel: '列車名',     fromLabel: '出発駅',     toLabel: '到着駅',     operatorPlaceholder: 'JR東海',     numberPlaceholder: 'のぞみ5号',  fromPlaceholder: '東京駅',        toPlaceholder: '新大阪駅' },
  train:      { emoji: '🚃', label: '在来線',    operatorLabel: '鉄道会社',       numberLabel: '列車名',     fromLabel: '出発駅',     toLabel: '到着駅',     operatorPlaceholder: 'JR',         numberPlaceholder: '快速',       fromPlaceholder: '新宿駅',        toPlaceholder: '鎌倉駅' },
  bus:        { emoji: '🚌', label: 'バス',      operatorLabel: 'バス会社',       numberLabel: '便名・路線', fromLabel: '出発停留所', toLabel: '到着停留所', operatorPlaceholder: '西鉄バス',   numberPlaceholder: '高速バス',   fromPlaceholder: '博多バスターミナル', toPlaceholder: '長崎駅前' },
  ferry:      { emoji: '⛴️', label: 'フェリー',  operatorLabel: 'フェリー会社',   numberLabel: '便名',       fromLabel: '出発港',     toLabel: '到着港',     operatorPlaceholder: '石垣島ドリーム観光', numberPlaceholder: '第1便', fromPlaceholder: '石垣港',        toPlaceholder: '川平港' },
  rental_car: { emoji: '🚗', label: 'レンタカー', operatorLabel: 'レンタカー会社', numberLabel: '車種・クラス', fromLabel: '受取店舗',  toLabel: '返却店舗',   operatorPlaceholder: 'トヨタレンタカー', numberPlaceholder: 'コンパクト', fromPlaceholder: '石垣空港店',   toPlaceholder: '石垣空港店' },
};

const TRANSPORT_TYPES: TransportType[] = ['flight', 'shinkansen', 'train', 'bus', 'ferry', 'rental_car'];

export default function FlightModal({ initial, tripStartDate, tripEndDate, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Flight, 'id'>>({
    transportType: initial?.transportType ?? 'flight',
    direction: initial?.direction ?? 'outbound',
    airline: initial?.airline ?? '',
    flightNo: initial?.flightNo ?? '',
    departureAirport: initial?.departureAirport ?? '',
    arrivalAirport: initial?.arrivalAirport ?? '',
    date: initial?.date ?? tripStartDate,
    departureTime: initial?.departureTime ?? '',
    arrivalTime: initial?.arrivalTime ?? '',
    seatNo: initial?.seatNo ?? '',
    bookingRef: initial?.bookingRef ?? '',
    notes: initial?.notes ?? '',
  });

  const cfg = TRANSPORT_CONFIG[form.transportType];

  function handleTypeChange(t: TransportType) {
    setForm({ ...form, transportType: t, airline: '', flightNo: '', departureAirport: '', arrivalAirport: '' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {initial ? '交通手段を編集' : '交通手段を追加'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transport type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TRANSPORT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium border-2 transition-colors flex items-center justify-center gap-1 ${
                      form.transportType === t
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{TRANSPORT_CONFIG[t].emoji}</span>
                    <span>{TRANSPORT_CONFIG[t].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">方向</label>
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
                    {dir === 'outbound' ? `${cfg.emoji} 往路` : `↩️ 復路`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{cfg.operatorLabel}</label>
                <input
                  type="text"
                  value={form.airline}
                  onChange={(e) => setForm({ ...form, airline: e.target.value })}
                  placeholder={cfg.operatorPlaceholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{cfg.numberLabel}</label>
                <input
                  type="text"
                  value={form.flightNo}
                  onChange={(e) => setForm({ ...form, flightNo: e.target.value })}
                  placeholder={cfg.numberPlaceholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{cfg.fromLabel}</label>
              <input
                type="text"
                value={form.departureAirport}
                onChange={(e) => setForm({ ...form, departureAirport: e.target.value })}
                placeholder={cfg.fromPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{cfg.toLabel}</label>
              <input
                type="text"
                value={form.arrivalAirport}
                onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value })}
                placeholder={cfg.toPlaceholder}
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

            {(form.transportType === 'shinkansen' || form.transportType === 'train') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">席番号（任意）</label>
                <input
                  type="text"
                  value={form.seatNo}
                  onChange={(e) => setForm({ ...form, seatNo: e.target.value })}
                  placeholder="5号車 12番A席"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

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
