import { useEffect, useRef, useState } from 'react'
import { ALL_STICKERS, loadStickerImage, STICKER_GROUPS, stickerUrl } from './stickers'

// Sizes are fractions of the photo's width so the screen and the saved photo match.
const STICKER_WIDTH = 0.28
const TEXT_SIZE = 0.075
const MAX_EXPORT = 2048

export const TEXT_COLORS = ['#4a3f38', '#ffffff', '#e8a598', '#7fa896', '#e38fb0', '#f5c96b']
export const TEXT_FONTS = [
  { id: 'rounded', label: 'Rounded', css: "800 1em 'Nunito', sans-serif" },
  { id: 'handwritten', label: 'Handwritten', css: "700 1.15em 'Caveat', cursive" },
  { id: 'bold', label: 'Bold', css: "600 1em 'Fredoka', sans-serif" },
] as const
type FontId = (typeof TEXT_FONTS)[number]['id']

interface Base { id: string; x: number; y: number; scale: number; rotation: number }
interface StickerLayer extends Base { kind: 'sticker'; stickerId: string }
interface TextLayer extends Base { kind: 'text'; text: string; color: string; font: FontId; bubble: boolean }
type Layer = StickerLayer | TextLayer

const bubbleColor = (color: string) => (color === '#ffffff' || color === '#f5c96b' ? '#4a3f38' : '#fffdf9')
const fontFor = (id: FontId) => TEXT_FONTS.find((f) => f.id === id)!

interface Props {
  file: File
  onDone: (file: File) => void
  onCancel: () => void
}

