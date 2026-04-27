import { supabase } from './supabase';
import { Trip, Flight, Accommodation, ScheduleItem, WishlistItem, PackingItem } from './types';

// ============================================================
// Demo mode (in-memory, no Supabase)
// ============================================================

let _isDemoMode = false;
let _demoTrips: Trip[] = [];

function demoId() {
  return 'demo-' + Math.random().toString(36).slice(2, 10);
}

function makeDemoTrips(): Trip[] {
  return [
    {
      id: 'demo-trip-1',
      name: '石垣島旅行',
      destination: '沖縄県 石垣島',
      startDate: '2026-05-02',
      endDate: '2026-05-05',
      coverEmoji: '🏝️',
      isShared: false,
      shareToken: 'demo-share-1',
      isEditEnabled: false,
      editToken: 'demo-edit-1',
      createdAt: '2026-04-01T00:00:00.000Z',
      flights: [
        { id: 'demo-f-1', direction: 'outbound', airline: 'ANA', flightNo: 'NH987', departureAirport: '羽田空港 (HND)', arrivalAirport: '石垣空港 (ISG)', date: '2026-05-02', departureTime: '09:00', arrivalTime: '12:10', bookingRef: 'ABC123', notes: '' },
        { id: 'demo-f-2', direction: 'return', airline: 'ANA', flightNo: 'NH988', departureAirport: '石垣空港 (ISG)', arrivalAirport: '羽田空港 (HND)', date: '2026-05-05', departureTime: '13:30', arrivalTime: '16:40', bookingRef: 'ABC124', notes: '' },
      ],
      accommodations: [
        { id: 'demo-a-1', name: 'ANAインターコンチネンタル石垣リゾート', address: '沖縄県石垣市真栄里354-1', checkIn: '2026-05-02', checkOut: '2026-05-05', notes: '3泊 / 海側のお部屋をリクエスト済み' },
      ],
      scheduleItems: [
        { id: 'demo-s-1', date: '2026-05-02', startTime: '13:00', endTime: '14:30', category: 'food', title: 'ランチ @ 石垣島ぱいぬ島', location: '石垣市美崎町', notes: 'ゴーヤチャンプルーと石垣牛ステーキ', status: 'tentative', price: '2000' },
        { id: 'demo-s-2', date: '2026-05-02', startTime: '16:00', endTime: '18:00', category: 'free', title: 'ホテルにチェックイン・休憩', location: 'ANAインターコンチネンタル石垣リゾート', notes: '', status: 'booked', price: '' },
        { id: 'demo-s-3', date: '2026-05-03', startTime: '09:00', endTime: '12:00', category: 'tour', title: 'シュノーケリングツアー（川平湾）', location: '川平湾', notes: '要予約。水中カメラ持参', status: 'booked', price: '5000' },
        { id: 'demo-s-4', date: '2026-05-03', startTime: '18:00', endTime: '20:00', category: 'food', title: '夕食 @ ひとし石敢當店', location: '石垣市石敢當', notes: '石垣牛・マグロが有名。予約必須', status: 'booked', price: '5000' },
        { id: 'demo-s-5', date: '2026-05-04', startTime: '09:00', endTime: '15:00', category: 'tour', title: '西表島＆由布島ツアー', location: '西表島', notes: 'フェリーで移動。水牛車で由布島へ', status: 'tentative', price: '8000' },
        { id: 'demo-s-6', date: '2026-05-04', startTime: '18:00', endTime: '20:00', category: 'food', title: '夕食 @ 焼肉ひとし 美崎町店', location: '石垣市美崎町', notes: '', status: 'tentative', price: '4000' },
        { id: 'demo-s-7', date: '2026-05-05', startTime: '10:00', endTime: '12:00', category: 'tour', title: '市内お土産散策', location: 'ユーグレナモール', notes: 'フライトまでの時間で', status: 'tentative', price: '3000' },
      ],
      wishlist: [
        { id: 'demo-w-1', category: 'spot', name: '川平湾', notes: '絶景スポット。グラスボートもおすすめ', priority: 'high' },
        { id: 'demo-w-2', category: 'restaurant', name: 'パーラーみんぴか', notes: 'マンゴーかき氷が絶品', priority: 'high' },
        { id: 'demo-w-3', category: 'shop', name: 'ユーグレナモール', notes: 'お土産の中心地', priority: 'medium' },
        { id: 'demo-w-4', category: 'activity', name: 'SUP体験', notes: '朝のSUPが気持ちよさそう', priority: 'medium' },
        { id: 'demo-w-5', category: 'spot', name: '竹富島', notes: '白砂の道・水牛車が有名', priority: 'low' },
      ],
      packingItems: [
        { id: 'demo-p-1', category: 'clothing', name: 'Tシャツ（3枚）', notes: '', isChecked: true },
        { id: 'demo-p-2', category: 'clothing', name: '水着', notes: '', isChecked: false },
        { id: 'demo-p-3', category: 'clothing', name: 'サンダル', notes: '', isChecked: false },
        { id: 'demo-p-4', category: 'toiletry', name: '日焼け止め（SPF50+）', notes: 'マリンアクティビティ用', isChecked: false },
        { id: 'demo-p-5', category: 'toiletry', name: 'シャンプー・リンス', notes: '', isChecked: true },
        { id: 'demo-p-6', category: 'document', name: '航空券（eチケット）', notes: '', isChecked: true },
        { id: 'demo-p-7', category: 'document', name: 'ホテル予約確認書', notes: '', isChecked: false },
        { id: 'demo-p-8', category: 'electronics', name: 'カメラ・充電器', notes: '水中ケース持参', isChecked: false },
        { id: 'demo-p-9', category: 'electronics', name: 'モバイルバッテリー', notes: '', isChecked: false },
        { id: 'demo-p-10', category: 'medicine', name: '酔い止め', notes: 'フェリー用', isChecked: false },
      ],
    },
    {
      id: 'demo-trip-2',
      name: '京都・奈良の旅',
      destination: '京都・奈良',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      coverEmoji: '🌸',
      isShared: false,
      shareToken: 'demo-share-2',
      isEditEnabled: false,
      editToken: 'demo-edit-2',
      createdAt: '2026-03-01T00:00:00.000Z',
      flights: [
        { id: 'demo-f-3', direction: 'outbound', airline: 'ANA', flightNo: 'NH23', departureAirport: '羽田空港 (HND)', arrivalAirport: '伊丹空港 (ITM)', date: '2026-04-01', departureTime: '08:00', arrivalTime: '09:05', bookingRef: 'XYZ789', notes: '' },
        { id: 'demo-f-4', direction: 'return', airline: 'ANA', flightNo: 'NH32', departureAirport: '伊丹空港 (ITM)', arrivalAirport: '羽田空港 (HND)', date: '2026-04-03', departureTime: '19:00', arrivalTime: '20:05', bookingRef: 'XYZ790', notes: '' },
      ],
      accommodations: [
        { id: 'demo-a-2', name: '京都ホテルオークラ', address: '京都府京都市中京区河原町御池', checkIn: '2026-04-01', checkOut: '2026-04-03', notes: '2泊 / 市内観光に便利な立地' },
      ],
      scheduleItems: [
        { id: 'demo-s-8', date: '2026-04-01', startTime: '11:00', endTime: '13:00', category: 'tour', title: '嵐山・竹林の散策', location: '嵐山', notes: '朝早めがおすすめ', status: 'booked', price: '0' },
        { id: 'demo-s-9', date: '2026-04-01', startTime: '14:00', endTime: '16:00', category: 'tour', title: '金閣寺', location: '京都市北区金閣寺町', notes: '入場料500円', status: 'booked', price: '500' },
        { id: 'demo-s-10', date: '2026-04-02', startTime: '09:00', endTime: '12:00', category: 'tour', title: '奈良・東大寺', location: '奈良市雑司町', notes: '大仏と鹿に会いに', status: 'booked', price: '600' },
        { id: 'demo-s-11', date: '2026-04-02', startTime: '14:00', endTime: '16:00', category: 'tour', title: '伏見稲荷大社', location: '京都市伏見区深草藪之内町', notes: '千本鳥居は圧巻', status: 'booked', price: '0' },
        { id: 'demo-s-12', date: '2026-04-03', startTime: '10:00', endTime: '12:00', category: 'food', title: '錦市場で食べ歩き', location: '京都市中京区錦小路通', notes: '京都のキッチン', status: 'booked', price: '2000' },
      ],
      wishlist: [
        { id: 'demo-w-6', category: 'restaurant', name: '祇園 さゝ木', notes: '予約が取れたら行きたい名店', priority: 'high' },
        { id: 'demo-w-7', category: 'spot', name: '哲学の道', notes: '桜の季節は特に美しい', priority: 'medium' },
        { id: 'demo-w-8', category: 'shop', name: '一澤信三郎帆布', notes: 'オリジナルバッグが欲しい', priority: 'medium' },
      ],
      packingItems: [
        { id: 'demo-p-11', category: 'clothing', name: '春物コート', notes: '朝晩は冷える', isChecked: true },
        { id: 'demo-p-12', category: 'document', name: '交通系ICカード（チャージ済み）', notes: '', isChecked: true },
        { id: 'demo-p-13', category: 'electronics', name: 'カメラ', notes: '', isChecked: true },
      ],
    },
  ];
}

