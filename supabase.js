import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// Script helpers
export const getScripts = () =>
  supabase.from('scripts').select('*').order('created_at', { ascending: false })

export const createScript = (title, body, userId) =>
  supabase.from('scripts').insert([{ title, body, user_id: userId }]).select().single()

export const updateScript = (id, title, body) =>
  supabase.from('scripts').update({ title, body }).eq('id', id).select().single()

export const deleteScript = (id) =>
  supabase.from('scripts').delete().eq('id', id)

// Extract {{placeholders}} from script body
export const extractPlaceholders = (text) => {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
}

// Replace placeholders with values
export const fillPlaceholders = (text, values) => {
  let filled = text
  Object.entries(values).forEach(([key, val]) => {
    filled = filled.replaceAll(`{{${key}}}`, val)
  })
  return filled
}
