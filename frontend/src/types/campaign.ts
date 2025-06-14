export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Donation {
  id: number;
  amount: number;
  message: string;
  created_at: string;
  donor: User;
}

export interface Update {
  id: number;
  content: string;
  image?: string;
  created_at: string;
}

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  image_url?: string;
  images_url?: string[];
  status: 'pending' | 'active' | 'completed' | 'rejected';
  progress_percentage: number;
  days_remaining: number;
  organizer: User;
  categories: Category[];
  donations?: Donation[];
  updates?: Update[];
  donations_count: number;
}
