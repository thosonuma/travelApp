import { supabase } from './supabase';
import { Trip, Flight, Accommodation, ScheduleItem, WishlistItem } from './types';

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

// ============================================================
// Trip CRUD
// ============================================================

export async function loadTrips(): Promise<Trip[]> {
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
    flights: [],
    accommodations: [],
    scheduleItems: [],
    wishlist: [],
  }));
}

export async function loadTripDetails(tripId: string): Promise<Trip> {
  const [tripRes, flightsRes, accsRes, schedRes, wishRes] = await Promise.all([
    supabase.from('trips').select('*').eq('id', tripId).single(),
    supabase.from('flights').select('*').eq('trip_id', tripId),
    supabase.from('accommodations').select('*').eq('trip_id', tripId),
    supabase.from('schedule_items').select('*').eq('trip_id', tripId),
    supabase.from('wishlist_items').select('*').eq('trip_id', tripId),
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
    flights: ((flightsRes.data ?? []) as DbFlight[]).map(toFlight),
    accommodations: ((accsRes.data ?? []) as DbAccommodation[]).map(toAccommodation),
    scheduleItems: ((schedRes.data ?? []) as DbScheduleItem[]).map(toScheduleItem),
    wishlist: ((wishRes.data ?? []) as DbWishlistItem[]).map(toWishlistItem),
  };
}

export async function createTrip(
  data: Omit<Trip, 'id' | 'flights' | 'accommodations' | 'scheduleItems' | 'wishlist' | 'createdAt'>
): Promise<Trip> {
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
    flights: [],
    accommodations: [],
    scheduleItems: [],
    wishlist: [],
  };
}

export async function updateTripInfo(
  id: string,
  data: Partial<Pick<Trip, 'name' | 'destination' | 'startDate' | 'endDate' | 'coverEmoji'>>
): Promise<void> {
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
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Flight CRUD
// ============================================================

export async function addFlight(tripId: string, data: Omit<Flight, 'id'>): Promise<Flight> {
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
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Accommodation CRUD
// ============================================================

export async function addAccommodation(tripId: string, data: Omit<Accommodation, 'id'>): Promise<Accommodation> {
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
  const { error } = await supabase.from('accommodations').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Schedule Item CRUD
// ============================================================

export async function addScheduleItem(tripId: string, data: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
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
  const { error } = await supabase.from('schedule_items').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Wishlist Item CRUD
// ============================================================

export async function addWishlistItem(tripId: string, data: Omit<WishlistItem, 'id'>): Promise<WishlistItem> {
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
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) throw error;
}
