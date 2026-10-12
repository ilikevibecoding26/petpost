import { useEffect, useRef, useState } from 'react'

const MAX_VIDEO_SECONDS = 15

type Mode = 'photo' | 'video'
type Facing = 'user' | 'environment'

// First recording format this browser supports (Safari records mp4, Chrome/Firefox webm).
function pickVideoType() {
  const options = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  return options.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? ''
}

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function Camera({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const [mode, setMode] = useState<Mode>('photo')
  const [facing, setFacing] = useState<Facing>('environment')
  const [canFlip, setCanFlip] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState<{ file: File; url: string } | null>(null)

  // (Re)start the camera whenever the mode or camera direction changes, unless reviewing a capture.
  useEffect(() => {
    if (result) return
    let cancelled = false
    setError('')
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: facing }, audio: mode === 'video' })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        navigator.mediaDevices.enumerateDevices().then((d) => setCanFlip(d.filter((x) => x.kind === 'videoinput').length > 1))
      })
      .catch((err: Error) => {
        setError(err.name === 'NotAllowedError'
          ? 'petpost needs permission to use your camera. Allow it in your browser settings and try again.'
          : "Couldn't open the camera. Try choosing a photo from your files instead.")
      })
    if (!navigator.mediaDevices) setError("This browser can't open the camera. Try choosing a photo from your files instead.")
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [mode, facing, result])

  // Count up while recording and stop automatically at the limit.
  useEffect(() => {
    if (!recording) return
    const started = Date.now()
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000)
      setSeconds(s)
      if (s >= MAX_VIDEO_SECONDS) recorderRef.current?.stop()
    }, 200)
    return () => clearInterval(timer)
  }, [recording])

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])

  function takePhoto() {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext('2d')!
    // Save selfies the way they looked on screen (mirrored).
    if (facing === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(v, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setResult({ file, url: URL.createObjectURL(file) })
    }, 'image/jpeg', 0.9)
  }

  function startRecording() {
    const stream = streamRef.current
    if (!stream) return
    const type = pickVideoType()
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    recorder.onstop = () => {
      setRecording(false)
      const mime = (recorder.mimeType || type || 'video/webm').split(';')[0]
      const ext = mime.includes('mp4') ? 'mp4' : 'webm'
      const file = new File(chunks, `camera-${Date.now()}.${ext}`, { type: mime })
      setResult({ file, url: URL.createObjectURL(file) })
    }
    recorderRef.current = recorder
    recorder.start()
    setSeconds(0)
    setRecording(true)
  }

  function shutter() {
    if (mode === 'photo') takePhoto()
    else if (recording) recorderRef.current?.stop()
    else startRecording()
  }

  return (
    <div className="camera">
      <button className="camera-close" aria-label="Close camera" disabled={recording} onClick={onClose}>✕</button>

      {result ? (
        <>
          <div className="camera-view">
            {result.file.type.startsWith('video/')
              ? <video src={result.url} autoPlay loop playsInline controls />
              : <img src={result.url} alt="What you took" />}
          </div>
          <div className="camera-controls review">
            <button className="btn ghost" onClick={() => setResult(null)}>Retake</button>
            <button className="btn" onClick={() => onCapture(result.file)}>Use it</button>
          </div>
        </>
      ) : (
        <>
          <div className="camera-view">
            {error
              ? <p className="camera-error">{error}</p>
              : <video ref={videoRef} autoPlay playsInline muted className={facing === 'user' ? 'mirror' : ''} />}
            {recording && <div className="rec-timer">● {seconds}s / {MAX_VIDEO_SECONDS}s</div>}
          </div>
          <div className="camera-controls">
            <div className="mode-toggle" role="tablist">
              {(['photo', 'video'] as const).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} disabled={recording} onClick={() => setMode(m)}>
                  {m === 'photo' ? 'Photo' : 'Video'}
                </button>
              ))}
            </div>
            <div className="shutter-row">
              <span className="shutter-side" />
              <button
                className={'shutter' + (mode === 'video' ? ' video' : '') + (recording ? ' recording' : '')}
                aria-label={mode === 'photo' ? 'Take photo' : recording ? 'Stop recording' : 'Start recording'}
                disabled={!!error}
                onClick={shutter}
              >
                <span />
              </button>
              <span className="shutter-side">
                {canFlip && (
                  <button className="flip" aria-label="Flip camera" disabled={recording} onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}>
                    ⟲
                  </button>
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
