import { Trip, Flight, Accommodation, ScheduleItem, WishlistItem } from './types';

const STORAGE_KEY = 'travel-planner-trips';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- Sample data ---
const sampleTrip: Trip = {
  id: 'sample-ishigaki',
  name: '石垣島旅行',
  destination: '沖縄県 石垣島',
  startDate: '2026-05-02',
  endDate: '2026-05-05',
  coverEmoji: '🏝️',
  isShared: false,
  shareToken: generateId(),
  flights: [
    {
      id: generateId(),
      direction: 'outbound',
      airline: 'ANA',
      flightNo: 'NH987',
      departureAirport: '羽田空港 (HND)',
      arrivalAirport: '石垣空港 (ISG)',
      date: '2026-05-02',
      departureTime: '09:00',
      arrivalTime: '12:10',
      bookingRef: '',
      notes: '',
    },
    {
      id: generateId(),
      direction: 'return',
      airline: 'ANA',
      flightNo: 'NH988',
      departureAirport: '石垣空港 (ISG)',
      arrivalAirport: '羽田空港 (HND)',
      date: '2026-05-05',
      departureTime: '13:30',
      arrivalTime: '16:40',
      bookingRef: '',
      notes: '',
    },
  ],
  accommodations: [
    {
      id: generateId(),
      name: 'ANAインターコンチネンタル石垣リゾート',
      address: '沖縄県石垣市真栄里354-1',
      checkIn: '2026-05-02',
      checkOut: '2026-05-05',
      notes: '3泊 / 海側のお部屋をリクエスト済み',
    },
  ],
  scheduleItems: [
    {
      id: generateId(),
      date: '2026-05-02',
      startTime: '13:00',
      endTime: '14:00',
      category: 'food',
      title: 'ランチ @ 石垣島ぱいぬ島',
      location: '石垣市美崎町',
      notes: 'ゴーヤチャンプルーと石垣牛ステーキ',
      status: 'tentative',
      price: '2000',
    },
    {
      id: generateId(),
      date: '2026-05-03',
      startTime: '09:00',
      endTime: '12:00',
      category: 'tour',
      title: 'シュノーケリングツアー（川平湾）',
      location: '川平湾',
      notes: '要予約。水中カメラ持参',
      status: 'tentative',
      price: '5000',
    },
    {
      id: generateId(),
      date: '2026-05-03',
      startTime: '18:00',
      endTime: '20:00',
      category: 'food',
      title: '夕食 @ ひとし石敢當店',
      location: '石垣市石敢當',
      notes: '石垣牛・マグロが有名',
      status: 'tentative',
      price: '5000',
    },
    {
      id: generateId(),
      date: '2026-05-04',
      startTime: '10:00',
      endTime: '15:00',
      category: 'tour',
      title: '西表島＆由布島ツアー',
      location: '西表島',
      notes: 'フェリーで移動。水牛車で由布島へ',
      status: 'tentative',
      price: '8000',
    },
  ],
  wishlist: [
    {
      id: generateId(),
      category: 'spot',
      name: '川平湾',
      notes: '絶景スポット。グラスボートもおすすめ',
      priority: 'high',
    },
    {
      id: generateId(),
      category: 'restaurant',
      name: 'パーラーみんぴか',
      notes: 'マンゴーかき氷が絶品',
      priority: 'high',
    },
    {
      id: generateId(),
      category: 'shop',
      name: 'ユーグレナモール',
      notes: 'お土産の中心地',
      priority: 'medium',
    },
    {
      id: generateId(),
      category: 'activity',
      name: 'SUP体験',
      notes: '朝のSUPが気持ちよさそう',
      priority: 'medium',
    },
    {
      id: generateId(),
      category: 'spot',
      name: '竹富島',
      notes: '白砂の道・水牛車が有名',
      priority: 'low',
    },
  ],
  packingItems: [],
  createdAt: new Date().toISOString(),
};

// --- Storage helpers ---
export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [sampleTrip];
      saveTrips(initial);
      return initial;
    }
    return JSON.parse(raw) as Trip[];
  } catch {
    return [sampleTrip];
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

// --- Trip CRUD ---
export function createTrip(data: Omit<Trip, 'id' | 'flights' | 'accommodations' | 'scheduleItems' | 'wishlist' | 'packingItems' | 'createdAt'>): Trip {
  return {
    ...data,
    id: generateId(),
    flights: [],
    accommodations: [],
    scheduleItems: [],
    wishlist: [],
    packingItems: [],
    createdAt: new Date().toISOString(),
  };
}

export function updateTrip(trips: Trip[], updated: Trip): Trip[] {
  return trips.map((t) => (t.id === updated.id ? updated : t));
}

export function deleteTrip(trips: Trip[], id: string): Trip[] {
  return trips.filter((t) => t.id !== id);
}

// --- Flight CRUD helpers ---
export function addFlight(trip: Trip, data: Omit<Flight, 'id'>): Trip {
  return { ...trip, flights: [...trip.flights, { ...data, id: generateId() }] };
}

export function updateFlight(trip: Trip, updated: Flight): Trip {
  return { ...trip, flights: trip.flights.map((f) => (f.id === updated.id ? updated : f)) };
}

export function deleteFlight(trip: Trip, id: string): Trip {
  return { ...trip, flights: trip.flights.filter((f) => f.id !== id) };
}

// --- Accommodation CRUD helpers ---
export function addAccommodation(trip: Trip, data: Omit<Accommodation, 'id'>): Trip {
  return { ...trip, accommodations: [...trip.accommodations, { ...data, id: generateId() }] };
}

export function updateAccommodation(trip: Trip, updated: Accommodation): Trip {
  return { ...trip, accommodations: trip.accommodations.map((a) => (a.id === updated.id ? updated : a)) };
}

export function deleteAccommodation(trip: Trip, id: string): Trip {
  return { ...trip, accommodations: trip.accommodations.filter((a) => a.id !== id) };
}

// --- Schedule CRUD helpers ---
export function addScheduleItem(trip: Trip, data: Omit<ScheduleItem, 'id'>): Trip {
  return { ...trip, scheduleItems: [...trip.scheduleItems, { ...data, id: generateId() }] };
}

export function updateScheduleItem(trip: Trip, updated: ScheduleItem): Trip {
  return { ...trip, scheduleItems: trip.scheduleItems.map((s) => (s.id === updated.id ? updated : s)) };
}

export function deleteScheduleItem(trip: Trip, id: string): Trip {
  return { ...trip, scheduleItems: trip.scheduleItems.filter((s) => s.id !== id) };
}

// --- Wishlist CRUD helpers ---
export function addWishlistItem(trip: Trip, data: Omit<WishlistItem, 'id'>): Trip {
  return { ...trip, wishlist: [...trip.wishlist, { ...data, id: generateId() }] };
}

export function updateWishlistItem(trip: Trip, updated: WishlistItem): Trip {
  return { ...trip, wishlist: trip.wishlist.map((w) => (w.id === updated.id ? updated : w)) };
}

export function deleteWishlistItem(trip: Trip, id: string): Trip {
  return { ...trip, wishlist: trip.wishlist.filter((w) => w.id !== id) };
}

// --- Date helpers ---
export function getTripDates(trip: Trip): string[] {
  const dates: string[] = [];
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
}
