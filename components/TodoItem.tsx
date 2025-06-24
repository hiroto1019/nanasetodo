import React from 'react';
import { Todo } from '../types';
import { EditIcon, DeleteIcon, RestoreIcon as ActualRestoreIcon, StarIcon } from './icons';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onRestore?: (id: string) => void;
  isTrashView?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggleComplete, 
  onToggleFavorite, 
  onDelete, 
  onEdit, 
  onRestore, 
  isTrashView = false 
}) => {
  const handleCheckboxChange = () => {
    if (!isTrashView && !todo.deleted) {
        onToggleComplete(todo.id);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!isTrashView && !todo.deleted) {
      onToggleFavorite(todo.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString + 'T00:00:00Z'); 
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const itemBaseStyle = "relative bg-slate-50 dark:bg-slate-800 p-3 my-1.5 rounded-lg shadow hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow duration-200";
  const deletedStyle = todo.deleted ? "opacity-60 bg-gray-100 dark:bg-slate-800/70 dark:opacity-50" : "";
  const completedStyle = todo.completed && !todo.deleted ? "opacity-75" : "";

  return (
    <li className={`${itemBaseStyle} ${deletedStyle} ${completedStyle}`}>
      <div className="flex items-start">
        {/* ▼▼▼ UI修正ゾーン ▼▼▼ */}
        <div className="flex-grow mr-10">
          <div className="flex items-center"> {/* mb-1を削除 */}
            <button
              onClick={handleFavoriteToggle}
              className={`p-1 mr-1.5 text-slate-400 dark:text-slate-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors rounded-full 
                         ${(todo.deleted || isTrashView) ? 'cursor-not-allowed opacity-50' : ''}`}
              aria-label={todo.isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={todo.isFavorite ? "Remove from favorites" : "Add to favorites"}
              disabled={todo.deleted || isTrashView}
            >
              <StarIcon 
                className={`text-lg ${(todo.isFavorite && !todo.deleted) ? 'text-yellow-400 dark:text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} 
                filled={todo.isFavorite && !todo.deleted} 
              />
            </button>
            <input
              type="checkbox"
              id={`todo-check-${todo.id}`}
              checked={todo.completed && !todo.deleted}
              onChange={handleCheckboxChange}
              className={`h-5 w-5 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-50 dark:ring-offset-slate-800 bg-white dark:bg-slate-700 mr-3 flex-shrink-0 
                ${(todo.deleted || isTrashView) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              aria-labelledby={`todo-text-${todo.id}`}
              disabled={todo.deleted || isTrashView}
            />
            {/* タイトルと詳細をまとめるdivを追加 */}
            <div className="flex flex-col"> 
              <label
                htmlFor={`todo-check-${todo.id}`} 
                id={`todo-text-${todo.id}`}
                className={`text-md font-medium cursor-pointer ${todo.completed && !todo.deleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'} ${todo.deleted ? 'text-slate-500 dark:text-slate-400 line-through' : ''}`}
              >
                {todo.text}
              </label>
              {todo.details && (
                // ml-12を削除し、マージンを調整
                <p className={`text-xs whitespace-pre-wrap ${todo.completed && !todo.deleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'} ${todo.deleted ? 'text-slate-500 dark:text-slate-400' : ''}`}>
                  {todo.details}
                </p>
              )}
            </div>
          </div>
          
          {/* 黄色い部分のコンテナ */}
          <div className="ml-12 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"> {/* items-centerを追加して縦方向を中央揃え */}
            {todo.dueDate && (
              <span className={`px-1.5 py-0.5 rounded-full ${todo.completed && !todo.deleted ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300'} ${todo.deleted ? 'bg-gray-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500' : ''}`}>
                Due: {formatDate(todo.dueDate)}
              </span>
            )}
            {todo.tag && (
               <span className={`px-1.5 py-0.5 rounded-full ${todo.completed && !todo.deleted ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300'} ${todo.deleted ? 'bg-gray-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500' : ''}`}>
                #{todo.tag}
              </span>
            )}
             {todo.updatedAt && (
                <span className={`text-slate-400 dark:text-slate-500 text-[10px] italic ${todo.deleted ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                    Updated: {new Date(todo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
            )}
          </div>
        </div>
        {/* ▲▲▲ UI修正ゾーン ▲▲▲ */}

        <div className="absolute top-2 right-2 flex items-center space-x-1">
          {isTrashView && onRestore && (
             <button
              onClick={() => onRestore(todo.id)}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-full hover:bg-green-100 dark:hover:bg-green-700/30"
              aria-label={`Restore task: ${todo.text}`}
              title="Restore task"
            >
              <ActualRestoreIcon className="text-md" />
            </button>
          )}
          {!isTrashView && !todo.deleted && (
            <button
              onClick={() => onEdit(todo)}
              className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-blue-100 dark:hover:bg-blue-700/30"
              aria-label={`Edit task: ${todo.text}`}
              title="Edit task"
            >
              <EditIcon className="text-md" />
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className={`p-1.5 transition-colors rounded-full 
              ${isTrashView ? 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/30' : 'text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30'}`}
            aria-label={isTrashView ? `Permanently delete task: ${todo.text}` : `Move task to trash: ${todo.text}`}
            title={isTrashView ? `Permanently delete task` : `Move task to trash`}
          >
            <DeleteIcon className="text-md" />
          </button>
        </div>
      </div>
      {isTrashView && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1 pl-12">In trash</p>
      )}
    </li>
  );
};

export default TodoItem;