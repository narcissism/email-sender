import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { getScripts, extractPlaceholders, fillPlaceholders } from '../lib/supabase'

export default function SenderPage() {
  const [scripts, setScripts] = useState([])
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState({})
  const [toEmail, setToEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getScripts().then(({ data }) => setScripts(data || []))
  }, [])

  const pick = (s) => {
    setSelected(s)
    setValues({})
    setToEmail('')
    setFromName('')
    setSent(false)
    setError('')
  }

  const placeholders = selected ? extractPlaceholders(selected.body) : []
  const preview = selected ? fillPlaceholders(selected.body, values) : ''

  const send = async () => {
    if (!toEmail) return setError('Recipient email is required.')
    if (!fromName) return setError('Your name is required.')
    const unfilled = placeholders.filter(p => !values[p]?.trim())
    if (unfilled.length) return setError(`Fill in: ${unfilled.map(p => `{{${p}}}`).join(', ')}`)

    setSending(true); setError('')
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: toEmail,
          from_name: fromName,
          subject: selected.title,
          message: preview,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      setSent(true)
    } catch (e) {
      setError('Failed to send. Check your EmailJS config.')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="sender-wrap">
      <div className="sent-card">
        <div className="sent-icon">✓</div>
        <h2>Email Sent!</h2>
        <p>Your message was sent to <strong>{toEmail}</strong></p>
        <button className="btn-primary" onClick={() => { setSent(false); setSelected(null) }}>Send Another</button>
      </div>
    </div>
  )

  return (
    <div className="sender-wrap">
      <header className="sender-header">
        <div className="dash-logo">✉ ScriptMailer</div>
        <p>Pick a script and send it — no account needed</p>
      </header>

      <div className="sender-body">
        {!selected ? (
          <div className="pick-section">
            <h2>Choose a Script</h2>
            {scripts.length === 0 && <div className="empty">No scripts available yet.</div>}
            <div className="script-grid">
              {scripts.map(s => (
                <div className="script-card clickable" key={s.id} onClick={() => pick(s)}>
                  <div className="sc-title">{s.title}</div>
                  <div className="sc-preview">{s.body.slice(0, 120)}{s.body.length > 120 ? '…' : ''}</div>
                  <div className="sc-tags">
                    {extractPlaceholders(s.body).map(p => (
                      <span className="tag" key={p}>{`{{${p}}}`}</span>
                    ))}
                  </div>
                  <div className="sc-cta">Use this script →</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="send-section">
            <button className="btn-ghost back-btn" onClick={() => setSelected(null)}>← Back to scripts</button>
            <h2>{selected.title}</h2>

            <div className="send-grid">
              <div className="send-left">
                <h3>Fill in details</h3>
                <input className="inp" placeholder="Your name" value={fromName} onChange={e => setFromName(e.target.value)} />
                <input className="inp" placeholder="Recipient email" type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} />
                {placeholders.map(p => (
                  <input key={p} className="inp" placeholder={`{{${p}}}`}
                    value={values[p] || ''} onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))} />
                ))}
                {error && <p className="msg err">{error}</p>}
                <button className="btn-primary" onClick={send} disabled={sending}>
                  {sending ? 'Sending…' : 'Send Email ✉'}
                </button>
              </div>

              <div className="send-right">
                <h3>Preview</h3>
                <div className="preview-box">{preview}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