export function setDemoMode(enabled: boolean) {
  _isDemoMode = enabled;
  _demoTrips = enabled ? makeDemoTrips() : [];
}

export function getDemoMode() {
  return _isDemoMode;
}

// ============================================================
// 型マッピング (DB snake_case ↔ TS camelCase)
// ============================================================

type DbTrip = {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_emoji: string;
  created_at: string;
  is_shared: boolean;
  share_token: string;
  is_edit_enabled: boolean;
  edit_token: string;
};

type DbFlight = {
  id: string;
  trip_id: string;
  direction: string;
  airline: string;
  flight_no: string;
  departure_airport: string;
  arrival_airport: string;
  date: string;
  departure_time: string;
  arrival_time: string;
  booking_ref: string;
  notes: string;
};

type DbAccommodation = {
  id: string;
  trip_id: string;
  name: string;
  address: string;
  check_in: string;
  check_out: string;
  notes: string;
};

type DbScheduleItem = {
  id: string;
  trip_id: string;
  date: string;
  start_time: string;
  end_time: string;
  category: string;
  title: string;
  location: string;
  notes: string;
  status: string;
  price: string;
};

type DbWishlistItem = {
  id: string;
  trip_id: string;
  category: string;
  name: string;
  notes: string;
  priority: string;
};

