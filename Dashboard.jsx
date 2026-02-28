import { useState, useEffect } from 'react'
import { getScripts, createScript, updateScript, deleteScript, signOut, extractPlaceholders } from '../lib/supabase'

export default function Dashboard({ user, onSignOut }) {
  const [scripts, setScripts] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | script object
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await getScripts()
    setScripts(data || [])
  }

  const openNew = () => { setEditing('new'); setTitle(''); setBody(''); setError('') }
  const openEdit = (s) => { setEditing(s); setTitle(s.title); setBody(s.body); setError('') }
  const closeEdit = () => setEditing(null)

  const save = async () => {
    if (!title.trim() || !body.trim()) return setError('Title and body are required.')
    setSaving(true); setError('')
    if (editing === 'new') {
      const { error: err } = await createScript(title, body, user.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await updateScript(editing.id, title, body)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); closeEdit(); load()
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this script?')) return
    await deleteScript(id); load()
  }

  const handleSignOut = async () => { await signOut(); onSignOut() }

  const placeholders = extractPlaceholders(body)

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-logo">✉ ScriptMailer</div>
        <div className="dash-user">
          <span>{user.email}</span>
          <button className="btn-ghost" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <main className="dash-main">
        {!editing ? (
          <>
            <div className="dash-top">
              <h2>Your Scripts</h2>
              <button className="btn-primary" onClick={openNew}>+ New Script</button>
            </div>
            {scripts.length === 0 && (
              <div className="empty">No scripts yet. Create one to get started.</div>
            )}
            <div className="script-grid">
              {scripts.map(s => (
                <div className="script-card" key={s.id}>
                  <div className="sc-title">{s.title}</div>
                  <div className="sc-preview">{s.body.slice(0, 100)}{s.body.length > 100 ? '…' : ''}</div>
                  <div className="sc-tags">
                    {extractPlaceholders(s.body).map(p => (
                      <span className="tag" key={p}>{`{{${p}}}`}</span>
                    ))}
                  </div>
                  <div className="sc-actions">
                    <button className="btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn-sm danger" onClick={() => remove(s.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="editor">
            <div className="editor-top">
              <h2>{editing === 'new' ? 'New Script' : 'Edit Script'}</h2>
              <button className="btn-ghost" onClick={closeEdit}>← Back</button>
            </div>
            <input className="inp" placeholder="Script title" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="hint">
              Use <code>{'{{placeholder}}'}</code> for dynamic fields — e.g. <code>{'{{first_name}}'}</code>, <code>{'{{company}}'}</code>
            </div>
            <textarea className="textarea" placeholder="Write your email script here..." value={body} onChange={e => setBody(e.target.value)} rows={14} />
            {placeholders.length > 0 && (
              <div className="detected">
                <span>Detected placeholders:</span>
                {placeholders.map(p => <span className="tag" key={p}>{`{{${p}}}`}</span>)}
              </div>
            )}
            {error && <p className="msg err">{error}</p>}
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Script'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
