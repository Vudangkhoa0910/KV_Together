export type UserRole = 'user' | 'fundraiser' | 'admin';

export interface BaseUser {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  role: UserRole;
}

export interface RegularUser extends BaseUser {
  role: 'user';
  donation_history: {
    campaign_id: number;
    amount: number;
    date: string;
  }[];
  followed_campaigns: number[];
}

export interface Fundraiser extends BaseUser {
  role: 'fundraiser';
  fundraiser_type: 'personal' | 'organization';
  description?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  campaigns: number[];
  total_raised: number;
  bank_info?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
} 