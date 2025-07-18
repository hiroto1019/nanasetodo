import React from 'react';
import { FilterType } from '../types';

interface FilterControlsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ currentFilter, onFilterChange }) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'ホーム', value: FilterType.HOME },
    { label: 'ゴミ箱', value: FilterType.TRASH },
  ];

  return (
    <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start space-x-2 sm:space-x-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-2.5 sm:px-4 text-sm font-medium rounded-md transition-colors duration-150 h-10
            ${currentFilter === filter.value 
              ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm border border-slate-200 hover:border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600 dark:hover:border-slate-500'
            }`}
          aria-pressed={currentFilter === filter.value}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterControls;