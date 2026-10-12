import { useState } from 'react'
import { adminRemovePost } from '../store'
import { REMOVAL_REASONS, type Post, type RemovalReason } from '../types'

export default function RemoveDialog({ post, onClose }: { post: Post; onClose: () => void }) {
  const [reason, setReason] = useState<RemovalReason>('not_a_pet')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setBusy(true)
    setError('')
    try {
      await adminRemovePost(post, reason, note)
      onClose()
    } catch (err) {
      setError(`Couldn't remove that post. ${(err as Error).message}`)
      setBusy(false)
    }
  }

  return (
    <div className="dialog-backdrop" onClick={() => !busy && onClose()}>
      <div className="dialog card remove-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p>Remove this post for everyone?</p>
        <label>Reason</label>
        <div className="chips">
          {REMOVAL_REASONS.map((r) => (
            <button type="button" key={r.id} className={'chip' + (reason === r.id ? ' chip-on' : '')} onClick={() => setReason(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <label>Note to the owner <span className="muted small">(optional)</span></label>
        <textarea maxLength={300} placeholder="Add a friendly note…" value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="muted small" style={{ fontWeight: 400 }}>They'll get a notification with a small thumbnail of the post.</p>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn ghost" disabled={busy} onClick={onClose}>Cancel</button>
          <button className="btn danger" disabled={busy} onClick={remove}>{busy ? 'Removing…' : 'Remove post'}</button>
        </div>
      </div>
    </div>
  )
}
