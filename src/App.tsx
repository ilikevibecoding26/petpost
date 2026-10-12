import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import ConfirmHost from './components/ConfirmHost'
import Avatar from './components/Avatar'
import { BellIcon, HomeDoodle, SearchIcon, PlusDoodle, SaveDoodle, TAB_COLORS } from './components/Icons'
import NoticePopup from './components/NoticePopup'
import Feed from './pages/Feed'
import NewPost from './pages/NewPost'
import Notifications from './pages/Notifications'
import FollowList from './pages/FollowList'
import PostDetail from './pages/PostDetail'
import PetType from './pages/PetType'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Search from './pages/Search'
import UserProfile from './pages/UserProfile'
import Welcome from './pages/Welcome'
import { useDB, useMe } from './useStore'

export default function App() {
  const { ready, notices } = useDB()
  const unseen = notices.some((n) => !n.seen)
  const me = useMe()
  if (!ready) return <main className="shell"><p className="muted" style={{ textAlign: 'center', marginTop: '30vh' }}>🐾 Loading…</p></main>
  if (!me) return <main className="shell"><Welcome /></main>

  return (
    <BrowserRouter>
      <header className="topbar">
        <Link to="/search" className="search-btn" aria-label="Search"><SearchIcon /></Link>
        <span className="logo">petpost 🐾</span>
        <Link to="/notifications" className="bell" aria-label={unseen ? 'Notifications (new)' : 'Notifications'}>
          <BellIcon />
          {unseen && <span className="dot" />}
        </Link>
      </header>
      <main className="shell">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/new" element={<NewPost />} />
          <Route path="/wags" element={<Feed saved />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/u/:username/followers" element={<FollowList which="followers" />} />
          <Route path="/u/:username/following" element={<FollowList which="following" />} />
          <Route path="/p/:id" element={<PostDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/pets/:type" element={<PetType />} />
        </Routes>
      </main>
      <nav className="tabbar">
        <NavLink to="/" end><HomeDoodle /><span>Feed</span></NavLink>
        <NavLink to="/new"><PlusDoodle /><span>Post</span></NavLink>
        <NavLink to="/wags"><SaveDoodle /><span>Wags</span></NavLink>
        <NavLink to="/me"><span className="tab-avatar" style={{ borderColor: TAB_COLORS.me }}><Avatar user={me} size={24} /></span><span>Me</span></NavLink>
      </nav>
      <ConfirmHost />
      <NoticePopup />
    </BrowserRouter>
  )
}
