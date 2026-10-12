import { useParams } from 'react-router-dom'
import PostGrid from '../components/PostGrid'
import { PET_TYPES } from '../types'
import { useDB } from '../useStore'

export default function PetType() {
  const { type } = useParams()
  const db = useDB()
  const pet = PET_TYPES.find((t) => t.id === type)
  if (!pet) return <div className="empty card"><p>That pet type doesn't exist.</p></div>
  // Private accounts' posts are already filtered out by the server unless you follow them.
  const posts = db.posts.filter((p) => p.petType === pet.id)
  return (
    <>
      <h2 className="page-title">{pet.emoji} {pet.label}</h2>
      <PostGrid posts={posts} />
    </>
  )
}
