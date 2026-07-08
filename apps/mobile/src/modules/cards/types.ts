export type CardType = 'Profile' | 'Big Game' | 'Milestone' | 'Season' | 'Highlight';

export type CardStyle = 'Classic' | 'Neon' | 'Dark Mode' | 'Gold' | 'Vintage';

export type ReleaseType = 'Private Draft' | 'Public Unlimited' | 'Limited Edition' | '1-of-1';

export type CardStatus = 'draft' | 'ready' | 'published' | 'failed';

export interface CardEditionInfo {
  type: ReleaseType;
  maxSize?: number; // undefined for Public Unlimited, 1 for 1-of-1
  issuedCount: number;
}

export interface StatmanCard {
  id: string;
  athleteId: string;
  athleteName: string;
  photoUrl?: string; // photo could be uploaded or selected
  type: CardType;
  style: CardStyle;
  status: CardStatus;
  edition: CardEditionInfo;
  originHash?: string; // Hash when published
  createdAt: string;
  updatedAt: string;
}

export interface CardBuilderState {
  athleteId?: string;
  athleteName?: string;
  photoUrl?: string;
  type?: CardType;
  style?: CardStyle;
  releaseType?: ReleaseType;
  editionSize?: number; // Only if 'Limited Edition'
}
