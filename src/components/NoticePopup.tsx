import { markNoticesSeen } from '../store'
import { useDB } from '../useStore'
import NoticeCard from './NoticeCard'

// Shows unseen notifications one at a time when the app opens.
export default function NoticePopup() {
  const { notices } = useDB()
  const next = notices.find((n) => !n.seen && n.kind === 'post_removed')
  if (!next) return null
  return (
    <div className="dialog-backdrop">
      <div className="dialog card" role="dialog" aria-modal="true">
        <NoticeCard notice={next} />
        <p className="muted small" style={{ fontWeight: 400 }}>Remember: petpost is for pets only. 🐾</p>
        <button className="btn" autoFocus onClick={() => markNoticesSeen([next.id])}>OK</button>
      </div>
    </div>
  )
}
