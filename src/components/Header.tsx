import React from 'react';
import { Sun, Moon, RefreshCw } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  loading: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  loading,
  onToggleDarkMode,
  onRefresh,
}) => {
  return (
    <header className="p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">محلل العملات الرقمية</h1>
        <div className="flex gap-4">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-700"
            aria-label={darkMode ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع المظلم'}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={onRefresh}
            className={`p-2 rounded-full hover:bg-gray-700 ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
            aria-label="تحديث البيانات"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};