type DbPackingItem = {
  id: string;
  trip_id: string;
  category: string;
  name: string;
  notes: string;
  is_checked: boolean;
};

function toFlight(r: DbFlight): Flight {
  return {
    id: r.id,
    direction: r.direction as Flight['direction'],
    airline: r.airline,
    flightNo: r.flight_no,
    departureAirport: r.departure_airport,
    arrivalAirport: r.arrival_airport,
    date: r.date,
    departureTime: r.departure_time,
    arrivalTime: r.arrival_time,
    bookingRef: r.booking_ref,
    notes: r.notes,
  };
}

function toAccommodation(r: DbAccommodation): Accommodation {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    checkIn: r.check_in,
    checkOut: r.check_out,
    notes: r.notes,
  };
}

function toScheduleItem(r: DbScheduleItem): ScheduleItem {
  return {
    id: r.id,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    category: r.category as ScheduleItem['category'],
    title: r.title,
    location: r.location,
    notes: r.notes,
    status: r.status as ScheduleItem['status'],
    price: r.price,
  };
}

function toWishlistItem(r: DbWishlistItem): WishlistItem {
  return {
    id: r.id,
    category: r.category as WishlistItem['category'],
    name: r.name,
    notes: r.notes,
    priority: r.priority as WishlistItem['priority'],
  };
}

