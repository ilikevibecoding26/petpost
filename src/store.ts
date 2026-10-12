// Supabase-backed data layer. Components read a cached snapshot via useDB()
// and call these functions to change things; each change refreshes the cache.
import { MEDIA_BUCKET, supabase } from './supabase'
import type { Comment, Follow, Notice, PetType, Post, Reaction, ReactionKind, RemovalReason, Report, User } from './types'

interface DB {
  ready: boolean
  sessionUserId: string | null
  users: User[]
  posts: Post[]
  comments: Comment[]
  reactions: Reaction[]
  myReports: string[]
  isAdmin: boolean
  // Every report; only filled in for admins.
  reports: Report[]
  notices: Notice[]
  follows: Follow[]
}

const EMPTY: Omit<DB, 'ready'> = {
  sessionUserId: null, users: [], posts: [], comments: [], reactions: [], myReports: [], isAdmin: false, reports: [], notices: [], follows: [],
}
let db: DB = { ready: false, ...EMPTY }
const listeners = new Set<() => void>()

function set(patch: Partial<DB>) {
  db = { ...db, ...patch }
  listeners.forEach((l) => l())
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export const getDB = () => db

export const MIN_PASSWORD = 8
export const USERNAME_RULE = /^[a-zA-Z0-9_]{3,24}$/

// Supabase Auth needs an email, so each username maps to a private placeholder
// address that never receives mail.
const usernameEmail = (username: string) => `${username.toLowerCase()}@users.petpost.invalid`

const mediaUrl = (path: string) => supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function refresh() {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id ?? null
  if (!uid) return set({ ready: true, ...EMPTY })

  const [profiles, posts, reactions, comments, reports, admins, notices, follows] = await Promise.all([
    supabase.from('petpost_profiles').select('*'),
    supabase.from('petpost_posts').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('petpost_reactions').select('post_id, user_id, kind'),
    supabase.from('petpost_comments').select('*').order('created_at'),
    supabase.from('petpost_reports').select('post_id, reporter_id, created_at'),
    supabase.from('petpost_admins').select('user_id'),
    supabase.from('petpost_notifications').select('*').order('created_at', { ascending: false }),
    supabase.from('petpost_follows').select('follower_id, followee_id, status'),
  ])

  const users: User[] = (profiles.data ?? []).map((p) => ({
    id: p.id, username: p.username, petName: p.pet_name, petType: p.pet_type, interests: p.interests,
    avatarUrl: p.avatar_path ? mediaUrl(p.avatar_path) : null, isPrivate: p.is_private,
  }))
  // Signed in to the shared project but no petpost profile (e.g. a half-finished sign-up).
  if (!users.some((u) => u.id === uid)) {
    await supabase.auth.signOut()
    return set({ ready: true, ...EMPTY })
  }

  const isAdmin = (admins.data ?? []).length > 0
  set({
    ready: true,
    sessionUserId: uid,
    users,
    posts: (posts.data ?? []).map((p) => ({
      id: p.id, userId: p.user_id, petType: p.pet_type, mediaUrl: mediaUrl(p.media_path), mediaPath: p.media_path,
      mediaKind: p.media_kind, caption: p.caption, createdAt: Date.parse(p.created_at),
    })),
    reactions: (reactions.data ?? []).map((r) => ({ postId: r.post_id, userId: r.user_id, kind: r.kind })),
    comments: (comments.data ?? []).map((c) => ({
      id: c.id, postId: c.post_id, userId: c.user_id, text: c.body, createdAt: Date.parse(c.created_at),
    })),
    myReports: (reports.data ?? []).filter((r) => r.reporter_id === uid).map((r) => r.post_id),
    isAdmin: isAdmin,
    reports: isAdmin
      ? (reports.data ?? []).map((r) => ({ postId: r.post_id, reporterId: r.reporter_id, createdAt: Date.parse(r.created_at) }))
      : [],
    notices: (notices.data ?? []).map((n) => ({
      id: n.id, kind: n.kind, actorId: n.actor_id, reason: n.reason, note: n.note, postCaption: n.post_caption,
      postCreatedAt: n.post_created_at ? Date.parse(n.post_created_at) : null,
      thumbUrl: n.thumb_path ? mediaUrl(n.thumb_path) : null, seen: n.seen, createdAt: Date.parse(n.created_at),
    })),
    follows: (follows.data ?? []).map((f) => ({ followerId: f.follower_id, followeeId: f.followee_id, status: f.status })),
  })
}

export async function usernameTaken(username: string) {
  const { data, error } = await supabase.rpc('petpost_username_available', { name: username })
  fail(error)
  return data === false
}

export async function signUp(input: Omit<User, 'id' | 'avatarUrl' | 'isPrivate'>, password: string, avatar?: File | null) {
  if (!USERNAME_RULE.test(input.username)) throw new Error('Usernames are 3–24 letters, numbers, or _.')
  if (password.length < MIN_PASSWORD) throw new Error(`Password needs at least ${MIN_PASSWORD} characters.`)
  if (await usernameTaken(input.username)) throw new Error('That username is taken. Try another.')

  const { data, error } = await supabase.auth.signUp({ email: usernameEmail(input.username), password })
  if (error) throw new Error(error.message.includes('registered') ? 'That username is taken. Try another.' : error.message)
  if (!data.session) throw new Error('Sign-up needs "Confirm email" turned off in Supabase.')

  const { error: profileError } = await supabase.from('petpost_profiles').insert({
    id: data.session.user.id, username: input.username, pet_name: input.petName,
    pet_type: input.petType, interests: input.interests,
  })
  if (profileError) {
    await supabase.auth.signOut()
    throw new Error(profileError.code === '23505' ? 'That username is taken. Try another.' : profileError.message)
  }
  await refresh()
  // The account exists at this point, so a failed photo upload shouldn't block sign-up.
  if (avatar) await setAvatar(avatar).catch(() => {})
}

export async function logIn(username: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: usernameEmail(username), password })
  if (error) return false
  await refresh()
  return db.sessionUserId !== null
}

