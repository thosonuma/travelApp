import { useState } from 'react';
import { Trip, ScheduleItem, WishlistItem, Flight, Accommodation, PackingItem, TransportType } from '../types';
import {
  ArrowLeft, Plane, Hotel, Calendar, Star, Plus, Trash2,
  Clock, MapPin, ChevronLeft, ChevronRight, Edit2, Eye,
  Share2, Link, Check, X, ToggleLeft, ToggleRight, ShoppingBag, FlaskConical
} from 'lucide-react';
import { getTripDates, formatDate, formatDateShort } from '../store';
import * as db from '../db';
import FlightModal from '../components/FlightModal';
import AccommodationModal from '../components/AccommodationModal';
import ScheduleModal from '../components/ScheduleModal';
import WishlistModal from '../components/WishlistModal';
import PackingModal from '../components/PackingModal';

const TRANSPORT_EMOJI: Record<TransportType, string> = {
  flight: '✈️', shinkansen: '🚅', train: '🚃', bus: '🚌', ferry: '⛴️', rental_car: '🚗',
};
const TRANSPORT_LABEL: Record<TransportType, string> = {
  flight: '飛行機', shinkansen: '新幹線', train: '在来線', bus: 'バス', ferry: 'フェリー', rental_car: 'レンタカー',
};

const CATEGORY_STYLES: Record<ScheduleItem['category'], { bg: string; text: string; border: string; label: string; emoji: string }> = {
  tour:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'ツアー/体験', emoji: '🤿' },
  food:      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-300',  label: '食事',       emoji: '🍽️' },
  transport: { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-300',     label: '移動',       emoji: '🚌' },
  free:      { bg: 'bg-cyan-50',  text: 'text-violet-600',  border: 'border-violet-300',  label: '自由時間',   emoji: '🌴' },
};

const PACKING_CATEGORY_LABELS: Record<PackingItem['category'], { label: string; emoji: string }> = {
  clothing:    { label: '衣類',     emoji: '👕' },
  toiletry:    { label: '洗面用具', emoji: '🪥' },
  document:    { label: '書類',     emoji: '📄' },
  electronics: { label: '電子機器', emoji: '🔌' },
  medicine:    { label: '薬・衛生', emoji: '💊' },
  other:       { label: 'その他',   emoji: '🎒' },
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
  editToken?: string;
  isDemoMode?: boolean;
}

type SidebarTab = 'flights' | 'accommodations' | 'packing';
type Modal =
  | { type: 'flight'; item?: Flight }
  | { type: 'accommodation'; item?: Accommodation }
  | { type: 'schedule'; item?: ScheduleItem; date?: string }
  | { type: 'wishlist'; item?: WishlistItem }
  | { type: 'packing'; item?: PackingItem }
  | null;

