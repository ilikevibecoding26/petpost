// In-app replacement for window.confirm/alert, which some embedded browsers block.
import { useSyncExternalStore } from 'react'

interface Ask {
  message: string
  confirmLabel: string
  danger: boolean
  cancel: boolean
  resolve: (ok: boolean) => void
}

let current: Ask | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function askConfirm(message: string, confirmLabel = 'Yes', danger = false): Promise<boolean> {
  return new Promise((resolve) => {
    current = { message, confirmLabel, danger, cancel: true, resolve }
    emit()
  })
}

export function showMessage(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    current = { message, confirmLabel: 'OK', danger: false, cancel: false, resolve }
    emit()
  })
}

function close(ok: boolean) {
  current?.resolve(ok)
  current = null
  emit()
}

export default function ConfirmHost() {
  const ask = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l) } },
    () => current,
  )
  if (!ask) return null
  return (
    <div className="dialog-backdrop" onClick={() => close(false)}>
      <div className="dialog card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p>{ask.message}</p>
        <div className="row">
          {ask.cancel && <button className="btn ghost" onClick={() => close(false)}>Cancel</button>}
          <button className={'btn' + (ask.danger ? ' danger' : '')} autoFocus onClick={() => close(true)}>
            {ask.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