function toPackingItem(r: DbPackingItem): PackingItem {
  return {
    id: r.id,
    category: r.category as PackingItem['category'],
    name: r.name,
    notes: r.notes,
    isChecked: r.is_checked,
  };
}

// ============================================================
// Trip CRUD
// ============================================================

export async function loadTrips(): Promise<Trip[]> {
  if (_isDemoMode) {
    return _demoTrips.map(({ flights: _f, accommodations: _a, scheduleItems: _s, wishlist: _w, packingItems: _p, ...t }) => ({
      ...t, flights: [], accommodations: [], scheduleItems: [], wishlist: [], packingItems: [],
    }));
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as DbTrip[]).map((r) => ({
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    coverEmoji: r.cover_emoji,
    createdAt: r.created_at,
    isShared: r.is_shared ?? false,
    isEditEnabled: r.is_edit_enabled ?? false,
    editToken: r.edit_token ?? '',
    shareToken: r.share_token ?? '',
    flights: [],
    accommodations: [],
    scheduleItems: [],
    wishlist: [],
    packingItems: [],
  }));
}

export async function loadTripDetails(tripId: string): Promise<Trip> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    return { ...trip, flights: [...trip.flights], accommodations: [...trip.accommodations], scheduleItems: [...trip.scheduleItems], wishlist: [...trip.wishlist], packingItems: [...trip.packingItems] };
  }

  const [tripRes, flightsRes, accsRes, schedRes, wishRes, packRes] = await Promise.all([
    supabase.from('trips').select('*').eq('id', tripId).single(),
    supabase.from('flights').select('*').eq('trip_id', tripId),
    supabase.from('accommodations').select('*').eq('trip_id', tripId),
    supabase.from('schedule_items').select('*').eq('trip_id', tripId),
    supabase.from('wishlist_items').select('*').eq('trip_id', tripId),
    supabase.from('packing_items').select('*').eq('trip_id', tripId),
  ]);

  if (tripRes.error) throw tripRes.error;

  const r = tripRes.data as DbTrip;
  return {
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    coverEmoji: r.cover_emoji,
    createdAt: r.created_at,
    isShared: r.is_shared ?? false,
    isEditEnabled: r.is_edit_enabled ?? false,
    editToken: r.edit_token ?? '',
    shareToken: r.share_token ?? '',
    flights: ((flightsRes.data ?? []) as DbFlight[]).map(toFlight),
    accommodations: ((accsRes.data ?? []) as DbAccommodation[]).map(toAccommodation),
    scheduleItems: ((schedRes.data ?? []) as DbScheduleItem[]).map(toScheduleItem),
    wishlist: ((wishRes.data ?? []) as DbWishlistItem[]).map(toWishlistItem),
    packingItems: ((packRes.data ?? []) as DbPackingItem[]).map(toPackingItem),
  };
}

export async function createTrip(
  data: Omit<Trip, 'id' | 'flights' | 'accommodations' | 'scheduleItems' | 'wishlist' | 'packingItems' | 'createdAt'>
): Promise<Trip> {
  if (_isDemoMode) {
    const newTrip: Trip = { ...data, id: demoId(), flights: [], accommodations: [], scheduleItems: [], wishlist: [], packingItems: [], createdAt: new Date().toISOString() };
    _demoTrips.unshift(newTrip);
    return newTrip;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('ログインが必要です');

  const { data: row, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      name: data.name,
      destination: data.destination,
      start_date: data.startDate,
      end_date: data.endDate,
      cover_emoji: data.coverEmoji,
    })
    .select()
    .single();

  if (error) throw error;

  const r = row as DbTrip;
  return {
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    coverEmoji: r.cover_emoji,
    createdAt: r.created_at,
    isShared: r.is_shared ?? false,
    isEditEnabled: r.is_edit_enabled ?? false,
    editToken: r.edit_token ?? '',
    shareToken: r.share_token ?? '',
    flights: [],
    accommodations: [],
    scheduleItems: [],
    wishlist: [],
    packingItems: [],
  };
}

