import { useEffect, useState } from 'react';
import { Trip, ScheduleItem, WishlistItem } from '../types';
import { loadSharedTrip } from '../db';
import { getTripDates, formatDate, formatDateShort } from '../store';
import {
  Plane, Hotel, Calendar, Star, Clock, MapPin,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Lock
} from 'lucide-react';

const CATEGORY_STYLES: Record<ScheduleItem['category'], { bg: string; text: string; border: string; label: string; emoji: string }> = {
  tour:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'ツアー/体験', emoji: '🤿' },
  food:      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  label: '食事',       emoji: '🍽️' },
  transport: { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     label: '移動',       emoji: '🚌' },
  free:      { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  label: '自由時間',   emoji: '🌴' },
};

const WISHLIST_LABELS: Record<WishlistItem['category'], string> = {
  restaurant: '🍽️ 飲食店',
  spot:       '📍 スポット',
  shop:       '🛍️ ショップ',
  activity:   '🎯 アクティビティ',
};

const PRIORITY_STYLES: Record<WishlistItem['priority'], string> = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-600',
  low:    'bg-gray-100 text-gray-500',
};

const PRIORITY_LABELS: Record<WishlistItem['priority'], string> = {
  high: '高', medium: '中', low: '低',
};

interface Props {
  shareToken: string;
}

export default function SharedTripPage({ shareToken }: Props) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'schedule' | 'flights' | 'accommodations' | 'wishlist'>('schedule');

  useEffect(() => {
    loadSharedTrip(shareToken)
      .then(setTrip)
      .catch(() => setError('このプランは非公開か、URLが正しくありません。'))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">プランが見つかりません</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const dates = getTripDates(trip);
  const selectedDate = dates[selectedDateIndex];
  const dayItems = trip.scheduleItems
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nights = Math.round(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{trip.coverEmoji}</span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{trip.name}</h1>
              <p className="text-indigo-100 text-lg">{trip.destination}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-indigo-100">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' 〜 '}
                  {new Date(trip.endDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                </span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-white font-medium text-xs">
                  {nights}泊{nights + 1}日
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-8">
            {[
              { emoji: '✈️', count: trip.flights.length, label: 'フライト' },
              { emoji: '🏨', count: trip.accommodations.length, label: '宿泊先' },
              { emoji: '📅', count: trip.scheduleItems.length, label: '予定' },
              { emoji: '⭐', count: trip.wishlist.length, label: '行きたい' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <div className="text-xl mb-0.5">{s.emoji}</div>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-xs text-indigo-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {([ ['schedule', '📅 スケジュール'], ['flights', '✈️ フライト'], ['accommodations', '🏨 宿泊'], ['wishlist', '⭐ 行きたい'] ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            {/* Day selector */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setSelectedDateIndex(Math.max(0, selectedDateIndex - 1))}
                disabled={selectedDateIndex === 0}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-thin">
                {dates.map((date, i) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDateIndex(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      i === selectedDateIndex ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Day {i + 1} <span className="opacity-75 ml-1">{formatDateShort(date)}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedDateIndex(Math.min(dates.length - 1, selectedDateIndex + 1))}
                disabled={selectedDateIndex === dates.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h2 className="font-bold text-gray-800">{formatDate(selectedDate)}</h2>
            </div>

            {dayItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>この日の予定はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayItems.map((item) => {
                  const style = CATEGORY_STYLES[item.category];
                  return (
                    <div key={item.id} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{style.emoji}</span>
                        <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                        {item.status === 'booked' && (
                          <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">予約済</span>
                        )}
                        {item.status === 'tentative' && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">仮</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />{item.startTime} 〜 {item.endTime}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />{item.location}
                          </span>
                        )}
                        {item.price && (
                          <span className="text-xs text-gray-500">¥{Number(item.price).toLocaleString()}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Flights Tab */}
        {activeTab === 'flights' && (
          <div className="space-y-3">
            {trip.flights.length === 0 ? (
              <div className="text-center py-12 text-gray-400">フライト情報はありません</div>
            ) : trip.flights.map((f) => (
              <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-indigo-600">
                    {f.direction === 'outbound' ? '往路' : '復路'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{f.departureTime}</p>
                    <p className="text-xs text-gray-500">{f.departureAirport}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-300" />
                    <div className="text-xs text-gray-400 whitespace-nowrap">{f.airline} {f.flightNo}</div>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{f.arrivalTime}</p>
                    <p className="text-xs text-gray-500">{f.arrivalAirport}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {new Date(f.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Accommodations Tab */}
        {activeTab === 'accommodations' && (
          <div className="space-y-3">
            {trip.accommodations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">宿泊情報はありません</div>
            ) : trip.accommodations.map((a) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Hotel className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-bold text-purple-600">宿泊先</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{a.name}</h3>
                {a.address && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{a.address}
                  </p>
                )}
                <p className="text-sm text-purple-600 font-medium mt-2">
                  チェックイン：{new Date(a.checkIn).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                  {' 〜 '}
                  チェックアウト：{new Date(a.checkOut).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                </p>
                {a.notes && <p className="text-xs text-gray-500 mt-2">{a.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-gray-800">行きたいリスト</h2>
            </div>
            {trip.wishlist.length === 0 ? (
              <div className="text-center py-12 text-gray-400">リストはありません</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {trip.wishlist
                  .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
                  .map((item) => (
                    <div key={item.id} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs text-amber-600 mb-1">{WISHLIST_LABELS[item.category]}</p>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[item.priority]}`}>
                        優先度：{PRIORITY_LABELS[item.priority]}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-gray-400">
        <p>✈️ 旅行プランナーで作成されたプランです</p>
        <AlertCircle className="w-3 h-3 inline mr-1 mt-3" />
        <span>このページは閲覧専用です</span>
      </div>
    </div>
  );
}
