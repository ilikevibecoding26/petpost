import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { showMessage } from '../components/ConfirmHost'
import RemoveDialog from '../components/RemoveDialog'
import { dismissReports } from '../store'
import type { Post } from '../types'
import { useDB } from '../useStore'

export default function Reports() {
  const db = useDB()
  const [removing, setRemoving] = useState<Post | null>(null)
  if (!db.isAdmin) return <Navigate to="/" replace />

  const byPost = new Map<string, typeof db.reports>()
  for (const r of db.reports) byPost.set(r.postId, [...(byPost.get(r.postId) ?? []), r])
  const items = [...byPost.entries()]
    .map(([postId, reports]) => ({ post: db.posts.find((p) => p.id === postId), reports }))
    .sort((a, b) => b.reports.length - a.reports.length)

  if (items.length === 0) {
    return <div className="empty card"><p className="big">🐾</p><p>No reports to review. Everyone's posting pets!</p></div>
  }

  return (
    <div className="feed">
      <h2 className="page-title">Reports</h2>
      {items.map(({ post, reports }) => {
        const author = db.users.find((u) => u.id === post?.userId)
        return (
          <article key={reports[0].postId} className="card post">
            <header className="post-head">
              <Avatar user={author} />
              <div>
                <strong>{author?.petName ?? 'Unknown'}</strong>
                <div className="muted small">@{author?.username ?? '?'}</div>
              </div>
            </header>
            {post
              ? post.mediaKind === 'image'
                ? <img className="media" src={post.mediaUrl} alt={post.caption || 'Reported post'} />
                : <video className="media" src={post.mediaUrl} controls playsInline />
              : <p className="muted" style={{ padding: '0 16px' }}>This post is older than what's loaded.</p>}
            <div className="report-info">
              {post?.caption && <p><strong>Caption:</strong> {post.caption}</p>}
              <p>
                <strong>Reported {reports.length} {reports.length === 1 ? 'time' : 'times'} by:</strong>{' '}
                {reports.map((r) => '@' + (db.users.find((u) => u.id === r.reporterId)?.username ?? '?')).join(', ')}
              </p>
              <div className="row">
                <button className="btn ghost" onClick={() => dismissReports(reports[0].postId).catch((err) => showMessage(`Couldn't dismiss. ${err.message}`))}>Dismiss (it's fine)</button>
                {post && (
                  <button className="btn danger" onClick={() => setRemoving(post)}>
                    Remove post
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
      {removing && <RemoveDialog post={removing} onClose={() => setRemoving(null)} />}
    </div>
  )
}
