import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isConfigured } from './supabase';
import { Trip } from './types';
import * as db from './db';
import AuthPage from './pages/AuthPage';
import TripListPage from './pages/TripListPage';
import TripDetailPage from './pages/TripDetailPage';
import SharedTripPage from './pages/SharedTripPage';
import EditTripPage from './pages/EditTripPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { Loader2, FlaskConical } from 'lucide-react';

// /share/:token or /edit/:token の形式か確認
const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/);
const SHARE_TOKEN = shareMatch ? shareMatch[1] : null;
const editMatch = window.location.pathname.match(/^\/edit\/([^/]+)$/);
const EDIT_TOKEN = editMatch ? editMatch[1] : null;

// パスワードリセットリンクからのリダイレクト検知 (#type=recovery)
const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
const IS_PASSWORD_RECOVERY = hashParams.get('type') === 'recovery';

type View = { page: 'list' } | { page: 'detail'; tripId: string };

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [view, setView] = useState<View>({ page: 'list' });
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load trips when user or demo mode changes
  useEffect(() => {
    if (!user && !demoMode) {
      setTrips([]);
      setView({ page: 'list' });
      setCurrentTrip(null);
      return;
    }
    setTripsLoading(true);
    db.loadTrips()
      .then(setTrips)
      .catch(console.error)
      .finally(() => setTripsLoading(false));
  }, [user, demoMode]);

  async function handleSelectTrip(id: string) {
    setDetailLoading(true);
    setView({ page: 'detail', tripId: id });
    try {
      const trip = await db.loadTripDetails(id);
      setCurrentTrip(trip);
    } catch (e) {
      console.error(e);
      setView({ page: 'list' });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateTrip(
    data: Omit<Trip, 'id' | 'flights' | 'accommodations' | 'scheduleItems' | 'wishlist' | 'packingItems' | 'createdAt'>
  ) {
    const newTrip = await db.createTrip(data);
    setTrips((prev) => [newTrip, ...prev]);
    await handleSelectTrip(newTrip.id);
  }

  async function handleDeleteTrip(id: string) {
    await db.deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setView({ page: 'list' });
    setCurrentTrip(null);
  }

  function handleTripUpdated(updated: Trip) {
    setCurrentTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDemoLogin() {
    db.setDemoMode(true);
    setDemoMode(true);
  }

  async function handleSignOut() {
    if (demoMode) {
      db.setDemoMode(false);
      setDemoMode(false);
      return;
    }
    await supabase.auth.signOut();
  }

  // --- Render ---

  // 共有・編集ページは認証・設定チェック不要で表示
  if (IS_PASSWORD_RECOVERY) {
    return <ResetPasswordPage />;
  }
  if (SHARE_TOKEN) {
    return <SharedTripPage shareToken={SHARE_TOKEN} />;
  }
  if (EDIT_TOKEN) {
    return <EditTripPage editToken={EDIT_TOKEN} />;
  }

  if (!isConfigured && !demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Supabase の設定が必要です</h1>
          <p className="text-gray-500 text-sm mb-6">
            プロジェクトルートに <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> を作成してください。
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-left text-xs font-mono text-green-400 space-y-1 mb-6">
            <p>VITE_SUPABASE_URL=https://xxxx.supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
          </div>
          <p className="text-gray-400 text-xs mb-6">
            Supabase ダッシュボード → Project Settings → API からコピーできます
          </p>
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 mb-3">設定せずに機能を確認したい場合</p>
            <button
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-amber-50 text-amber-700 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              テストログインで試す
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading && !demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (!user && !demoMode) {
    return <AuthPage onDemoLogin={handleDemoLogin} />;
  }

  if (view.page === 'detail') {
    if (detailLoading || !currentTrip) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      );
    }
    return (
      <TripDetailPage
        trip={currentTrip}
        onTripUpdated={handleTripUpdated}
        onDelete={() => handleDeleteTrip(currentTrip.id)}
        onBack={() => { setView({ page: 'list' }); setCurrentTrip(null); }}
        isDemoMode={demoMode}
      />
    );
  }

  return (
    <TripListPage
      trips={trips}
      loading={tripsLoading}
      userEmail={demoMode ? 'テストユーザー' : (user?.email ?? '')}
      isDemoMode={demoMode}
      onCreate={handleCreateTrip}
      onSelect={handleSelectTrip}
      onDelete={handleDeleteTrip}
      onSignOut={handleSignOut}
    />
  );
}
