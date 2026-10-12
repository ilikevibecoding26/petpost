import { useState } from 'react'
import PostCard from '../components/PostCard'
import { useDB, useMe } from '../useStore'

export default function Feed({ saved = false }: { saved?: boolean }) {
  const db = useDB()
  const me = useMe()!
  const [tab, setTab] = useState<'forYou' | 'following'>('forYou')
  const followingIds = new Set(db.follows.filter((f) => f.followerId === me.id && f.status === 'accepted').map((f) => f.followeeId))

  const posts = saved
    ? db.posts.filter((p) => db.reactions.some((r) => r.postId === p.id && r.userId === me.id && r.kind === 'wag'))
    : tab === 'following'
      ? db.posts.filter((p) => followingIds.has(p.userId))
      : db.posts.filter((p) => me.interests.includes(p.petType) || p.userId === me.id)

  const empty = saved
    ? 'Nothing wagged yet. Tap Wag on a post to save it here.'
    : tab === 'following'
      ? followingIds.size === 0
        ? "You're not following anyone yet. Tap a pet's name on any post to visit their profile."
        : 'No posts from people you follow yet.'
      : 'No posts yet. Be the first to share your pet!'

  return (
    <>
      {!saved && (
        <div className="feed-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'forYou'} className={tab === 'forYou' ? 'on' : ''} onClick={() => setTab('forYou')}>For you</button>
          <button role="tab" aria-selected={tab === 'following'} className={tab === 'following' ? 'on' : ''} onClick={() => setTab('following')}>Following</button>
        </div>
      )}
      {posts.length === 0
        ? <div className="empty card"><p className="big">{saved ? '🐾' : '🐶🐱'}</p><p>{empty}</p></div>
        : <div className="feed">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>}
    </>
  )
}
