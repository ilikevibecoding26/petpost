import { Link } from 'react-router-dom'
import type { Post } from '../types'

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="muted center">No posts yet.</p>
  return (
    <div className="grid">
      {posts.map((p) => (
        <Link key={p.id} to={`/p/${p.id}`} className="grid-item" aria-label={p.caption || 'Post'}>
          {p.mediaKind === 'image'
            ? <img src={p.mediaUrl} alt="" loading="lazy" />
            : <><video src={p.mediaUrl} muted playsInline preload="metadata" /><span className="grid-video">▶</span></>}
        </Link>
      ))}
    </div>
  )
}