export default function TripDetailPage({ trip, onTripUpdated, onDelete, onBack, editToken, isDemoMode }: Props) {
  const isEditMode = !!editToken; // 編集リンク経由かどうか
  const dates = getTripDates(trip);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('flights');
  const [modal, setModal] = useState<Modal>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingToggling, setSharingToggling] = useState(false);
  const [editToggling, setEditToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [mobilePanelTab, setMobilePanelTab] = useState<'schedule' | 'flights' | 'accommodations' | 'packing' | 'wishlist'>('schedule');

  function handleMobileTab(tab: 'schedule' | 'flights' | 'accommodations' | 'packing' | 'wishlist') {
    setMobilePanelTab(tab);
    if (tab === 'flights' || tab === 'accommodations' || tab === 'packing') {
      setSidebarTab(tab as SidebarTab);
    }
  }

  const shareUrl    = `${window.location.origin}/share/${trip.shareToken}`;
  // 編集URLは閲覧URLに ?e=:editToken を付けた形式（閲覧↔編集をシームレスに切り替え可能）
  const editUrl     = `${window.location.origin}/share/${trip.shareToken}?e=${trip.editToken}`;
  const viewFromEditUrl = `${window.location.origin}/share/${trip.shareToken}?e=${editToken ?? trip.editToken}`;

  async function handleToggleShare() {
    setSharingToggling(true);
    try {
      await db.setTripShared(trip.id, !trip.isShared);
      onTripUpdated({ ...trip, isShared: !trip.isShared });
    } finally {
      setSharingToggling(false);
    }
  }

  async function handleToggleEdit() {
    setEditToggling(true);
    try {
      await db.setTripEditEnabled(trip.id, !trip.isEditEnabled);
      onTripUpdated({ ...trip, isEditEnabled: !trip.isEditEnabled });
    } finally {
      setEditToggling(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyEditLink() {
    await navigator.clipboard.writeText(editUrl);
    setCopiedEdit(true);
    setTimeout(() => setCopiedEdit(false), 2000);
  }

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

  // --- Packing handlers ---
  async function handleSavePacking(data: Omit<PackingItem, 'id'>, existing?: PackingItem) {
    if (existing) {
      await db.updatePackingItem({ ...data, id: existing.id });
      onTripUpdated({
        ...trip,
        packingItems: trip.packingItems.map((p) => (p.id === existing.id ? { ...data, id: existing.id } : p)),
      });
    } else {
      const newItem = await db.addPackingItem(trip.id, data);
      onTripUpdated({ ...trip, packingItems: [...trip.packingItems, newItem] });
    }
    setModal(null);
  }

  async function handleTogglePackingCheck(item: PackingItem) {
    const updated = { ...item, isChecked: !item.isChecked };
    await db.updatePackingItem(updated);
    onTripUpdated({
      ...trip,
      packingItems: trip.packingItems.map((p) => (p.id === item.id ? updated : p)),
    });
  }

  async function handleDeletePacking(id: string) {
    await db.deletePackingItem(id);
    onTripUpdated({ ...trip, packingItems: trip.packingItems.filter((p) => p.id !== id) });
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
            <p className="text-sm text-gray-500 hidden sm:block">
              {new Date(trip.startDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              {' 〜 '}
              {new Date(trip.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              {' · '}{trip.destination}
            </p>
          </div>
          {isEditMode ? (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-100 text-sky-700">
                <Edit2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">編集モード</span>
              </span>
              <a
                href={viewFromEditUrl}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">閲覧で見る</span>
              </a>
            </div>
          ) : (
            <button
              onClick={() => setShowShareModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                trip.isShared
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Share2 className="w-4 h-4" /><span className="hidden sm:inline">{trip.isShared ? '共有中' : '共有'}</span>
            </button>
          )}
          {!isEditMode && (
            <button
              onClick={() => { if (confirm('この旅行を削除しますか？')) onDelete(); }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">テストモード</span> — 変更はブラウザを閉じるとリセットされます
          </p>
        </div>
      )}

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: isDemoMode ? 'calc(100vh - 97px)' : 'calc(100vh - 65px)' }}>

        {/* LEFT: Flights, Accommodations & Packing */}
        <aside className={`w-full lg:w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 ${['flights','accommodations','packing'].includes(mobilePanelTab) ? 'flex' : 'hidden'} lg:flex`}>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('flights')}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                sidebarTab === 'flights' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />交通
            </button>
            <button
              onClick={() => setSidebarTab('accommodations')}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                sidebarTab === 'accommodations' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />宿
            </button>
            <button
              onClick={() => setSidebarTab('packing')}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                sidebarTab === 'packing' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />持ち物
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 pb-20 lg:pb-3">
            {sidebarTab === 'flights' && (
              <>
                {trip.flights.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">交通手段を追加しましょう</p>
                )}
                {trip.flights.map((f) => {
                  const tType = f.transportType ?? 'flight';
                  const emoji = TRANSPORT_EMOJI[tType];
                  const label = TRANSPORT_LABEL[tType];
                  return (
                    <div key={f.id} className="bg-sky-50 border border-sky-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-sky-500">
                          {emoji} {label}・{f.direction === 'outbound' ? '往路' : '復路'}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => setModal({ type: 'flight', item: f })} className="p-1 hover:bg-sky-100 rounded text-sky-400">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteFlight(f.id)} className="p-1 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {(f.airline || f.flightNo) && (
                        <p className="text-xs font-bold text-gray-800">{f.airline} {f.flightNo}</p>
                      )}
                      {(f.departureAirport || f.arrivalAirport) && (
                        <p className="text-xs text-gray-500 mt-0.5">{f.departureAirport} → {f.arrivalAirport}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {new Date(f.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        {f.departureTime && ` ${f.departureTime}`}{f.arrivalTime && ` → ${f.arrivalTime}`}
                      </p>
                      {f.seatNo && <p className="text-xs text-gray-400 mt-0.5">🪑 {f.seatNo}</p>}
                      {f.bookingRef && <p className="text-xs text-gray-400 mt-0.5">予約番号: {f.bookingRef}</p>}
                    </div>
                  );
                })}
                <button
                  onClick={() => setModal({ type: 'flight' })}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-sky-200 rounded-xl text-xs text-sky-400 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />交通手段を追加
                </button>
              </>
            )}

            {sidebarTab === 'accommodations' && (
              <>
                {trip.accommodations.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">宿泊先を追加しましょう</p>
                )}
                {trip.accommodations.map((a) => (
                  <div key={a.id} className="bg-cyan-50 border border-cyan-100 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-bold text-gray-800 flex-1 pr-1">{a.name}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setModal({ type: 'accommodation', item: a })} className="p-1 hover:bg-cyan-100 rounded text-cyan-400">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteAccommodation(a.id)} className="p-1 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {a.address && <p className="text-xs text-gray-500">{a.address}</p>}
                    <p className="text-xs text-cyan-600 font-medium mt-1">
                      {new Date(a.checkIn).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      {' 〜 '}
                      {new Date(a.checkOut).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </p>
                    {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                  </div>
                ))}
                <button
                  onClick={() => setModal({ type: 'accommodation' })}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-cyan-200 rounded-xl text-xs text-cyan-400 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />宿泊先を追加
                </button>
              </>
            )}

            {sidebarTab === 'packing' && (
              <>
                <div className="flex items-center justify-between mb-1 px-0.5">
                  <span className="text-xs text-gray-400">
                    {trip.packingItems.filter((p) => p.isChecked).length}/{trip.packingItems.length} 準備済み
                  </span>
                </div>
                {trip.packingItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">持ち物を追加しましょう</p>
                )}
                {trip.packingItems.map((item) => {
                  const catInfo = PACKING_CATEGORY_LABELS[item.category];
                  return (
                    <div key={item.id} className={`bg-teal-50 border border-teal-100 rounded-xl p-3 group ${item.isChecked ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{catInfo.emoji}</span>
                          <span className="text-xs text-teal-600">{catInfo.label}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal({ type: 'packing', item })} className="p-0.5 hover:bg-teal-100 rounded text-teal-400">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeletePacking(item.id)} className="p-0.5 hover:bg-red-100 rounded text-gray-300 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePackingCheck(item)}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            item.isChecked ? 'bg-teal-500 border-teal-500' : 'border-gray-400 hover:border-teal-400'
                          }`}
                        >
                          {item.isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        <p className={`text-xs font-bold flex-1 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
                      </div>
                      {item.notes && <p className="text-xs text-gray-400 mt-1 ml-6">{item.notes}</p>}
                    </div>
                  );
                })}
                <button
                  onClick={() => setModal({ type: 'packing' })}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-teal-200 rounded-xl text-xs text-teal-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />持ち物を追加
                </button>
              </>
            )}
          </div>
        </aside>

        {/* CENTER: Day Timeline */}
        <main className={`flex-1 flex-col overflow-hidden ${mobilePanelTab === 'schedule' ? 'flex' : 'hidden'} lg:flex`}>
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
                    i === selectedDateIndex ? 'bg-sky-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 pb-20 lg:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <h2 className="font-bold text-gray-800">{formatDate(selectedDate)}</h2>
              </div>
              <button
                onClick={() => setModal({ type: 'schedule', date: selectedDate })}
                className="flex items-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />予定を追加
              </button>
            </div>

            {dayItems.length === 0 ? (
              <div
                onClick={() => setModal({ type: 'schedule', date: selectedDate })}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-sky-300 hover:bg-sky-50 transition-all"
              >
                <p className="text-gray-400 text-sm">この日の予定はまだありません</p>
                <p className="text-sky-400 text-xs mt-1">クリックして追加</p>
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
        <aside className={`w-full lg:w-60 bg-white border-l border-gray-200 flex-col flex-shrink-0 ${mobilePanelTab === 'wishlist' ? 'flex' : 'hidden'} lg:flex`}>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">行きたいリスト</h2>
            </div>
            <button onClick={() => setModal({ type: 'wishlist' })} className="p-1 hover:bg-amber-50 rounded-lg text-amber-500 hover:text-amber-600">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 pb-20 lg:pb-3">
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-10">
        <div className="flex">
          {([
            { tab: 'schedule'       as const, icon: Calendar,    label: '予定'    },
            { tab: 'flights'        as const, icon: Plane,        label: '交通'    },
            { tab: 'accommodations' as const, icon: Hotel,        label: '宿泊'    },
            { tab: 'packing'        as const, icon: ShoppingBag,  label: '持ち物'  },
            { tab: 'wishlist'       as const, icon: Star,         label: '行きたい' },
          ]).map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => handleMobileTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                mobilePanelTab === tab ? 'text-sky-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

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
      {modal?.type === 'packing' && (
        <PackingModal
          initial={modal.item}
          onSave={(data) => handleSavePacking(data, modal.item)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-sky-500" />
                  <h2 className="text-lg font-bold text-gray-900">プランを共有</h2>
                </div>
                <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">共有リンクを公開</p>
                  <p className="text-xs text-gray-500 mt-0.5">ONにするとリンクを知る全員が閲覧できます</p>
                </div>
                <button
                  onClick={handleToggleShare}
                  disabled={sharingToggling}
                  className="flex-shrink-0 ml-3"
                >
                  {trip.isShared
                    ? <ToggleRight className="w-10 h-10 text-green-500" />
                    : <ToggleLeft className="w-10 h-10 text-gray-300" />
                  }
                </button>
              </div>

              {/* 閲覧リンク */}
              {trip.isShared ? (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">閲覧URL（読み取り専用）</p>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                    <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 flex-1 truncate">{shareUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-sky-500 text-white hover:bg-sky-600'
                      }`}
                    >
                      {copied ? <><Check className="w-3 h-3" /> コピー済</> : 'コピー'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center pb-3">
                  閲覧共有をONにするとリンクが発行されます
                </p>
              )}

              {/* 編集共有セクション */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between bg-sky-50 rounded-xl p-4 mb-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">編集リンクを発行</p>
                    <p className="text-xs text-gray-500 mt-0.5">ONにするとリンクを知る人が編集できます</p>
                  </div>
                  <button
                    onClick={handleToggleEdit}
                    disabled={editToggling}
                    className="flex-shrink-0 ml-3"
                  >
                    {trip.isEditEnabled
                      ? <ToggleRight className="w-10 h-10 text-sky-500" />
                      : <ToggleLeft className="w-10 h-10 text-gray-300" />
                    }
                  </button>
                </div>
                {trip.isEditEnabled ? (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">編集URL</p>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                      <Edit2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{editUrl}</span>
                      <button
                        onClick={handleCopyEditLink}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          copiedEdit ? 'bg-green-100 text-green-700' : 'bg-sky-500 text-white hover:bg-sky-600'
                        }`}
                      >
                        {copiedEdit ? <><Check className="w-3 h-3" /> コピー済</> : 'コピー'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      ※ このリンクを知る人は誰でも編集できます。
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-1">
                    編集共有をONにすると編集URLが発行されます
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
