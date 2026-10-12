// Cartoon-style reaction icons. When `on` is false they're filled with the card
// color; when true they get their color. Outlines follow the text color so they
// work in light and dark mode.
const INK = 'currentColor'
const CARD = 'var(--card)'

interface IconProps { on?: boolean; size?: number }

export function LickIcon({ on = false, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" aria-hidden="true">
      <path style={{ fill: on ? '#e8a598' : CARD }} d="M24 40C11 31 5 24 5 16C5 10 9.5 6 14.5 6C18.5 6 22 8.5 24 12C26 8.5 29.5 6 33.5 6C38.5 6 43 10 43 16C43 24 37 31 24 40Z" />
      {on && <ellipse cx="14" cy="14" rx="3.5" ry="2.2" fill="#fff" stroke="none" transform="rotate(-30 14 14)" />}
    </svg>
  )
}

export function WagIcon({ on = false, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" aria-hidden="true">
      <path style={{ fill: on ? '#b8d4c8' : CARD }} d="M13 6H35V42L24 33L13 42Z" />
      <g fill={INK} stroke="none">
        <ellipse cx="24" cy="21" rx="4" ry="3.3" />
        <circle cx="18.5" cy="15.5" r="1.8" />
        <circle cx="22" cy="12.5" r="1.8" />
        <circle cx="26" cy="12.5" r="1.8" />
        <circle cx="29.5" cy="15.5" r="1.8" />
      </g>
    </svg>
  )
}

export function BarkIcon({ on = false, size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" aria-hidden="true">
      <path style={{ fill: on ? 'var(--accent-soft)' : CARD }} d="M8 8H40Q43 8 43 11V29Q43 32 40 32H20L11 40V32H8Q5 32 5 29V11Q5 8 8 8Z" />
      <text x="24" y="24" textAnchor="middle" fontSize="10" fontWeight="800" fill={INK} stroke="none" fontFamily="Nunito, sans-serif">woof</text>
    </svg>
  )
}

export function PawIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" aria-hidden="true">
      <path fill="#e8a598" d="M24 24C17 24 11 31 11.5 36C12 40.5 16.5 41.5 20 40C22.5 39 25.5 39 28 40C31.5 41.5 36 40.5 36.5 36C37 31 31 24 24 24Z" />
      <ellipse fill="#e8a598" cx="10" cy="21" rx="4.5" ry="5.5" transform="rotate(-20 10 21)" />
      <ellipse fill="#e8a598" cx="18" cy="12" rx="4.5" ry="6" transform="rotate(-8 18 12)" />
      <ellipse fill="#e8a598" cx="30" cy="12" rx="4.5" ry="6" transform="rotate(8 30 12)" />
      <ellipse fill="#e8a598" cx="38" cy="21" rx="4.5" ry="5.5" transform="rotate(20 38 21)" />
    </svg>
  )
}

export function BellIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path style={{ fill: CARD }} d="M24 7C16.5 7 12 12.5 12 20V28L8 34H40L36 28V20C36 12.5 31.5 7 24 7Z" />
      <path fill="#e8a598" d="M19 34C19 37.5 21 40 24 40C27 40 29 37.5 29 34" />
      <path fill="none" d="M24 4V7" />
    </svg>
  )
}

// Hand-drawn doodle icons for the bottom tabs. A second, offset stroke gives the sketchy look.
interface TabIconProps { size?: number }
const line = (stroke: string) => ({ fill: 'none', stroke, strokeWidth: 2.8, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const
// "Candy" colors: an outline color and a soft fill for each tab.
export const TAB_COLORS = {
  feed: { line: '#e8467c', fill: '#ffb3c7' },
  post: { line: '#8a5cf5', fill: '#d6c4ff' },
  wags: { line: '#14a37f', fill: '#a8f0d8' },
  me: '#ff8a3d',
}

export function HomeDoodle({ size = 32 }: TabIconProps) {
  const doodle = line(TAB_COLORS.feed.line)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 23L24.5 12.5L36.5 23.5L36 40L12.5 39.6Z" fill={TAB_COLORS.feed.fill} />
      <path {...doodle} d="M6.5 24.5L24.3 8.6C27 11 37 19.6 41.6 24" />
      <path {...doodle} d="M11.6 21.2C11.2 27 11.8 34 11.4 40.3C19 40.8 29 40.2 36.8 40.5C36.4 34 37 27.5 36.5 21.4" />
      <path {...doodle} d="M20.4 40.2C20.2 36 20 32.4 20.6 30.6C22.6 30 25.6 30.2 27.4 30.8C27.8 33.6 27.6 37.4 27.8 40.4" />
      <path {...doodle} strokeWidth={1.8} opacity=".45" d="M8 23.6L24.8 9.8L40 23.2" />
      <path {...doodle} d="M31.6 13.6L31.8 8.4L35.6 8.6L35.4 17" />
    </svg>
  )
}

export function PlusDoodle({ size = 32 }: TabIconProps) {
  const doodle = line(TAB_COLORS.post.line)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="17" fill={TAB_COLORS.post.fill} />
      <path {...doodle} d="M24.4 8.2C23.8 16 24.6 31 23.8 39.8" />
      <path {...doodle} d="M8.4 23.6C16 24.4 31 23.4 39.6 24.2" />
      <path {...doodle} strokeWidth={1.8} opacity=".45" d="M25.6 9.6C25 18 25.6 30 25.2 38.4M9.8 25.2C18 25.6 30 24.8 38.2 25.6" />
      <path {...doodle} d="M24.2 4.8C35 4.2 43.8 12.8 43.4 24.2C43 35.2 34.6 43.6 23.6 43.2C12.6 42.8 4.6 34.4 4.8 23.6C5 13.4 12.8 5.4 22.4 5.2" />
    </svg>
  )
}

export function SaveDoodle({ size = 32 }: TabIconProps) {
  const doodle = line(TAB_COLORS.wags.line)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M13 7H35V41L24 32L13 41Z" fill={TAB_COLORS.wags.fill} />
      <path {...doodle} d="M12.8 6.6C20 6.2 28 6.8 35.4 6.2C35 17 35.8 30 35.2 41.6C31.4 38.4 27.6 35.2 24.2 32.4C20.4 35.4 16.6 38.6 12.6 41.8C12.4 30 13.2 18 12.8 6.6Z" />
      <path {...doodle} strokeWidth={1.8} opacity=".45" d="M14.4 8.2C21 7.8 28 8.4 33.8 7.8" />
      <g fill={TAB_COLORS.wags.line}>
        <ellipse cx="24" cy="21.5" rx="3.6" ry="3" />
        <circle cx="19.2" cy="16.6" r="1.6" /><circle cx="22.4" cy="14" r="1.6" /><circle cx="25.8" cy="14" r="1.6" /><circle cx="28.9" cy="16.6" r="1.6" />
      </g>
    </svg>
  )
}

export function SearchIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path fill="#e8a598" d="M30 31L41 42Q43 44 41 46Q39 47.5 37.5 46L27 35Z" />
      <circle cx="20" cy="20" r="14" style={{ fill: CARD }} />
      <path fill="none" d="M12 17Q14 11 20 10.5" />
    </svg>
  )
}