export async function updateTripInfo(
  id: string,
  data: Partial<Pick<Trip, 'name' | 'destination' | 'startDate' | 'endDate' | 'coverEmoji'>>
): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.id === id);
    if (trip) Object.assign(trip, data.name !== undefined ? { name: data.name } : {}, data.destination !== undefined ? { destination: data.destination } : {}, data.startDate !== undefined ? { startDate: data.startDate } : {}, data.endDate !== undefined ? { endDate: data.endDate } : {}, data.coverEmoji !== undefined ? { coverEmoji: data.coverEmoji } : {});
    return;
  }

  const patch: Record<string, string> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.destination !== undefined) patch.destination = data.destination;
  if (data.startDate !== undefined) patch.start_date = data.startDate;
  if (data.endDate !== undefined) patch.end_date = data.endDate;
  if (data.coverEmoji !== undefined) patch.cover_emoji = data.coverEmoji;

  const { error } = await supabase.from('trips').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTrip(id: string): Promise<void> {
  if (_isDemoMode) {
    _demoTrips = _demoTrips.filter((t) => t.id !== id);
    return;
  }
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Flight CRUD
// ============================================================

export async function addFlight(tripId: string, data: Omit<Flight, 'id'>): Promise<Flight> {
  if (_isDemoMode) {
    const flight = { ...data, id: demoId() };
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.flights.push(flight);
    return flight;
  }
  const { data: row, error } = await supabase
    .from('flights')
    .insert({
      trip_id: tripId,
      direction: data.direction,
      airline: data.airline,
      flight_no: data.flightNo,
      departure_airport: data.departureAirport,
      arrival_airport: data.arrivalAirport,
      date: data.date,
      departure_time: data.departureTime,
      arrival_time: data.arrivalTime,
      booking_ref: data.bookingRef,
      notes: data.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toFlight(row as DbFlight);
}

export async function updateFlight(flight: Flight): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.flights.some((f) => f.id === flight.id));
    if (trip) trip.flights = trip.flights.map((f) => (f.id === flight.id ? flight : f));
    return;
  }
  const { error } = await supabase
    .from('flights')
    .update({
      direction: flight.direction,
      airline: flight.airline,
      flight_no: flight.flightNo,
      departure_airport: flight.departureAirport,
      arrival_airport: flight.arrivalAirport,
      date: flight.date,
      departure_time: flight.departureTime,
      arrival_time: flight.arrivalTime,
      booking_ref: flight.bookingRef,
      notes: flight.notes,
    })
    .eq('id', flight.id);
  if (error) throw error;
}

export async function deleteFlight(id: string): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.flights.some((f) => f.id === id));
    if (trip) trip.flights = trip.flights.filter((f) => f.id !== id);
    return;
  }
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Accommodation CRUD
// ============================================================

export async function addAccommodation(tripId: string, data: Omit<Accommodation, 'id'>): Promise<Accommodation> {
  if (_isDemoMode) {
    const acc = { ...data, id: demoId() };
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.accommodations.push(acc);
    return acc;
  }
  const { data: row, error } = await supabase
    .from('accommodations')
    .insert({
      trip_id: tripId,
      name: data.name,
      address: data.address,
      check_in: data.checkIn,
      check_out: data.checkOut,
      notes: data.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toAccommodation(row as DbAccommodation);
}

export async function updateAccommodation(acc: Accommodation): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.accommodations.some((a) => a.id === acc.id));
    if (trip) trip.accommodations = trip.accommodations.map((a) => (a.id === acc.id ? acc : a));
    return;
  }
  const { error } = await supabase
    .from('accommodations')
    .update({
      name: acc.name,
      address: acc.address,
      check_in: acc.checkIn,
      check_out: acc.checkOut,
      notes: acc.notes,
    })
    .eq('id', acc.id);
  if (error) throw error;
}

export async function deleteAccommodation(id: string): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.accommodations.some((a) => a.id === id));
    if (trip) trip.accommodations = trip.accommodations.filter((a) => a.id !== id);
    return;
  }
  const { error } = await supabase.from('accommodations').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Schedule Item CRUD
// ============================================================

