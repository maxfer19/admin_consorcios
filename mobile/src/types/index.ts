export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  COURT_OWNER = 'COURT_OWNER',
  PLAYER = 'PLAYER',
}

export enum PlayerLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL',
}

export enum MatchStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Hand {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export enum PreferredPosition {
  DRIVE = 'DRIVE',
  BACKHAND = 'BACKHAND',
  BOTH = 'BOTH',
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  level: PlayerLevel;
  hand: Hand;
  preferredPosition: PreferredPosition;
  bio?: string;
  city?: string;
  preferredZones: string[];
  matchesPlayed: number;
  matchesCancelled: number;
  noAckCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  profile?: Profile;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Court {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  photos: string[];
  amenities: string[];
  pricePerHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  courtId: string;
  court?: Court;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  user?: User;
  joinedAt: string;
  hasAcked: boolean;
  ackedAt?: string;
}

export interface Match {
  id: string;
  timeSlotId: string;
  timeSlot?: TimeSlot;
  organizerId: string;
  organizer?: User;
  spotsAvailable: number;
  requiredLevel?: PlayerLevel;
  status: MatchStatus;
  notes?: string;
  ackStatus: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
  players?: MatchPlayer[];
}

export interface Friendship {
  id: string;
  initiatorId: string;
  initiator?: User;
  receiverId: string;
  receiver?: User;
  isAccepted: boolean;
  createdAt: string;
  acceptedAt?: string;
}
