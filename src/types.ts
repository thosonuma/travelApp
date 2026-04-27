export type FlightDirection = 'outbound' | 'return';
export type TransportType = 'flight' | 'shinkansen' | 'train' | 'bus' | 'ferry' | 'rental_car';
export type ItemCategory = 'tour' | 'food' | 'transport' | 'free';
export type ItemStatus = 'booked' | 'tentative';
export type WishlistCategory = 'restaurant' | 'spot' | 'shop' | 'activity';
export type WishlistPriority = 'high' | 'medium' | 'low';
export type PackingCategory = 'clothing' | 'toiletry' | 'document' | 'electronics' | 'medicine' | 'other';

export interface Flight {
  id: string;
  transportType: TransportType;
  direction: FlightDirection;
  airline: string;
  flightNo: string;
  departureAirport: string;
  arrivalAirport: string;
  date: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  arrivalTime: string;
  seatNo: string;
  bookingRef: string;
  notes: string;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  notes: string;
}

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  category: ItemCategory;
  title: string;
  location: string;
  notes: string;
  status: ItemStatus;
  price: string;
}

export interface WishlistItem {
  id: string;
  category: WishlistCategory;
  name: string;
  notes: string;
  priority: WishlistPriority;
}

export interface PackingItem {
  id: string;
  category: PackingCategory;
  name: string;
  notes: string;
  isChecked: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  coverEmoji: string;
  flights: Flight[];
  accommodations: Accommodation[];
  scheduleItems: ScheduleItem[];
  wishlist: WishlistItem[];
  packingItems: PackingItem[];
  createdAt: string;
  isShared: boolean;
  shareToken: string;
  isEditEnabled: boolean;
  editToken: string;
}
