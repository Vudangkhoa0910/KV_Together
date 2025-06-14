interface DonorInfo {
  id: string;
  name: string;
}

interface OrganizerInfo {
  name: string;
}

interface CampaignInfo {
  id: string;
  title: string;
  organizer: OrganizerInfo;
}

export interface Donation {
  id: string;
  amount: number;
  message?: string;
  created_at: string;
  donor: DonorInfo;
  campaign: CampaignInfo;
  status: 'pending' | 'completed' | 'failed';
  is_anonymous: boolean;
  payment_method: 'momo' | 'vnpay' | 'bank_transfer';
}

export interface PaymentInfo {
  qr_url: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_id: string;
  amount: number;
  message: string;
  transaction_id?: string;
  transaction_code?: string; // Backend sometimes returns this field instead
}

export interface DonationResponse {
  donation: Donation;
  payment_info?: PaymentInfo;
  payment_url?: string;
  message: string;
  status: string;
  showCertificate: boolean;
}

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationInfo: {
    id: number;
    amount: number;
    payment_info: {
      bank_name: string;
      account_number: string;
      bank_id: string;
      qr_url: string;
    };
  };
  campaign: {
    id: number;
    title: string;
  };
}

export interface DonationCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation;
}
