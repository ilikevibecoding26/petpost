import type { User } from '../types'
import { PawIcon } from './Icons'

export default function Avatar({ user, size = 40 }: { user?: Pick<User, 'avatarUrl' | 'petName'> | null; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt={user.petName} />
        : <PawIcon size={Math.round(size * 0.6)} />}
    </span>
  )
}
