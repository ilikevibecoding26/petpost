import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { askConfirm } from '../components/ConfirmHost'
import { canSee, removeFollower } from '../store'
import { useDB } from '../useStore'

export default function FollowList({ which }: { which: 'followers' | 'following' }) {
  const { username } = useParams()
  const db = useDB()
  const user = db.users.find((u) => u.username.toLowerCase() === username?.toLowerCase())
  if (!user) return null
  if (!canSee(user)) return <div className="empty card"><p className="big">🔒</p><p>This account is private.</p></div>

  const isMe = user.id === db.sessionUserId
  const ids = db.follows
    .filter((f) => f.status === 'accepted' && (which === 'followers' ? f.followeeId === user.id : f.followerId === user.id))
    .map((f) => (which === 'followers' ? f.followerId : f.followeeId))
  const people = ids.map((id) => db.users.find((u) => u.id === id)).filter((u) => !!u)

  return (
    <div className="card">
      <h2 className="page-title">@{user.username}'s {which}</h2>
      {people.length === 0 && <p className="muted">{which === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}</p>}
      {people.map((p) => (
        <div key={p.id} className="person">
          <Link to={`/u/${p.username}`} className="person-link">
            <Avatar user={p} />
            <div><strong>{p.petName}</strong><div className="muted small">@{p.username}</div></div>
          </Link>
          {isMe && which === 'followers' && (
            <button
              className="btn ghost small"
              onClick={async () => { if (await askConfirm(`Remove @${p.username} from your followers?`, 'Remove', true)) removeFollower(p.id) }}
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
