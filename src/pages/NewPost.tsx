import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Camera from '../components/Camera'
import PhotoEditor from '../editor/PhotoEditor'
import { createPost } from '../store'
import { useMe } from '../useStore'

// Matches the petpost-media bucket's file size limit in Supabase.
const MAX_BYTES = 50 * 1024 * 1024

export default function NewPost() {
  const me = useMe()!
  const nav = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  function pick(f: File | undefined) {
    setError('')
    if (!f) return
    if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) return setError('Pics and vids only!')
    if (f.size > MAX_BYTES) return setError('That file is too big for now (max 50 MB).')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function share() {
    if (!file) return
    setBusy(true)
    try {
      await createPost(file, caption.trim(), me.petType)
      nav('/')
    } catch (err) {
      setError(`Couldn't post that. ${(err as Error).message}`)
      setBusy(false)
    }
  }

  return (
    <div className="card newpost">
      <h2>Share {me.petName}</h2>
      {preview ? (
        <div className="drop has-media">
          {file?.type.startsWith('video/') ? <video src={preview} className="media" controls playsInline /> : <img src={preview} className="media" alt="" />}
        </div>
      ) : (
        <div className="drop">
          <div className="source-buttons">
            <button className="btn" onClick={() => setCameraOpen(true)}>📸 Take a video or picture</button>
            <label className="btn ghost">
              🖼️ Choose from my photos
              <input type="file" accept="image/*,video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      )}
      {preview && file?.type.startsWith('image/') && (
        <button className="btn ghost" onClick={() => setEditing(true)}>✨ Add stickers and text</button>
      )}
      {preview && (
        <button className="link" onClick={() => { setFile(null); setPreview('') }}>Pick something else</button>
      )}
      <textarea placeholder={`Say something about ${me.petName}…`} value={caption} onChange={(e) => setCaption(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={!preview || busy} onClick={share}>{busy ? 'Posting…' : 'Post'}</button>
      {editing && file && (
        <PhotoEditor file={file} onCancel={() => setEditing(false)} onDone={(f) => { setEditing(false); pick(f) }} />
      )}
      {cameraOpen && <Camera onClose={() => setCameraOpen(false)} onCapture={(f) => { setCameraOpen(false); pick(f) }} />}
    </div>
  )
}