export async function logOut() {
  await supabase.auth.signOut()
  await refresh()
}

export async function updateInterests(interests: PetType[]) {
  fail((await supabase.from('petpost_profiles').update({ interests }).eq('id', db.sessionUserId!)).error)
  await refresh()
}

export async function createPost(file: File, caption: string, petType: PetType) {
  const uid = db.sessionUserId!
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${uid}/${crypto.randomUUID()}.${ext}`
  fail((await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type })).error)
  const { error } = await supabase.from('petpost_posts').insert({
    user_id: uid, pet_type: petType, media_path: path,
    media_kind: file.type.startsWith('video/') ? 'video' : 'image', caption,
  })
  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path])
    throw new Error(error.message)
  }
  await refresh()
}

export async function deletePost(post: Post) {
  fail((await supabase.from('petpost_posts').delete().eq('id', post.id)).error)
  await supabase.storage.from(MEDIA_BUCKET).remove([post.mediaPath])
  await refresh()
}

// Admin removal: saves a small thumbnail, then deletes the post and notifies its owner.
export async function adminRemovePost(post: Post, reason: RemovalReason, note: string) {
  let thumbPath: string | null = null
  if (post.userId !== db.sessionUserId) {
    try {
      const path = `notices/${post.userId}/${crypto.randomUUID()}.jpg`
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, await postThumbnail(post), { contentType: 'image/jpeg' })
      if (!error) thumbPath = path
    } catch { /* No thumbnail is fine; the notice still shows the caption and reason. */ }
  }
  const { error } = await supabase.rpc('petpost_admin_remove_post', {
    p_post_id: post.id, p_reason: reason, p_note: note, p_thumb_path: thumbPath,
  })
  if (error) {
    if (thumbPath) await supabase.storage.from(MEDIA_BUCKET).remove([thumbPath])
    throw new Error(error.message)
  }
  await supabase.storage.from(MEDIA_BUCKET).remove([post.mediaPath])
  await refresh()
}

// --- Following ---
export function followStatus(followerId: string | null, followeeId: string | null) {
  return db.follows.find((f) => f.followerId === followerId && f.followeeId === followeeId)?.status ?? null
}

export function canSee(user: User) {
  return !user.isPrivate || user.id === db.sessionUserId || db.isAdmin || followStatus(db.sessionUserId, user.id) === 'accepted'
}

export async function follow(userId: string) {
  fail((await supabase.from('petpost_follows').insert({ follower_id: db.sessionUserId!, followee_id: userId })).error)
  await refresh()
}

export async function unfollow(userId: string) {
  fail((await supabase.from('petpost_follows').delete().match({ follower_id: db.sessionUserId!, followee_id: userId })).error)
  await refresh()
}

export async function approveFollower(userId: string) {
  fail((await supabase.from('petpost_follows').update({ status: 'accepted' }).match({ follower_id: userId, followee_id: db.sessionUserId! })).error)
  await refresh()
}

// Declines a request, or removes someone who already follows you.
export async function removeFollower(userId: string) {
  fail((await supabase.from('petpost_follows').delete().match({ follower_id: userId, followee_id: db.sessionUserId! })).error)
  await refresh()
}

export async function setPrivate(isPrivate: boolean) {
  fail((await supabase.from('petpost_profiles').update({ is_private: isPrivate }).eq('id', db.sessionUserId!)).error)
  await refresh()
}

export async function markNoticesSeen(ids: string[]) {
  if (ids.length === 0) return
  set({ notices: db.notices.map((n) => (ids.includes(n.id) ? { ...n, seen: true } : n)) })
  await supabase.from('petpost_notifications').update({ seen: true }).in('id', ids)
}

export async function dismissReports(postId: string) {
  fail((await supabase.from('petpost_reports').delete().eq('post_id', postId)).error)
  await refresh()
}

// Center-crops to a square and shrinks it so pet photos and thumbnails stay small.
function squareJpeg(src: CanvasImageSource, width: number, height: number, size = 400): Promise<Blob> {
  const side = Math.min(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  canvas.getContext('2d')!.drawImage(src, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read that photo.'))), 'image/jpeg', 0.85))
}

async function fileToSquareJpeg(file: Blob, size = 400) {
  const img = await createImageBitmap(file)
  return squareJpeg(img, img.width, img.height, size)
}

// Grabs a frame from a video so it can be drawn like a picture.
function videoFrame(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video')
    v.crossOrigin = 'anonymous'
    v.muted = true
    v.preload = 'auto'
    v.onloadeddata = () => { v.currentTime = Math.min(1, v.duration / 2) }
    v.onseeked = () => resolve(v)
    v.onerror = () => reject(new Error('Could not load video'))
    v.src = url
  })
}

async function postThumbnail(post: Post): Promise<Blob> {
  if (post.mediaKind === 'video') {
    const v = await videoFrame(post.mediaUrl)
    return squareJpeg(v, v.videoWidth, v.videoHeight, 200)
  }
  const blob = await (await fetch(post.mediaUrl)).blob()
  return fileToSquareJpeg(blob, 200)
}

export async function setAvatar(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Pet photos have to be pictures.')
  const uid = db.sessionUserId!
  const { data: old } = await supabase.from('petpost_profiles').select('avatar_path').eq('id', uid).single()
  const path = `${uid}/avatar-${crypto.randomUUID()}.jpg`
  fail((await supabase.storage.from(MEDIA_BUCKET).upload(path, await fileToSquareJpeg(file), { contentType: 'image/jpeg' })).error)
  fail((await supabase.from('petpost_profiles').update({ avatar_path: path }).eq('id', uid)).error)
  if (old?.avatar_path) await supabase.storage.from(MEDIA_BUCKET).remove([old.avatar_path])
  await refresh()
}

export async function toggleReaction(postId: string, kind: ReactionKind) {
  const uid = db.sessionUserId!
  const has = db.reactions.some((r) => r.postId === postId && r.userId === uid && r.kind === kind)
  // Update the screen right away, then sync with the server.
  set({
    reactions: has
      ? db.reactions.filter((r) => !(r.postId === postId && r.userId === uid && r.kind === kind))
      : [...db.reactions, { postId, userId: uid, kind }],
  })
  const q = supabase.from('petpost_reactions')
  await (has
    ? q.delete().match({ post_id: postId, user_id: uid, kind })
    : q.insert({ post_id: postId, user_id: uid, kind }))
  await refresh()
}

export async function addComment(postId: string, text: string) {
  if (!text.trim()) return
  fail((await supabase.from('petpost_comments').insert({ post_id: postId, user_id: db.sessionUserId!, body: text.trim() })).error)
  await refresh()
}

export async function reportPost(postId: string) {
  fail((await supabase.from('petpost_reports').insert({ post_id: postId, reporter_id: db.sessionUserId! })).error)
  await refresh()
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') set({ sessionUserId: null })
})
refresh()
