import { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const [success, setSuccess] = useState('')

  const handle = async () => {
    setError(''); setSuccess(''); setLoading(true)
    const { data, error: err } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)
    if (err) return setError(err.message)
    if (mode === 'signup') return setSuccess('Check your email to confirm your account.')
    onAuth(data.user)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">✉</div>
        <h1 className="auth-title">ScriptMailer</h1>
        <p className="auth-sub">Write once. Send anywhere.</p>
        <div className="tab-row">
          <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log In</button>
          <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
        </div>
        <input className="inp" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="inp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()} />
        {error && <p className="msg err">{error}</p>}
        {success && <p className="msg ok">{success}</p>}
        <button className="btn-primary" onClick={handle} disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
