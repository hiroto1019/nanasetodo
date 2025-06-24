import React from 'react';
import { SortCategory, SortDirection } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons';

interface TagWithCount {
  name: string;
  count: number;
}

interface DisplayOptionsControlsProps {
  currentSortCategory: SortCategory;
  onSortCategoryChange: (category: SortCategory) => void;
  currentSortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesChange: (show: boolean) => void;
  
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  availableTagsWithCount: TagWithCount[];
}

const DisplayOptionsControls: React.FC<DisplayOptionsControlsProps> = ({
  currentSortCategory,
  onSortCategoryChange,
  currentSortDirection,
  onSortDirectionChange,
  showOnlyFavorites,
  onShowOnlyFavoritesChange,
  selectedTags,
  onSelectedTagsChange,
  availableTagsWithCount,
}) => {
  
  const handleTagCheckboxChange = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onSelectedTagsChange(newSelectedTags);
  };

  const handleSortDirectionToggle = () => {
    onSortDirectionChange(currentSortDirection === 'ASC' ? 'DESC' : 'ASC');
  };

  const sortCategoryOptions: { label: string; value: SortCategory }[] = [
    { label: 'Creation Date', value: SortCategory.CREATED_AT },
    { label: 'Due Date', value: SortCategory.DUE_DATE },
    { label: 'Last Updated', value: SortCategory.LAST_UPDATED },
    { label: 'Task Title', value: SortCategory.TEXT },
    { label: 'Favorite', value: SortCategory.FAVORITE },
    { label: 'Tag', value: SortCategory.TAG_NAME },
  ];

  return (
    <div className="space-y-4 p-4 w-full bg-slate-50 dark:bg-slate-800 rounded-b-md"> 
      {/* Sort Options */}
      <div>
        <label htmlFor="sort-category-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort by:</label>
        <div className="flex items-center space-x-2">
          <select
            id="sort-category-select"
            value={currentSortCategory}
            onChange={(e) => onSortCategoryChange(e.target.value as SortCategory)}
            className="flex-grow p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 transition-colors"
            aria-label="Select sort category"
          >
            {sortCategoryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={handleSortDirectionToggle}
            className="p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            aria-label={`Current sort direction: ${currentSortDirection === 'ASC' ? 'Ascending' : 'Descending'}. Toggle direction.`}
            title={`Toggle sort direction (currently ${currentSortDirection === 'ASC' ? 'Ascending' : 'Descending'})`}
          >
            {currentSortDirection === 'ASC' ? <ArrowUpIcon className="text-xl text-slate-700 dark:text-slate-300" /> : <ArrowDownIcon className="text-xl text-slate-700 dark:text-slate-300" />}
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="pt-3 space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filters:</p>
        {/* Favorite Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="show-only-favorites"
            checked={showOnlyFavorites}
            onChange={(e) => onShowOnlyFavoritesChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-50 dark:ring-offset-slate-800 mr-2 cursor-pointer"
            aria-labelledby="show-only-favorites-label"
          />
          <label id="show-only-favorites-label" htmlFor="show-only-favorites" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            Show only favorites
          </label>
        </div>

        {/* Tag Filters */}
        {availableTagsWithCount.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 mt-2">By Tags:</p>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2 border border-slate-200 dark:border-slate-600 rounded-md p-2 bg-white dark:bg-slate-700/50">
              {availableTagsWithCount.map(tagItem => (
                <label key={tagItem.name} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 select-none">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tagItem.name)}
                    onChange={() => handleTagCheckboxChange(tagItem.name)}
                    className="h-3.5 w-3.5 text-blue-600 bg-white dark:bg-slate-700 border-slate-400 dark:border-slate-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-white dark:ring-offset-slate-700/50"
                  />
                  <span>{tagItem.name} <span className="text-xs text-slate-400 dark:text-slate-500">({tagItem.count})</span></span>
                </label>
              ))}
            </div>
          </div>
        )}
        {availableTagsWithCount.length === 0 && (
           <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No tags available for filtering.</p>
        )}
      </div>
    </div>
  );
};

export default DisplayOptionsControls;