import { useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useDB } from '../useStore'

export default function PostDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const post = useDB().posts.find((p) => p.id === id)
  return (
    <>
      <button className="link back" onClick={() => nav(-1)}>← Back</button>
      {post ? <PostCard post={post} /> : <div className="empty card"><p>This post isn't available.</p></div>}
    </>
  )
}
