import { useState } from 'react'
import PetTypePicker from '../components/PetTypePicker'
import PhotoPicker from '../components/PhotoPicker'
import { logIn, MIN_PASSWORD, signUp, USERNAME_RULE, usernameTaken } from '../store'
import type { PetType } from '../types'

export default function Welcome() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [petName, setPetName] = useState('')
  const [petType, setPetType] = useState<PetType | null>(null)
  const [interests, setInterests] = useState<PetType[]>([])
  const [error, setError] = useState('')

  async function join(withPhoto: File | null) {
    setBusy(true)
    try {
      await signUp({ username: username.trim(), petName: petName.trim(), petType: petType!, interests }, password, withPhoto)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (mode === 'login') {
    return (
      <div className="welcome card">
        <h1 className="logo">petpost 🐾</h1>
        <p className="muted">Welcome back!</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            const ok = await logIn(username.trim(), password)
            setBusy(false)
            if (!ok) setError('Wrong username or password.')
          }}
        >
          <input placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 10 }} />
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={!username.trim() || !password || busy}>Log in</button>
        </form>
        <button className="link" onClick={() => { setMode('signup'); setError(''); setPassword('') }}>New here? Create an account</button>
      </div>
    )
  }

  return (
    <div className="welcome card">
      <h1 className="logo">petpost 🐾</h1>
      <p className="muted">Only pets. Only cuteness.</p>
      <p className="step">Step {step} of 4</p>

      {step === 1 && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!USERNAME_RULE.test(username.trim())) return setError('Usernames are 3–24 letters, numbers, or _.')
            if (password.length < MIN_PASSWORD) return setError(`Password needs at least ${MIN_PASSWORD} characters.`)
            if (password !== confirm) return setError("Passwords don't match.")
            setBusy(true)
            const taken = await usernameTaken(username.trim()).catch(() => false)
            setBusy(false)
            if (taken) return setError('That username is taken. Try another.')
            setError('')
            setStep(2)
          }}
        >
          <label>Your username</label>
          <input placeholder="e.g. alex_and_biscuit" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label>Password</label>
          <input type="password" placeholder={`At least ${MIN_PASSWORD} characters`} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label>Confirm password</label>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <label>Your pet's name</label>
          <input placeholder="e.g. Biscuit" value={petName} onChange={(e) => setPetName(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={!username.trim() || !password || !confirm || !petName.trim() || busy}>Next</button>
        </form>
      )}

      {step === 2 && (
        <>
          <label>What kind of pet is {petName}?</label>
          <PetTypePicker selected={petType ? [petType] : []} onToggle={setPetType} />
          <div className="row">
            <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn" disabled={!petType} onClick={() => setStep(3)}>Next</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <label>What animals do you want to see? (pick any)</label>
          <PetTypePicker
            selected={interests}
            onToggle={(t) => setInterests((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
          />
          <div className="row">
            <button className="btn ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn" disabled={interests.length === 0} onClick={() => setStep(4)}>Next</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <label style={{ textAlign: "center" }}>Add a photo of {petName}</label>
          <p className="muted small" style={{ marginTop: 0 }}>You can always add or change it later on your profile.</p>
          <div className="photo-step"><PhotoPicker file={photo} onPick={setPhoto} size={120} /></div>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="btn ghost" disabled={busy} onClick={() => setStep(3)}>Back</button>
            <button className="btn" disabled={busy} onClick={() => join(photo)}>
              {busy ? 'Joining…' : photo ? 'Join petpost' : 'Skip and join'}
            </button>
          </div>
        </>
      )}

      <button className="link" onClick={() => { setMode('login'); setError(''); setPassword('') }}>Already have an account? Log in</button>
    </div>
  )
}
