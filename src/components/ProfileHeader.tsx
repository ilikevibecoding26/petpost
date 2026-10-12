import { Link } from 'react-router-dom'
import { canSee, follow, followStatus, unfollow } from '../store'
import { PET_TYPES, type User } from '../types'
import { useDB } from '../useStore'
import Avatar from './Avatar'
import { askConfirm, showMessage } from './ConfirmHost'

export default function ProfileHeader({ user }: { user: User }) {
  const db = useDB()
  const pet = PET_TYPES.find((t) => t.id === user.petType)
  const isMe = user.id === db.sessionUserId
  const status = followStatus(db.sessionUserId, user.id)
  const followers = db.follows.filter((f) => f.followeeId === user.id && f.status === 'accepted').length
  const following = db.follows.filter((f) => f.followerId === user.id && f.status === 'accepted').length
  const posts = db.posts.filter((p) => p.userId === user.id).length
  const visible = canSee(user)

  async function onFollowClick() {
    try {
      if (!status) await follow(user.id)
      else if (status === 'pending') {
        if (await askConfirm(`Cancel your follow request to @${user.username}?`, 'Cancel request')) await unfollow(user.id)
      } else if (await askConfirm(`Unfollow @${user.username}?`, 'Unfollow')) await unfollow(user.id)
    } catch (err) {
      showMessage(`Something went wrong. ${(err as Error).message}`)
    }
  }

  const count = (n: number, label: string, to: string) =>
    visible
      ? <Link to={to} className="count"><strong>{n}</strong> {label}</Link>
      : <span className="count"><strong>{n}</strong> {label}</span>

  return (
    <div className="profile-header">
      <div className="avatar-center"><Avatar user={user} size={96} /></div>
      <h2>{user.petName} {user.isPrivate && <span title="Private account" aria-label="Private account">🔒</span>}</h2>
      <p className="muted">@{user.username} · {pet?.emoji} {pet?.label}</p>
      <div className="counts">
        {visible ? <span className="count"><strong>{posts}</strong> posts</span> : null}
        {count(followers, followers === 1 ? 'follower' : 'followers', `/u/${user.username}/followers`)}
        {count(following, 'following', `/u/${user.username}/following`)}
      </div>
      {!isMe && (
        <button className={'btn' + (status ? ' ghost' : '')} onClick={onFollowClick}>
          {status === 'accepted' ? 'Following ✓' : status === 'pending' ? 'Requested' : user.isPrivate ? 'Request to follow' : 'Follow'}
        </button>
      )}
    </div>
  )
}
