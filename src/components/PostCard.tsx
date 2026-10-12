import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addComment, deletePost, reportPost, toggleReaction } from '../store'
import { useDB, useMe } from '../useStore'
import type { Post } from '../types'
import Avatar from './Avatar'
import { askConfirm, showMessage } from './ConfirmHost'
import { BarkIcon, LickIcon, WagIcon } from './Icons'

export default function PostCard({ post }: { post: Post }) {
  const db = useDB()
  const me = useMe()
  const [showBarks, setShowBarks] = useState(false)
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const author = db.users.find((u) => u.id === post.userId)
  const licks = db.reactions.filter((r) => r.postId === post.id && r.kind === 'lick')
  const licked = licks.some((r) => r.userId === me?.id)
  const wagged = db.reactions.some((r) => r.postId === post.id && r.kind === 'wag' && r.userId === me?.id)
  const barks = db.comments.filter((c) => c.postId === post.id)
  const reported = db.myReports.includes(post.id)
  const mine = post.userId === me?.id

  return (
    <article className="card post">
      <header className="post-head">
        <Link to={`/u/${author?.username}`} className="person-link">
          <Avatar user={author} />
          <div>
            <strong>{author?.petName}</strong>
            <div className="muted small">@{author?.username}</div>
          </div>
        </Link>
        {mine && (
          <div className="menu-wrap">
            <button className="dots" aria-label="Post options" onClick={() => setMenuOpen((o) => !o)}>•••</button>
            {menuOpen && (
              <div className="menu">
                <button
                  className="danger"
                  onClick={async () => {
                    setMenuOpen(false)
                    if (!(await askConfirm("Delete this post? This can't be undone.", 'Delete', true))) return
                    deletePost(post).catch((err) => showMessage(`Couldn't delete that post. ${err.message}`))
                  }}
                >
                  Delete post
                </button>
                <button onClick={() => setMenuOpen(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}
        {!mine && (
          <button
            className="report"
            disabled={reported}
            onClick={async () => {
              if (!(await askConfirm('Report this post as not a pet?', 'Report'))) return
              try {
                await reportPost(post.id)
                showMessage("Thanks! We'll take a look.")
              } catch (err) {
                showMessage(`Couldn't send that report. ${(err as Error).message}`)
              }
            }}
          >
            {reported ? 'Reported' : 'Report: not a pet'}
          </button>
        )}
      </header>

      {post.mediaKind === 'image'
        ? <img className="media" src={post.mediaUrl} alt={post.caption || 'Pet photo'} />
        : <video className="media" src={post.mediaUrl} controls playsInline />}

      <div className="actions">
        <button className={'react' + (licked ? ' on' : '')} onClick={() => toggleReaction(post.id, 'lick')}>
          <LickIcon on={licked} /> Lick {licks.length > 0 && <span>{licks.length}</span>}
        </button>
        <button className={'react' + (showBarks ? ' on' : '')} onClick={() => setShowBarks((s) => !s)}>
          <BarkIcon on={showBarks} /> Bark {barks.length > 0 && <span>{barks.length}</span>}
        </button>
        <button className={'react right' + (wagged ? ' on' : '')} onClick={() => toggleReaction(post.id, 'wag')}>
          <WagIcon on={wagged} /> {wagged ? 'Wagged' : 'Wag'}
        </button>
      </div>

      {post.caption && <p className="caption"><strong>{author?.petName}</strong> {post.caption}</p>}

      {showBarks && (
        <div className="barks">
          {barks.map((c) => (
            <p key={c.id}><Link to={`/u/${db.users.find((u) => u.id === c.userId)?.username}`} className="name-link">{db.users.find((u) => u.id === c.userId)?.username}</Link> {c.text}</p>
          ))}
          <form onSubmit={async (e) => { e.preventDefault(); const t = text; setText(''); await addComment(post.id, t) }}>
            <input placeholder="Bark something nice…" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn small" disabled={!text.trim()}>Bark</button>
          </form>
        </div>
      )}
    </article>
  )
}