export async function addScheduleItem(tripId: string, data: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
  if (_isDemoMode) {
    const item = { ...data, id: demoId() };
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.scheduleItems.push(item);
    return item;
  }
  const { data: row, error } = await supabase
    .from('schedule_items')
    .insert({
      trip_id: tripId,
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      category: data.category,
      title: data.title,
      location: data.location,
      notes: data.notes,
      status: data.status,
      price: data.price,
    })
    .select()
    .single();
  if (error) throw error;
  return toScheduleItem(row as DbScheduleItem);
}

export async function updateScheduleItem(item: ScheduleItem): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.scheduleItems.some((s) => s.id === item.id));
    if (trip) trip.scheduleItems = trip.scheduleItems.map((s) => (s.id === item.id ? item : s));
    return;
  }
  const { error } = await supabase
    .from('schedule_items')
    .update({
      date: item.date,
      start_time: item.startTime,
      end_time: item.endTime,
      category: item.category,
      title: item.title,
      location: item.location,
      notes: item.notes,
      status: item.status,
      price: item.price,
    })
    .eq('id', item.id);
  if (error) throw error;
}

export async function deleteScheduleItem(id: string): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.scheduleItems.some((s) => s.id === id));
    if (trip) trip.scheduleItems = trip.scheduleItems.filter((s) => s.id !== id);
    return;
  }
  const { error } = await supabase.from('schedule_items').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Wishlist Item CRUD
// ============================================================

export async function addWishlistItem(tripId: string, data: Omit<WishlistItem, 'id'>): Promise<WishlistItem> {
  if (_isDemoMode) {
    const item = { ...data, id: demoId() };
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.wishlist.push(item);
    return item;
  }
  const { data: row, error } = await supabase
    .from('wishlist_items')
    .insert({
      trip_id: tripId,
      category: data.category,
      name: data.name,
      notes: data.notes,
      priority: data.priority,
    })
    .select()
    .single();
  if (error) throw error;
  return toWishlistItem(row as DbWishlistItem);
}

export async function updateWishlistItem(item: WishlistItem): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.wishlist.some((w) => w.id === item.id));
    if (trip) trip.wishlist = trip.wishlist.map((w) => (w.id === item.id ? item : w));
    return;
  }
  const { error } = await supabase
    .from('wishlist_items')
    .update({
      category: item.category,
      name: item.name,
      notes: item.notes,
      priority: item.priority,
    })
    .eq('id', item.id);
  if (error) throw error;
}

export async function deleteWishlistItem(id: string): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.wishlist.some((w) => w.id === id));
    if (trip) trip.wishlist = trip.wishlist.filter((w) => w.id !== id);
    return;
  }
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Packing Item CRUD
// ============================================================

export async function addPackingItem(tripId: string, data: Omit<PackingItem, 'id'>): Promise<PackingItem> {
  if (_isDemoMode) {
    const item = { ...data, id: demoId() };
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.packingItems.push(item);
    return item;
  }
  const { data: row, error } = await supabase
    .from('packing_items')
    .insert({
      trip_id: tripId,
      category: data.category,
      name: data.name,
      notes: data.notes,
      is_checked: data.isChecked,
    })
    .select()
    .single();
  if (error) throw error;
  return toPackingItem(row as DbPackingItem);
}

export async function updatePackingItem(item: PackingItem): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.packingItems.some((p) => p.id === item.id));
    if (trip) trip.packingItems = trip.packingItems.map((p) => (p.id === item.id ? item : p));
    return;
  }
  const { error } = await supabase
    .from('packing_items')
    .update({
      category: item.category,
      name: item.name,
      notes: item.notes,
      is_checked: item.isChecked,
    })
    .eq('id', item.id);
  if (error) throw error;
}

export async function deletePackingItem(id: string): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.packingItems.some((p) => p.id === id));
    if (trip) trip.packingItems = trip.packingItems.filter((p) => p.id !== id);
    return;
  }
  const { error } = await supabase.from('packing_items').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// 共有・編集共有機能
// ============================================================