export default function PhotoEditor({ file, onDone, onCancel }: Props) {
  const [url, setUrl] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [stageW, setStageW] = useState(0)
  const [layers, setLayers] = useState<Layer[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [panel, setPanel] = useState<'stickers' | 'text' | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ layer: Layer; start: Map<number, { x: number; y: number }> } | null>(null)

  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  // Fit the photo into whatever space the tools leave.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const ro = new ResizeObserver(() => setBox({ w: stage.clientWidth - 32, h: stage.clientHeight - 24 }))
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const ro = new ResizeObserver(() => setStageW(img.clientWidth))
    ro.observe(img)
    return () => ro.disconnect()
  }, [url])

  const sel = layers.find((l) => l.id === selected) ?? null
  const update = (id: string, patch: Partial<Layer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)))

  function addSticker(stickerId: string) {
    const layer: StickerLayer = { id: crypto.randomUUID(), kind: 'sticker', stickerId, x: 0.5, y: 0.5, scale: 1, rotation: 0 }
    setLayers((ls) => [...ls, layer])
    setSelected(layer.id)
    setPanel(null)
  }

  function addOrUpdateText() {
    const text = draft.trim()
    if (!text) return
    if (sel?.kind === 'text') {
      update(sel.id, { text })
    } else {
      const layer: TextLayer = {
        id: crypto.randomUUID(), kind: 'text', text, color: '#ffffff', font: 'rounded', bubble: true,
        x: 0.5, y: 0.5, scale: 1, rotation: 0,
      }
      setLayers((ls) => [...ls, layer])
      setSelected(layer.id)
    }
  }

  // --- Drag (one finger/mouse) and pinch to resize + rotate (two fingers) ---
  function onPointerDown(e: React.PointerEvent, layer: Layer) {
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setSelected(layer.id)
    if (layer.kind === 'text' && panel === 'text') setDraft(layer.text)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gesture.current = { layer: layers.find((l) => l.id === layer.id)!, start: new Map(pointers.current) }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!gesture.current || !pointers.current.has(e.pointerId) || !imgRef.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const { layer, start } = gesture.current
    const rect = imgRef.current.getBoundingClientRect()
    const now = [...pointers.current.entries()]
    if (now.length === 1) {
      const [id, p] = now[0]
      const s = start.get(id)
      if (!s) return
      update(layer.id, {
        x: Math.min(1, Math.max(0, layer.x + (p.x - s.x) / rect.width)),
        y: Math.min(1, Math.max(0, layer.y + (p.y - s.y) / rect.height)),
      })
    } else if (now.length >= 2) {
      const [[idA, a], [idB, b]] = now
      const sa = start.get(idA), sb = start.get(idB)
      if (!sa || !sb) return
      const dist = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)
      const angle = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.atan2(q.y - p.y, q.x - p.x)
      update(layer.id, {
        scale: Math.min(5, Math.max(0.2, layer.scale * (dist(a, b) / Math.max(1, dist(sa, sb))))),
        rotation: layer.rotation + ((angle(a, b) - angle(sa, sb)) * 180) / Math.PI,
      })
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    // Restart the gesture from the current state so lifting one finger doesn't jump.
    const current = gesture.current && layers.find((l) => l.id === gesture.current!.layer.id)
    gesture.current = pointers.current.size && current ? { layer: current, start: new Map(pointers.current) } : null
  }

  // --- Bake everything into a new JPEG ---
  async function save() {
    const img = imgRef.current!
    setSaving(true)
    try {
      await Promise.all(TEXT_FONTS.map((f) => document.fonts.load(f.css.replace('1.15em', '40px').replace('1em', '40px'))))
      const k = Math.min(1, MAX_EXPORT / Math.max(img.naturalWidth, img.naturalHeight))
      const W = Math.round(img.naturalWidth * k), H = Math.round(img.naturalHeight * k)
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, W, H)
      for (const l of layers) {
        ctx.save()
        ctx.translate(l.x * W, l.y * H)
        ctx.rotate((l.rotation * Math.PI) / 180)
        ctx.scale(l.scale, l.scale)
        if (l.kind === 'sticker') {
          const s = ALL_STICKERS.find((x) => x.id === l.stickerId)!
          const sImg = await loadStickerImage(s)
          const w = STICKER_WIDTH * W, h = (w * s.h) / s.w
          ctx.drawImage(sImg, -w / 2, -h / 2, w, h)
        } else {
          const size = TEXT_SIZE * W
          ctx.font = fontFor(l.font).css.replace(/[\d.]+em/, (m) => `${parseFloat(m) * size}px`)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (l.bubble) {
            const tw = ctx.measureText(l.text).width
            const padX = size * 0.5, padY = size * 0.3
            ctx.fillStyle = bubbleColor(l.color)
            ctx.beginPath()
            ctx.roundRect(-tw / 2 - padX, -size / 2 - padY, tw + padX * 2, size + padY * 2, size * 0.5)
            ctx.fill()
          } else {
            ctx.lineWidth = size * 0.12
            ctx.strokeStyle = 'rgba(0,0,0,.35)'
            ctx.strokeText(l.text, 0, 0)
          }
          ctx.fillStyle = l.color
          ctx.fillText(l.text, 0, 0)
        }
        ctx.restore()
      }
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.9))
      if (!blob) throw new Error('save failed')
      onDone(new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    } catch {
      setSaving(false)
      setError("Couldn't save the edits. Try again.")
    }
  }

  return (
    <div className="editor">
      <div className="editor-top">
        <button className="btn ghost small" onClick={onCancel} disabled={saving}>Cancel</button>
        <strong>Edit photo</strong>
        <button className="btn small" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Done'}</button>
      </div>

      <div className="editor-stage" ref={stageRef} onPointerDown={() => { setSelected(null) }}>
        <div className="editor-canvas" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          {url && <img ref={imgRef} src={url} alt="Your photo" draggable={false} style={{ maxWidth: box.w || undefined, maxHeight: box.h || undefined }} onLoad={(e) => setStageW(e.currentTarget.clientWidth)} />}
          {stageW > 0 && layers.map((l) => {
            const common = {
              key: l.id,
              className: 'layer' + (l.id === selected ? ' selected' : ''),
              style: {
                left: `${l.x * 100}%`, top: `${l.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${l.rotation}deg) scale(${l.scale})`,
              },
              onPointerDown: (e: React.PointerEvent) => onPointerDown(e, l),
            }
            if (l.kind === 'sticker') {
              const s = ALL_STICKERS.find((x) => x.id === l.stickerId)!
              return <img {...common} src={stickerUrl(s)} alt={s.label} draggable={false} style={{ ...common.style, width: STICKER_WIDTH * stageW }} />
            }
            const size = TEXT_SIZE * stageW
            return (
              <div
                {...common}
                style={{
                  ...common.style, font: fontFor(l.font).css, fontSize: `${(l.font === 'handwritten' ? 1.15 : 1) * size}px`,
                  color: l.color, whiteSpace: 'pre', lineHeight: 1,
                  ...(l.bubble
                    ? { background: bubbleColor(l.color), padding: `${size * 0.3}px ${size * 0.5}px`, borderRadius: size * 0.5 }
                    : { textShadow: '0 0 4px rgba(0,0,0,.45)' }),
                }}
              >
                {l.text}
              </div>
            )
          })}
        </div>
      </div>

      <div className="editor-tools">
        {error && <p className="error">{error}</p>}
        {layers.length === 0 && !panel && <p className="muted small hint">Add stickers or text, then drag them around. Pinch with two fingers to resize and turn.</p>}
        {sel && !panel && (
          <div className="layer-tools">
            <label>Size<input type="range" min={0.2} max={5} step={0.05} value={sel.scale} onChange={(e) => update(sel.id, { scale: +e.target.value })} /></label>
            <label>Turn<input type="range" min={-180} max={180} step={1} value={((sel.rotation + 540) % 360) - 180} onChange={(e) => update(sel.id, { rotation: +e.target.value })} /></label>
            {sel.kind === 'text' && (
              <>
                <div className="swatches">
                  {TEXT_COLORS.map((c) => (
                    <button key={c} aria-label={`Color ${c}`} className={'swatch' + (sel.color === c ? ' on' : '')} style={{ background: c }} onClick={() => update(sel.id, { color: c })} />
                  ))}
                </div>
                <div className="chips">
                  {TEXT_FONTS.map((f) => (
                    <button key={f.id} className={'chip' + (sel.font === f.id ? ' chip-on' : '')} style={{ font: f.css, fontSize: f.id === 'handwritten' ? '1.15rem' : '0.95rem' }} onClick={() => update(sel.id, { font: f.id })}>
                      {f.label}
                    </button>
                  ))}
                  <button className={'chip' + (sel.bubble ? ' chip-on' : '')} onClick={() => update(sel.id, { bubble: !sel.bubble })}>
                    {sel.bubble ? '💬 Bubble on' : '💬 Bubble off'}
                  </button>
                </div>
              </>
            )}
            <button className="link danger-link" onClick={() => { setLayers((ls) => ls.filter((l) => l.id !== sel.id)); setSelected(null) }}>
              Remove {sel.kind === 'text' ? 'text' : 'sticker'}
            </button>
          </div>
        )}

        {panel === 'stickers' && (
          <div className="sticker-panel">
            {STICKER_GROUPS.map((g) => (
              <div key={g.label}>
                <div className="muted small group-label">{g.label}</div>
                <div className="sticker-grid">
                  {g.stickers.map((s) => (
                    <button key={s.id} className="sticker-btn" aria-label={s.label} onClick={() => addSticker(s.id)}>
                      <img src={stickerUrl(s)} alt="" draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {panel === 'text' && (
          <form className="text-panel" onSubmit={(e) => { e.preventDefault(); addOrUpdateText(); setDraft('') }}>
            <input autoFocus maxLength={60} placeholder="Type something cute…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn small" disabled={!draft.trim()}>{sel?.kind === 'text' ? 'Update' : 'Add'}</button>
          </form>
        )}

        <div className="editor-tabs">
          <button className={panel === 'stickers' ? 'on' : ''} onClick={() => setPanel(panel === 'stickers' ? null : 'stickers')}>🐾 Stickers</button>
          <button className={panel === 'text' ? 'on' : ''} onClick={() => { setPanel(panel === 'text' ? null : 'text'); setDraft(sel?.kind === 'text' ? sel.text : '') }}>Aa Text</button>
        </div>
      </div>
    </div>
  )
}
