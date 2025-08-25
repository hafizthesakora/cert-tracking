import { ReactNode } from 'react';

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
};

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
};

export default function StatCard({ title, value, icon, color }: Props) {
  return (
    <div className="card flex items-center p-4">
      <div
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
