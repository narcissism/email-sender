# ✉ ScriptMailer

Write email scripts once. Let anyone send them — no account needed.

## How It Works

- **Writers** log in at `/write` → create scripts with `{{placeholders}}`
- **Senders** visit `/` → pick a script, fill in placeholders + recipient, hit send

---

## Setup (one-time)

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/scriptmailer.git
cd scriptmailer
npm install
```

### 2. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run this to create the scripts table:

```sql
create table scripts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Allow anyone to read scripts (senders don't need to log in)
alter table scripts enable row level security;
create policy "Public read" on scripts for select using (true);
create policy "Authenticated write" on scripts for insert with check (auth.uid() = user_id);
create policy "Owner update" on scripts for update using (auth.uid() = user_id);
create policy "Owner delete" on scripts for delete using (auth.uid() = user_id);
```

3. Go to **Settings → API** and copy your Project URL and anon key

### 3. Set up EmailJS (free)

1. Go to [emailjs.com](https://emailjs.com) and create an account
2. Add an **Email Service** (connect Gmail or Outlook)
3. Create an **Email Template** with these variables:
   - `{{to_email}}` — recipient
   - `{{from_name}}` — sender's name
   - `{{subject}}` — script title
   - `{{message}}` — filled script body
4. Copy your **Service ID**, **Template ID**, and **Public Key**

### 4. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:
```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_EMAILJS_SERVICE_ID=service_xxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxx
```

### 5. Run locally
```bash
npm start
```

---

## Deploy to Vercel (recommended, free)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add your environment variables in Vercel's project settings
4. Deploy — done!

---

## Using the App

### As a Writer
- Go to `/write`
- Sign up / log in
- Create scripts using `{{placeholder}}` syntax for dynamic fields
- Example: `Hi {{first_name}}, I wanted to reach out about {{topic}}...`

### As a Sender
- Go to `/` (home page)
- Pick a script
- Fill in your name, the recipient's email, and any placeholders
- Hit **Send Email** — it goes instantly

---

## Routes

| Route | Who | What |
|-------|-----|------|
| `/` | Anyone | Browse scripts + send |
| `/write` | Logged-in writers | Create + manage scripts |
