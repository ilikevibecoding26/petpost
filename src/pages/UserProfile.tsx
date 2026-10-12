import { Navigate, useParams } from 'react-router-dom'
import PostGrid from '../components/PostGrid'
import ProfileHeader from '../components/ProfileHeader'
import { canSee } from '../store'
import { useDB } from '../useStore'

export default function UserProfile() {
  const { username } = useParams()
  const db = useDB()
  const user = db.users.find((u) => u.username.toLowerCase() === username?.toLowerCase())
  if (!user) return <div className="empty card"><p className="big">🐾</p><p>Couldn't find @{username}.</p></div>
  if (user.id === db.sessionUserId) return <Navigate to="/me" replace />

  return (
    <>
      <div className="card"><ProfileHeader user={user} /></div>
      {canSee(user)
        ? <PostGrid posts={db.posts.filter((p) => p.userId === user.id)} />
        : (
          <div className="empty card">
            <p className="big">🔒</p>
            <p>This account is private. Follow {user.petName} to see their posts.</p>
          </div>
        )}
    </>
  )
}
