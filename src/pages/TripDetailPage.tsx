import { useState } from 'react';
import { Trip, ScheduleItem, WishlistItem, Flight, Accommodation } from '../types';
import {
  ArrowLeft, Plane, Hotel, Calendar, Star, Plus, Trash2,
  Clock, MapPin, ChevronLeft, ChevronRight, Edit2
} from 'lucide-react';
import { getTripDates, formatDate, formatDateShort } from '../store';
import * as db from '../db';
import FlightModal from '../components/FlightModal';
import AccommodationModal from '../components/AccommodationModal';
import ScheduleModal from '../components/ScheduleModal';
import WishlistModal from '../components/WishlistModal';

const CATEGORY_STYLES: Record<ScheduleItem['category'], { bg: string; text: string; border: string; label: string; emoji: string }> = {
  tour:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'ツアー/体験', emoji: '🤿' },
  food:      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-300',  label: '食事',       emoji: '🍽️' },
  transport: { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-300',     label: '移動',       emoji: '🚌' },
  free:      { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-300',  label: '自由時間',   emoji: '🌴' },
};

const WISHLIST_CATEGORY_LABELS: Record<WishlistItem['category'], string> = {
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
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
  onDelete: () => void;
  onBack: () => void;
}

type SidebarTab = 'flights' | 'accommodations';
type Modal =
  | { type: 'flight'; item?: Flight }
  | { type: 'accommodation'; item?: Accommodation }
  | { type: 'schedule'; item?: ScheduleItem; date?: string }
  | { type: 'wishlist'; item?: WishlistItem }
  | null;

export default function TripDetailPage({ trip, onTripUpdated, onDelete, onBack }: Props) {
  const dates = getTripDates(trip);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('flights');
  const [modal, setModal] = useState<Modal>(null);

  const selectedDate = dates[selectedDateIndex];
  const dayItems = trip.scheduleItems
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // --- Flight handlers ---
  async function handleSaveFlight(data: Omit<Flight, 'id'>, existing?: Flight) {
    if (existing) {
      await db.updateFlight({ ...data, id: existing.id });
      onTripUpdated({
        ...trip,
        flights: trip.flights.map((f) => (f.id === existing.id ? { ...data, id: existing.id } : f)),
      });
    } else {
      const newFlight = await db.addFlight(trip.id, data);
      onTripUpdated({ ...trip, flights: [...trip.flights, newFlight] });
    }
    setModal(null);
  }

  async function handleDeleteFlight(id: string) {
    await db.deleteFlight(id);
    onTripUpdated({ ...trip, flights: trip.flights.filter((f) => f.id !== id) });
  }

  // --- Accommodation handlers ---
  async function handleSaveAccommodation(data: Omit<Accommodation, 'id'>, existing?: Accommodation) {
    if (existing) {
      await db.updateAccommodation({ ...data, id: existing.id });
      onTripUpdated({
        ...trip,
        accommodations: trip.accommodations.map((a) => (a.id === existing.id ? { ...data, id: existing.id } : a)),
      });
    } else {
      const newAcc = await db.addAccommodation(trip.id, data);
      onTripUpdated({ ...trip, accommodations: [...trip.accommodations, newAcc] });
    }
    setModal(null);
  }

  async function handleDeleteAccommodation(id: string) {
    await db.deleteAccommodation(id);
    onTripUpdated({ ...trip, accommodations: trip.accommodations.filter((a) => a.id !== id) });
  }

  // --- Schedule handlers ---
  async function handleSaveSchedule(data: Omit<ScheduleItem, 'id'>, existing?: ScheduleItem) {
    if (existing) {
      await db.updateScheduleItem({ ...data, id: existing.id });
      onTripUpdated({
        ...trip,
        scheduleItems: trip.scheduleItems.map((s) => (s.id === existing.id ? { ...data, id: existing.id } : s)),
      });
    } else {
      const newItem = await db.addScheduleItem(trip.id, data);
      onTripUpdated({ ...trip, scheduleItems: [...trip.scheduleItems, newItem] });
    }
    setModal(null);
  }

  async function handleDeleteSchedule(id: string) {
    await db.deleteScheduleItem(id);
    onTripUpdated({ ...trip, scheduleItems: trip.scheduleItems.filter((s) => s.id !== id) });
  }

  // --- Wishlist handlers ---
  async function handleSaveWishlist(data: Omit<WishlistItem, 'id'>, existing?: WishlistItem) {
    if (existing) {
      await db.updateWishlistItem({ ...data, id: existing.id });
      onTripUpdated({
        ...trip,
        wishlist: trip.wishlist.map((w) => (w.id === existing.id ? { ...data, id: existing.id } : w)),
      });
    } else {
      const newItem = await db.addWishlistItem(trip.id, data);
      onTripUpdated({ ...trip, wishlist: [...trip.wishlist, newItem] });
    }
    setModal(null);
  }

  async function handleDeleteWishlist(id: string) {
    await db.deleteWishlistItem(id);
    onTripUpdated({ ...trip, wishlist: trip.wishlist.filter((w) => w.id !== id) });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-2xl">{trip.coverEmoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg leading-tight truncate">{trip.name}</h1>
            <p className="text-sm text-gray-500">
              {new Date(trip.startDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              {' 〜 '}
              {new Date(trip.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              {' · '}{trip.destination}
            </p>
          </div>
          <button
            onClick={() => { if (confirm('この旅行を削除しますか？')) onDelete(); }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* LEFT: Flights & Accommodations */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('flights')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                sidebarTab === 'flights' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />フライト
            </button>
            <button
              onClick={() => setSidebarTab('accommodations')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                sidebarTab === 'accommodations' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />宿泊
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {sidebarTab === 'flights' && (
              <>
                {trip.flights.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">フライト情報を追加しましょう</p>
                )}
                {trip.flights.map((f) => (
                  <div key={f.id} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-indigo-600">
                        {f.direction === 'outbound' ? '✈️ 往路' : '🛬 復路'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'flight', item: f })} className="p-1 hover:bg-indigo-100 rounded text-indigo-400">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteFlight(f.id)} className="p-1 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-800">{f.airline} {f.flightNo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.departureAirport} → {f.arrivalAirport}</p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {new Date(f.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      {' '}{f.departureTime} → {f.arrivalTime}
                    </p>
                    {f.bookingRef && <p className="text-xs text-gray-400 mt-0.5">予約番号: {f.bookingRef}</p>}
                  </div>
                ))}
                <button
                  onClick={() => setModal({ type: 'flight' })}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-indigo-200 rounded-xl text-xs text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />フライトを追加
                </button>
              </>
            )}

            {sidebarTab === 'accommodations' && (
              <>
                {trip.accommodations.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">宿泊先を追加しましょう</p>
                )}
                {trip.accommodations.map((a) => (
                  <div key={a.id} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-bold text-gray-800 flex-1 pr-1">{a.name}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setModal({ type: 'accommodation', item: a })} className="p-1 hover:bg-purple-100 rounded text-purple-400">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteAccommodation(a.id)} className="p-1 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {a.address && <p className="text-xs text-gray-500">{a.address}</p>}
                    <p className="text-xs text-purple-600 font-medium mt-1">
                      {new Date(a.checkIn).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      {' 〜 '}
                      {new Date(a.checkOut).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </p>
                    {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                  </div>
                ))}
                <button
                  onClick={() => setModal({ type: 'accommodation' })}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-purple-200 rounded-xl text-xs text-purple-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />宿泊先を追加
                </button>
              </>
            )}
          </div>
        </aside>

        {/* CENTER: Day Timeline */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Day tabs */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => setSelectedDateIndex(Math.max(0, selectedDateIndex - 1))}
              disabled={selectedDateIndex === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-thin">
              {dates.map((date, i) => (
                <button
                  key={date}
                  onClick={() => setSelectedDateIndex(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    i === selectedDateIndex ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Day {i + 1}
                  <span className="ml-1 opacity-70">{formatDateShort(date)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedDateIndex(Math.min(dates.length - 1, selectedDateIndex + 1))}
              disabled={selectedDateIndex === dates.length - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Schedule area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-gray-800">{formatDate(selectedDate)}</h2>
              </div>
              <button
                onClick={() => setModal({ type: 'schedule', date: selectedDate })}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />予定を追加
              </button>
            </div>

            {dayItems.length === 0 ? (
              <div
                onClick={() => setModal({ type: 'schedule', date: selectedDate })}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <p className="text-gray-400 text-sm">この日の予定はまだありません</p>
                <p className="text-indigo-400 text-xs mt-1">クリックして追加</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayItems.map((item) => {
                  const style = CATEGORY_STYLES[item.category];
                  return (
                    <div key={item.id} className={`${style.bg} border ${style.border} rounded-xl p-4 group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{style.emoji}</span>
                            <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                            {item.status === 'tentative' && (
                              <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">仮</span>
                            )}
                            {item.status === 'booked' && (
                              <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">予約済</span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal({ type: 'schedule', item })} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSchedule(item.id)} className="p-1.5 hover:bg-white rounded-lg text-gray-300 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT: Wishlist */}
        <aside className="w-60 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">行きたいリスト</h2>
            </div>
            <button onClick={() => setModal({ type: 'wishlist' })} className="p-1 hover:bg-amber-50 rounded-lg text-amber-500 hover:text-amber-600">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {trip.wishlist.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">行きたい場所を追加しましょう</p>
            )}
            {trip.wishlist
              .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
              .map((item) => (
                <div key={item.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3 group">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-amber-600">{WISHLIST_CATEGORY_LABELS[item.category]}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ type: 'wishlist', item })} className="p-0.5 hover:bg-amber-100 rounded text-amber-400">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteWishlist(item.id)} className="p-0.5 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{item.name}</p>
                  {item.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.notes}</p>}
                  <div className="mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[item.priority]}`}>
                      優先度：{PRIORITY_LABELS[item.priority]}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </aside>
      </div>

      {/* Modals */}
      {modal?.type === 'flight' && (
        <FlightModal
          initial={modal.item}
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
          onSave={(data) => handleSaveFlight(data, modal.item)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'accommodation' && (
        <AccommodationModal
          initial={modal.item}
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
          onSave={(data) => handleSaveAccommodation(data, modal.item)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'schedule' && (
        <ScheduleModal
          initial={modal.item}
          defaultDate={modal.date ?? selectedDate}
          tripDates={dates}
          onSave={(data) => handleSaveSchedule(data, modal.item)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'wishlist' && (
        <WishlistModal
          initial={modal.item}
          onSave={(data) => handleSaveWishlist(data, modal.item)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
