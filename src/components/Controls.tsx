import React from 'react';

interface ControlsProps {
  timeframe: string;
  sortBy: string;
  timeframes: Record<string, string>;
  onTimeframeChange: (value: string) => void;
  onSortByChange: (value: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  timeframe,
  sortBy,
  timeframes,
  onTimeframeChange,
  onSortByChange,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <select
        value={timeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
        className="bg-gray-800 text-white p-2 rounded"
      >
        {Object.entries(timeframes).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="bg-gray-800 text-white p-2 rounded"
      >
        <option value="time">حسب الوقت</option>
        <option value="price">حسب السعر</option>
        <option value="wick">حسب طول الذيل</option>
      </select>
    </div>
  );
};