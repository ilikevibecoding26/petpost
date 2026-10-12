export const PET_TYPES = [
  { id: 'dog', label: 'Dogs', emoji: '🐶', words: ['dog', 'puppy', 'pup', 'doggo', 'pupper'] },
  { id: 'cat', label: 'Cats', emoji: '🐱', words: ['cat', 'kitten', 'kitty'] },
  { id: 'bird', label: 'Birds', emoji: '🐦', words: ['bird', 'parrot', 'budgie', 'parakeet', 'chicken', 'duck'] },
  { id: 'fish', label: 'Fish', emoji: '🐠', words: ['fish', 'goldfish', 'betta'] },
  { id: 'reptile', label: 'Reptiles', emoji: '🦎', words: ['reptile', 'lizard', 'snake', 'turtle', 'tortoise', 'gecko'] },
  { id: 'small', label: 'Small animals', emoji: '🐹', words: ['small', 'hamster', 'bunny', 'rabbit', 'guinea pig', 'mouse', 'rat', 'ferret', 'gerbil'] },
  { id: 'horse', label: 'Horses', emoji: '🐴', words: ['horse', 'pony', 'donkey'] },
  { id: 'other', label: 'Other', emoji: '🐾', words: ['other'] },
] as const

export type PetType = (typeof PET_TYPES)[number]['id']

export interface User {
  id: string
  username: string
  petName: string
  petType: PetType
  interests: PetType[]
  avatarUrl: string | null
  isPrivate: boolean
}

export interface Post {
  id: string
  userId: string
  petType: PetType
  mediaUrl: string
  mediaPath: string
  mediaKind: 'image' | 'video'
  caption: string
  createdAt: number
}

export interface Comment {
  id: string
  postId: string
  userId: string
  text: string
  createdAt: number
}

export type ReactionKind = 'lick' | 'wag'

export interface Reaction {
  postId: string
  userId: string
  kind: ReactionKind
}

export interface Report {
  postId: string
  reporterId: string
  createdAt: number
}

export const REMOVAL_REASONS = [
  { id: 'not_a_pet', label: 'Not a pet' },
  { id: 'not_appropriate', label: 'Not appropriate' },
  { id: 'other', label: 'Other' },
] as const

export type RemovalReason = (typeof REMOVAL_REASONS)[number]['id']

export type NoticeKind = 'post_removed' | 'new_follower' | 'follow_request' | 'follow_accepted'

export interface Notice {
  id: string
  kind: NoticeKind
  actorId: string | null
  reason: RemovalReason | null
  note: string | null
  postCaption: string | null
  postCreatedAt: number | null
  thumbUrl: string | null
  seen: boolean
  createdAt: number
}

export interface Follow {
  followerId: string
  followeeId: string
  status: 'pending' | 'accepted'
}
