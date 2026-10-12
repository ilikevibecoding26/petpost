// Cartoon pet stickers, drawn as SVG so they look the same on screen and when
// baked into the saved photo.
const INK = '#4a3f38'
const CREAM = '#fffdf9'
const PEACH = '#e8a598'
const SAGE = '#b8d4c8'
const GOLD = '#f5c96b'
const BROWN = '#d9a066'
const FONT = "'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif"

export interface Sticker {
  id: string
  label: string
  w: number
  h: number
  body: string
}

export interface StickerGroup {
  label: string
  stickers: Sticker[]
}

const bubble = (id: string, text: string, fill: string): Sticker => ({
  id,
  label: text,
  w: 160,
  h: 100,
  body: `<path fill="${fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M20 8H140Q154 8 154 22V60Q154 74 140 74H62L36 94L40 74H20Q6 74 6 60V22Q6 8 20 8Z"/>
    <text x="80" y="50" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${text.length > 7 ? 24 : 28}" fill="${INK}">${text}</text>`,
})

export const STICKER_GROUPS: StickerGroup[] = [
  {
    label: 'Paws & hearts',
    stickers: [
      {
        id: 'paw', label: 'Paw', w: 100, h: 100,
        body: `<g fill="${PEACH}" stroke="${INK}" stroke-width="5" stroke-linejoin="round">
          <path d="M50 50C35 50 23 64 24 74C25 83 34 85 41 82C46 80 54 80 59 82C66 85 75 83 76 74C77 64 65 50 50 50Z"/>
          <ellipse cx="21" cy="44" rx="9" ry="11" transform="rotate(-20 21 44)"/>
          <ellipse cx="37" cy="25" rx="9" ry="12" transform="rotate(-8 37 25)"/>
          <ellipse cx="63" cy="25" rx="9" ry="12" transform="rotate(8 63 25)"/>
          <ellipse cx="79" cy="44" rx="9" ry="11" transform="rotate(20 79 44)"/></g>`,
      },
      {
        id: 'bone', label: 'Bone', w: 100, h: 100,
        body: `<g transform="rotate(-25 50 50)">
          <g fill="${INK}"><circle cx="22" cy="40" r="15"/><circle cx="22" cy="60" r="15"/><circle cx="78" cy="40" r="15"/><circle cx="78" cy="60" r="15"/><rect x="22" y="36" width="56" height="28"/></g>
          <g fill="${CREAM}"><circle cx="22" cy="40" r="10.5"/><circle cx="22" cy="60" r="10.5"/><circle cx="78" cy="40" r="10.5"/><circle cx="78" cy="60" r="10.5"/><rect x="22" y="40.5" width="56" height="19"/></g></g>`,
      },
      {
        id: 'heart', label: 'Heart', w: 100, h: 100,
        body: `<path fill="${PEACH}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M50 86C23 68 10 54 10 35C10 23 19 14 30 14C38 14 45 19 50 26C55 19 62 14 70 14C81 14 90 23 90 35C90 54 77 68 50 86Z"/>
          <ellipse cx="29" cy="31" rx="7" ry="4.5" fill="#fff" transform="rotate(-30 29 31)"/>`,
      },
      {
        id: 'fishbone', label: 'Fish bone', w: 100, h: 100,
        body: `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          <path fill="${SAGE}" d="M8 50Q20 30 34 50Q20 70 8 50Z"/>
          <circle cx="18" cy="48" r="2.5" fill="${INK}" stroke="none"/>
          <path fill="none" d="M34 50H80"/>
          <path fill="none" d="M44 36V64M56 34V66M68 37V63"/>
          <path fill="${SAGE}" d="M80 50L94 36V64Z"/></g>`,
      },
    ],
  },
  {
    label: 'Accessories',
    stickers: [
      {
        id: 'crown', label: 'Crown', w: 100, h: 100,
        body: `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
          <path fill="${GOLD}" d="M14 76L18 28L36 50L50 20L64 50L82 28L86 76Z"/>
          <path fill="${GOLD}" d="M14 66H86V80H14Z"/></g>
          <circle cx="50" cy="73" r="4.5" fill="${PEACH}" stroke="${INK}" stroke-width="3"/>
          <circle cx="30" cy="73" r="3.5" fill="${SAGE}" stroke="${INK}" stroke-width="3"/>
          <circle cx="70" cy="73" r="3.5" fill="${SAGE}" stroke="${INK}" stroke-width="3"/>`,
      },
      {
        id: 'party-hat', label: 'Party hat', w: 100, h: 100,
        body: `<path fill="${SAGE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M50 16L78 88H22Z"/>
          <path fill="none" stroke="${PEACH}" stroke-width="6" d="M42 37L60 44M35 55L67 67M28 74L74 86"/>
          <path fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M50 16L78 88H22Z"/>
          <circle cx="50" cy="13" r="8" fill="${PEACH}" stroke="${INK}" stroke-width="4"/>`,
      },
      {
        id: 'sunglasses', label: 'Sunglasses', w: 120, h: 60,
        body: `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path fill="none" d="M52 24Q60 18 68 24"/>
          <path fill="#3d3330" d="M8 16H52V30Q52 50 30 50Q8 50 8 30Z"/>
          <path fill="#3d3330" d="M68 16H112V30Q112 50 90 50Q68 50 68 30Z"/></g>
          <path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" d="M16 24L24 22M76 24L84 22"/>`,
      },
      {
        id: 'bow-tie', label: 'Bow tie', w: 120, h: 70,
        body: `<g fill="${PEACH}" stroke="${INK}" stroke-width="5" stroke-linejoin="round">
          <path d="M60 35L12 10Q4 35 12 60Z"/><path d="M60 35L108 10Q116 35 108 60Z"/>
          <rect x="49" y="24" width="22" height="22" rx="6"/></g>
          <g fill="${CREAM}"><circle cx="26" cy="28" r="3"/><circle cx="30" cy="44" r="3"/><circle cx="94" cy="28" r="3"/><circle cx="90" cy="44" r="3"/></g>`,
      },
      {
        id: 'bandana', label: 'Bandana', w: 120, h: 90,
        body: `<path fill="${PEACH}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M6 14Q60 26 114 14L60 84Z"/>
          <g fill="${CREAM}"><circle cx="40" cy="30" r="4"/><circle cx="62" cy="34" r="4"/><circle cx="82" cy="28" r="4"/><circle cx="52" cy="52" r="4"/><circle cx="70" cy="50" r="4"/><circle cx="60" cy="68" r="3.5"/></g>`,
      },
    ],
  },
  {
    label: 'Speech bubbles',
    stickers: [
      bubble('woof', 'woof!', CREAM),
      bubble('meow', 'meow', '#f7e3dc'),
      bubble('good-boy', 'good boy', '#e3efe9'),
      bubble('zoomies', 'zoomies!', '#fbecc6'),
    ],
  },
  {
    label: 'Food & toys',
    stickers: [
      {
        id: 'ball', label: 'Ball', w: 100, h: 100,
        body: `<circle cx="50" cy="50" r="38" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>
          <path fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round" d="M22 26Q44 50 22 74M78 26Q56 50 78 74"/>
          <circle cx="50" cy="50" r="38" fill="none" stroke="${INK}" stroke-width="5"/>`,
      },
      {
        id: 'yarn', label: 'Yarn', w: 100, h: 100,
        body: `<path fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" d="M78 70Q92 84 80 92Q70 98 62 90"/>
          <circle cx="46" cy="46" r="36" fill="${PEACH}" stroke="${INK}" stroke-width="5"/>
          <path fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" d="M20 30Q46 46 34 78M30 18Q60 36 54 82M50 11Q76 32 74 70M14 50Q40 56 62 30"/>`,
      },
      {
        id: 'treat', label: 'Treat', w: 110, h: 70,
        body: `<rect x="8" y="10" width="94" height="50" rx="22" fill="${BROWN}" stroke="${INK}" stroke-width="5"/>
          <g fill="${INK}"><circle cx="32" cy="28" r="3.5"/><circle cx="55" cy="35" r="3.5"/><circle cx="78" cy="27" r="3.5"/><circle cx="40" cy="44" r="3"/><circle cx="70" cy="45" r="3"/></g>`,
      },
      {
        id: 'bowl', label: 'Food bowl', w: 110, h: 80,
        body: `<g stroke="${INK}" stroke-width="4"><circle cx="34" cy="28" r="9" fill="${BROWN}"/><circle cx="52" cy="22" r="9" fill="${BROWN}"/><circle cx="70" cy="28" r="9" fill="${BROWN}"/><circle cx="44" cy="32" r="8" fill="${BROWN}"/><circle cx="62" cy="33" r="8" fill="${BROWN}"/></g>
          <path fill="${SAGE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" d="M6 36H104L92 72H18Z"/>
          <text x="55" y="62" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="16" fill="${INK}">PET</text>`,
      },
    ],
  },
]

export const ALL_STICKERS = STICKER_GROUPS.flatMap((g) => g.stickers)

export function stickerUrl(s: Sticker) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s.w * 4}" height="${s.h * 4}" viewBox="0 0 ${s.w} ${s.h}">${s.body}</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

export function loadStickerImage(s: Sticker): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = stickerUrl(s)
  })
}
