import { REMOVAL_REASONS, type Notice } from '../types'

const fmt = (t: number) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export default function NoticeCard({ notice }: { notice: Notice }) {
  const reason = REMOVAL_REASONS.find((r) => r.id === notice.reason)?.label
  return (
    <div className="notice">
      {notice.thumbUrl
        ? <img className="notice-thumb" src={notice.thumbUrl} alt="Removed post" />
        : <div className="notice-thumb empty-thumb">🐾</div>}
      <div className="notice-body">
        <strong>Your post was removed</strong>
        {reason && <p><span className="muted">Reason:</span> {reason}</p>}
        {notice.note && <p className="notice-note">“{notice.note}”</p>}
        {notice.postCaption && <p className="muted small">Caption: {notice.postCaption}</p>}
        <p className="muted small">
          {notice.postCreatedAt ? `Posted ${fmt(notice.postCreatedAt)} · ` : ''}Removed {fmt(notice.createdAt)}
        </p>
      </div>
    </div>
  )
}
