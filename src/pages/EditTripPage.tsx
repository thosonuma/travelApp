import { useEffect, useState } from 'react';
import { Trip } from '../types';
import { loadTripByEditToken } from '../db';
import TripDetailPage from './TripDetailPage';
import { Loader2, Lock } from 'lucide-react';

interface Props {
  editToken: string;
}

export default function EditTripPage({ editToken }: Props) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTripByEditToken(editToken)
      .then(setTrip)
      .catch(() => setError('このリンクは無効か、編集共有がOFFになっています。'))
      .finally(() => setLoading(false));
  }, [editToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">編集リンクが無効です</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <TripDetailPage
      trip={trip}
      editToken={editToken}
      onTripUpdated={setTrip}
      onDelete={() => {}}
      onBack={() => { window.location.href = `/share/${trip.shareToken}?e=${editToken}`; }}
    />
  );
}
