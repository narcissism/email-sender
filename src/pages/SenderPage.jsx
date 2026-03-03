import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { getScripts, extractPlaceholders, fillPlaceholders } from '../lib/supabase'

export default function SenderPage() {
  const [scripts, setScripts] = useState([])
  const [selected, setSelected] = useState(null)
  const [editedBody, setEditedBody] = useState('')
  const [values, setValues] = useState({})
  const [emails, setEmails] = useState([''])
  const [fromName, setFromName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    getScripts().then(({ data }) => setScripts(data || []))
  }, [])

  const pick = (s) => {
    setSelected(s)
    setEditedBody(s.body)
    setValues({})
    setEmails([''])
    setFromName('')
    setSent(false)
    setError('')
  }

  const resetBody = () => setEditedBody(selected.body)

  const addEmail = () => setEmails(e => [...e, ''])
  const removeEmail = (i) => setEmails(e => e.filter((_, idx) => idx !== i))
  const updateEmail = (i, val) => setEmails(e => e.map((em, idx) => idx === i ? val : em))

  const placeholders = selected ? extractPlaceholders(editedBody) : []
  const preview = selected ? fillPlaceholders(editedBody, values) : ''

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const send = async () => {
    const validEmails = emails.map(e => e.trim()).filter(Boolean)
    if (!validEmails.length) return setError('Add at least one recipient email.')
    const invalid = validEmails.filter(e => !isValidEmail(e))
    if (invalid.length) return setError(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`)
    if (!fromName) return setError('Your name is required.')
    const unfilled = placeholders.filter(p => !values[p]?.trim())
    if (unfilled.length) return setError(`Fill in: ${unfilled.map(p => `{{${p}}}`).join(', ')}`)

    setSending(true); setError('')
    let successCount = 0
    for (const email of validEmails) {
      try {
        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          { to_email: email, from_name: fromName, subject: selected.title, message: preview },
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        )
        successCount++
      } catch (e) {}
    }
    setSending(false)
    if (successCount === 0) return setError('Failed to send. Check your EmailJS config.')
    setSentCount(successCount)
    setSent(true)
  }

  if (sent) return (
    <div className="sender-wrap">
      <div className="sent-card">
        <div className="sent-icon">✓</div>
        <h2>Email{sentCount > 1 ? 's' : ''} Sent!</h2>
        <p>Your message was sent to <strong>{sentCount} recipient{sentCount > 1 ? 's' : ''}</strong></p>
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
                <div className="email-list-label">Recipient emails</div>
                {emails.map((em, i) => (
                  <div className="email-row" key={i}>
                    <input className="inp" placeholder={`Recipient ${i + 1} email`} type="email"
                      value={em} onChange={e => updateEmail(i, e.target.value)} />
                    {emails.length > 1 && (
                      <button className="btn-remove" onClick={() => removeEmail(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button className="btn-add-email" onClick={addEmail}>+ Add another recipient</button>
                {placeholders.map(p => (
                  <input key={p} className="inp" placeholder={`{{${p}}}`}
                    value={values[p] || ''} onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))} />
                ))}
                {error && <p className="msg err">{error}</p>}
                <button className="btn-primary" onClick={send} disabled={sending}>
                  {sending ? `Sending to ${emails.filter(Boolean).length}…` : `Send to ${emails.filter(Boolean).length || 1} recipient${emails.filter(Boolean).length > 1 ? 's' : ''} ✉`}
                </button>
              </div>
              <div className="send-right">
                <div className="script-edit-header">
                  <h3>Edit Script</h3>
                  {editedBody !== selected.body && (
                    <button className="btn-reset" onClick={resetBody}>↺ Reset to original</button>
                  )}
                </div>
                <textarea className="textarea sender-textarea" value={editedBody}
                  onChange={e => { setEditedBody(e.target.value); setValues({}) }} rows={12} />
                {placeholders.length > 0 && (
                  <div className="detected">
                    <span>Placeholders:</span>
                    {placeholders.map(p => <span className="tag" key={p}>{`{{${p}}}`}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
