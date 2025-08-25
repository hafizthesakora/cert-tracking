// Location: src/components/StatusBadge.tsx
import { Status } from '@prisma/client';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

const statusConfig = {
  ACTIVE: {
    text: 'Active',
    color: 'bg-green-100 text-green-800',
    Icon: CheckCircle,
  },
  EXPIRES_SOON: {
    text: 'Expires Soon',
    color: 'bg-yellow-100 text-yellow-800',
    Icon: Clock,
  },
  EXPIRED: {
    text: 'Expired',
    color: 'bg-red-100 text-red-800',
    Icon: AlertTriangle,
  },
  RENEWAL_REQUESTED: {
    text: 'Requested',
    color: 'bg-blue-100 text-blue-800',
    Icon: FileText,
  },
  INITIATED: {
    text: 'Initiated',
    color: 'bg-indigo-100 text-indigo-800',
    Icon: ArrowRight,
  },
  POSTPONED: {
    text: 'Postponed',
    color: 'bg-gray-100 text-gray-800',
    Icon: XCircle,
  },
};

const StatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig.POSTPONED;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <config.Icon className="-ml-0.5 mr-1.5 h-4 w-4" />
      {config.text}
    </span>
  );
};

export default StatusBadge;
