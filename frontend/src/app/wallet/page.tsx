import VirtualWalletDashboard from '@/components/wallet/VirtualWalletDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ví thiện nguyện KV Credits - KV Together',
  description: 'Quản lý ví thiện nguyện Credits và ủng hộ các chiến dịch từ thiện',
};

export default function WalletPage() {
  return <VirtualWalletDashboard />;
}
