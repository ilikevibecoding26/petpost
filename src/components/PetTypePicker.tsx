import { PET_TYPES, type PetType } from '../types'

interface Props {
  selected: PetType[]
  onToggle: (t: PetType) => void
}

export default function PetTypePicker({ selected, onToggle }: Props) {
  return (
    <div className="chips">
      {PET_TYPES.map((t) => (
        <button
          type="button"
          key={t.id}
          className={'chip' + (selected.includes(t.id) ? ' chip-on' : '')}
          onClick={() => onToggle(t.id)}
        >
          <span>{t.emoji}</span> {t.label}
        </button>
      ))}
    </div>
  )
}
