import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { PET_TYPES } from '../types'
import { useDB } from '../useStore'

export default function Search() {
  const db = useDB()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()

  const people = term
    ? db.users
        .filter((u) => u.id !== db.sessionUserId)
        .filter((u) => u.username.toLowerCase().includes(term) || u.petName.toLowerCase().includes(term))
        .slice(0, 30)
    : []
  // Matches "bunny" → Small animals, "pup" → Dogs, and so on.
  const pets = term
    ? PET_TYPES.filter((t) => t.label.toLowerCase().includes(term) || t.words.some((w) => w.startsWith(term) || term.startsWith(w)))
    : PET_TYPES

  return (
    <div className="search">
      <input
        autoFocus
        type="search"
        placeholder="Search pets and people…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search"
      />

      {term && (
        <div className="card">
          <h3 className="section-title">People</h3>
          {people.length === 0 && <p className="muted">No one found for “{q.trim()}”.</p>}
          {people.map((u) => (
            <Link key={u.id} to={`/u/${u.username}`} className="person person-link">
              <Avatar user={u} />
              <div>
                <strong>{u.petName}</strong> {u.isPrivate && <span aria-label="Private account">🔒</span>}
                <div className="muted small">@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="section-title">{term ? 'Pets' : 'Browse pets'}</h3>
        {pets.length === 0 && <p className="muted">No pet types match “{q.trim()}”.</p>}
        <div className="chips">
          {pets.map((t) => (
            <Link key={t.id} to={`/pets/${t.id}`} className="chip pet-chip">{t.emoji} {t.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
