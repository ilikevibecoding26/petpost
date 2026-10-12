import { useEffect, useState } from 'react'
import Avatar from './Avatar'

export default function PhotoPicker({ file, onPick, size = 64 }: { file: File | null; onPick: (f: File | null) => void; size?: number }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) return setUrl(null)
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  return (
    <div className="photo-picker">
      <Avatar user={{ avatarUrl: url, petName: '' }} size={size} />
      <label className="btn ghost small">
        {file ? 'Change photo' : 'Choose photo'}
        <input type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </label>
      {file && <button type="button" className="link" onClick={() => onPick(null)}>Remove</button>}
    </div>
  )
}
