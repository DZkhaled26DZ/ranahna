import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Signal } from '../types';

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
      <h3 className="text-xl font-bold mb-2">{signal.pair}</h3>
      <p className="mb-2">السعر: {signal.price}</p>
      <p>
        الوقت:{' '}
        {formatInTimeZone(
          new Date(signal.time),
          'Africa/Algiers',
          'HH:mm:ss dd/MM/yyyy'
        )}
      </p>
    </div>
  );
};