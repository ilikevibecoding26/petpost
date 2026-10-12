# petpost 🐾

A cozy social app where you can only post pics and vids of your pets.

- **Lick** (like), **Wag** (save), and **Bark** (comment)
- Pick your pet type and which animals show up in your "For you" feed
- Built-in camera, plus a photo editor with pet stickers and text
- Follow people, optional private accounts, search for pets and people
- "Report: not a pet" with an admin review page
- Light, dark, or match-device appearance

Built with React + TypeScript (Vite) and Supabase.

## Running it locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key.
3. `npm run dev`

Database setup notes are in [`supabase/migrations/README.md`](supabase/migrations/README.md).
