import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { showMessage } from '../components/ConfirmHost'
import NoticeCard from '../components/NoticeCard'
import { approveFollower, followStatus, markNoticesSeen, removeFollower } from '../store'
import type { Notice } from '../types'
import { useDB } from '../useStore'

function FollowNotice({ notice }: { notice: Notice }) {
  const db = useDB()
  const actor = db.users.find((u) => u.id === notice.actorId)
  if (!actor) return null
  const pending = notice.kind === 'follow_request' && followStatus(actor.id, db.sessionUserId!) === 'pending'
  const text = {
    new_follower: 'started following you.',
    follow_request: pending ? 'wants to follow you.' : 'asked to follow you.',
    follow_accepted: 'accepted your follow request.',
    post_removed: '',
  }[notice.kind]

  return (
    <div className="person">
      <Link to={`/u/${actor.username}`} className="person-link">
        <Avatar user={actor} />
        <div><strong>@{actor.username}</strong> {text}</div>
      </Link>
      {pending && (
        <div className="row request-buttons">
          <button className="btn small" onClick={() => approveFollower(actor.id).catch((e) => showMessage(e.message))}>Approve</button>
          <button className="btn ghost small" onClick={() => removeFollower(actor.id).catch((e) => showMessage(e.message))}>Decline</button>
        </div>
      )}
    </div>
  )
}

export default function Notifications() {
  const db = useDB()
  const { notices } = db

  useEffect(() => {
    // Follow requests stay "new" until you approve or decline them.
    const stillPending = (n: Notice) => n.kind === 'follow_request' && followStatus(n.actorId, db.sessionUserId!) === 'pending'
    markNoticesSeen(notices.filter((n) => !n.seen && !stillPending(n)).map((n) => n.id))
  }, [notices, db.follows, db.sessionUserId])

  if (notices.length === 0) {
    return <div className="empty card"><p className="big">🔔</p><p>No notifications yet.</p></div>
  }
  return (
    <div className="feed">
      <h2 className="page-title">Notifications</h2>
      {notices.map((n) => (
        <div key={n.id} className="card">
          {n.kind === 'post_removed' ? <NoticeCard notice={n} /> : <FollowNotice notice={n} />}
        </div>
      ))}
    </div>
  )
}
