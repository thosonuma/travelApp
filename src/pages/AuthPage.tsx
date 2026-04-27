import { useState } from 'react';
import { supabase } from '../supabase';
import { Plane, Mail, Lock, Loader2, FlaskConical } from 'lucide-react';

interface Props {
  onDemoLogin: () => void;
}

export default function AuthPage({ onDemoLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('確認メールを送りました。メールのリンクをクリックしてアカウントを有効化してください。');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        setMessage('パスワードリセット用のメールを送りました。メールをご確認ください。');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // App.tsx の onAuthStateChange が自動的に画面を切り替える
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '不明なエラーが発生しました';
      if (msg.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (msg.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。確認メールをご確認ください。');
      } else if (msg.includes('User already registered')) {
        setError('このメールアドレスはすでに登録されています');
      } else if (msg.includes('Password should be at least 6 characters')) {
        setError('パスワードは6文字以上で入力してください');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-500 rounded-2xl mb-4 shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">旅行プランナー</h1>
          <p className="text-gray-500 text-sm mt-1">すべての旅をここで管理</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Tab switcher */}
          {mode !== 'reset' && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                新規登録
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">パスワードをリセット</h2>
              <p className="text-xs text-gray-500">登録済みのメールアドレスを入力してください。リセット用リンクをお送りします。</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード{mode === 'signup' && <span className="text-gray-400 font-normal">（6文字以上）</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                {mode === 'login' && (
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                      className="text-xs text-sky-500 hover:text-sky-600 hover:underline"
                    >
                      パスワードを忘れた方
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-sky-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'ログイン' : mode === 'signup' ? 'アカウントを作成' : 'リセットメールを送る'}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                ← ログインに戻る
              </button>
            )}
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={onDemoLogin}
                className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-amber-50 text-amber-700 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <FlaskConical className="w-4 h-4" />
                テストログインで試す
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                登録不要・サンプルデータで全機能を体験できます
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