/** 編集共有ON/OFFを切り替える（オーナー用）*/
export async function setTripEditEnabled(tripId: string, isEnabled: boolean): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.isEditEnabled = isEnabled;
    return;
  }
  const { error } = await supabase
    .from('trips')
    .update({ is_edit_enabled: isEnabled })
    .eq('id', tripId);
  if (error) throw error;
}

/** edit_token でトリップを読み込む（未ログインOK） */
export async function loadTripByEditToken(editToken: string): Promise<Trip> {
  const tripRes = await supabase.rpc('load_trip_by_edit_token', { p_edit_token: editToken }).single();
  if (tripRes.error) throw tripRes.error;

  const r = tripRes.data as DbTrip;
  const tripId = r.id;

  const [flightsRes, accsRes, schedRes, wishRes, packRes] = await Promise.all([
    supabase.from('flights').select('*').eq('trip_id', tripId),
    supabase.from('accommodations').select('*').eq('trip_id', tripId),
    supabase.from('schedule_items').select('*').eq('trip_id', tripId),
    supabase.from('wishlist_items').select('*').eq('trip_id', tripId),
    supabase.from('packing_items').select('*').eq('trip_id', tripId),
  ]);

  return {
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    coverEmoji: r.cover_emoji,
    createdAt: r.created_at,
    isShared: r.is_shared ?? false,
    shareToken: r.share_token ?? '',
    isEditEnabled: r.is_edit_enabled ?? false,
    editToken: r.edit_token ?? '',
    flights: ((flightsRes.data ?? []) as DbFlight[]).map(toFlight),
    accommodations: ((accsRes.data ?? []) as DbAccommodation[]).map(toAccommodation),
    scheduleItems: ((schedRes.data ?? []) as DbScheduleItem[]).map(toScheduleItem),
    wishlist: ((wishRes.data ?? []) as DbWishlistItem[]).map(toWishlistItem),
    packingItems: ((packRes.data ?? []) as DbPackingItem[]).map(toPackingItem),
  };
}

/** 共有ON/OFFを切り替える */
export async function setTripShared(tripId: string, isShared: boolean): Promise<void> {
  if (_isDemoMode) {
    const trip = _demoTrips.find((t) => t.id === tripId);
    if (trip) trip.isShared = isShared;
    return;
  }
  const { error } = await supabase
    .from('trips')
    .update({ is_shared: isShared })
    .eq('id', tripId);
  if (error) throw error;
}

/** share_token でトリップを読み込む（未ログインOK） */
export async function loadSharedTrip(shareToken: string): Promise<Trip> {
  const [tripRes, flightsRes, accsRes, schedRes, wishRes, packRes] = await Promise.all([
    supabase.from('trips').select('*').eq('share_token', shareToken).eq('is_shared', true).single(),
    supabase.from('flights').select('*'),
    supabase.from('accommodations').select('*'),
    supabase.from('schedule_items').select('*'),
    supabase.from('wishlist_items').select('*'),
    supabase.from('packing_items').select('*'),
  ]);

  if (tripRes.error) throw tripRes.error;

  const r = tripRes.data as DbTrip;
  const tripId = r.id;

  return {
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    coverEmoji: r.cover_emoji,
    createdAt: r.created_at,
    isShared: r.is_shared ?? false,
    isEditEnabled: r.is_edit_enabled ?? false,
    editToken: r.edit_token ?? '',
    shareToken: r.share_token ?? '',
    flights: ((flightsRes.data ?? []) as DbFlight[]).filter((f) => f.trip_id === tripId).map(toFlight),
    accommodations: ((accsRes.data ?? []) as DbAccommodation[]).filter((a) => a.trip_id === tripId).map(toAccommodation),
    scheduleItems: ((schedRes.data ?? []) as DbScheduleItem[]).filter((s) => s.trip_id === tripId).map(toScheduleItem),
    wishlist: ((wishRes.data ?? []) as DbWishlistItem[]).filter((w) => w.trip_id === tripId).map(toWishlistItem),
    packingItems: ((packRes.data ?? []) as DbPackingItem[]).filter((p) => p.trip_id === tripId).map(toPackingItem),
  };
}
