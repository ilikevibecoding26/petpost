import { useState } from 'react'
import { Link } from 'react-router-dom'
import PetTypePicker from '../components/PetTypePicker'
import PostGrid from '../components/PostGrid'
import ProfileHeader from '../components/ProfileHeader'
import { showMessage } from '../components/ConfirmHost'
import { logOut, setAvatar, setPrivate, updateInterests } from '../store'
import { setTheme, useTheme } from '../theme'
import { useDB, useMe } from '../useStore'

export default function Profile() {
  const db = useDB()
  const me = useMe()!
  const [uploading, setUploading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const theme = useTheme()
  const mine = db.posts.filter((p) => p.userId === me.id)
  const reportedPosts = new Set(db.reports.map((r) => r.postId)).size

  async function changePhoto(f: File | undefined) {
    if (!f) return
    setUploading(true)
    try { await setAvatar(f) } catch (err) { showMessage((err as Error).message) }
    setUploading(false)
  }

  return (
    <>
      <div className="card profile">
        <ProfileHeader user={me} />
        <label className="link change-photo">
          {uploading ? 'Uploading…' : me.avatarUrl ? 'Change photo' : 'Add a photo'}
          <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => changePhoto(e.target.files?.[0])} />
        </label>
        {db.isAdmin && (
          <Link to="/reports" className="btn ghost">Review reports{reportedPosts > 0 && ` (${reportedPosts})`}</Link>
        )}
        <button className="btn ghost" onClick={() => setSettingsOpen((o) => !o)}>⚙️ Settings</button>
        {settingsOpen && (
          <div className="settings">
            <label className="toggle">
              <span>
                🔒 Private account
                <span className="muted small">Only people you approve can see your posts.</span>
              </span>
              <input type="checkbox" checked={me.isPrivate} onChange={(e) => setPrivate(e.target.checked).catch((err) => showMessage(err.message))} />
            </label>
            <label>Appearance</label>
            <div className="theme-picker" role="radiogroup" aria-label="Appearance">
              {([['light', '☀️ Light'], ['dark', '🌙 Dark'], ['system', '📱 Match device']] as const).map(([v, label]) => (
                <button key={v} role="radio" aria-checked={theme === v} className={theme === v ? 'on' : ''} onClick={() => setTheme(v)}>{label}</button>
              ))}
            </div>
            <label>Animals in my "For you" feed</label>
            <PetTypePicker
              selected={me.interests}
              onToggle={(t) => {
                const next = me.interests.includes(t) ? me.interests.filter((x) => x !== t) : [...me.interests, t]
                if (next.length) updateInterests(next)
              }}
            />
            <button className="btn ghost" onClick={logOut}>Log out</button>
          </div>
        )}
      </div>
      <PostGrid posts={mine} />
    </>
  )
}
