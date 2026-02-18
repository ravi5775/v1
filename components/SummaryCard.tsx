
import React from 'react';
import { LucideProps } from 'lucide-react';

interface SummaryCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  value: string | number;
  isCurrency?: boolean;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, title, value, isCurrency = false, color = 'text-gray-800' }) => {
  const formattedValue = typeof value === 'number'
    ? isCurrency
      ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`
      : value.toLocaleString('en-IN')
    : value;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-start gap-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>
          {formattedValue}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
