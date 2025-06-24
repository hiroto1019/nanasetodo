import React, { useState, useEffect } from 'react';
import { Todo, TodoFormData } from '../types';
import { PlusIcon, CalendarIcon } from './icons';

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void;
  initialData?: Todo | null;
  onCancel?: () => void; // Made mandatory for consistency in modals
  isEditing?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, initialData, onCancel, isEditing = false }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tag, setTag] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (initialData && isEditing) {
      setText(initialData.text);
      setDueDate(initialData.dueDate || '');
      setTag(initialData.tag || '');
      setDetails(initialData.details || '');
    } else {
      // Reset form for adding new or if initialData is cleared
      setText('');
      setDueDate('');
      setTag('');
      setDetails('');
    }
  }, [initialData, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Task text cannot be empty.'); 
      return;
    }
    onSubmit({
      text: text.trim(),
      dueDate: dueDate || null,
      tag: tag.trim(),
      details: details.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`todo-text-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Task Description
        </label>
        <input
          id={`todo-text-${isEditing ? 'edit' : 'add'}`}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`todo-duedate-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Due Date (Optional)
          </label>
          <div className="relative">
            <input
              id={`todo-duedate-${isEditing ? 'edit' : 'add'}`}
              type="date"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]} 
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 pr-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CalendarIcon className="w-5 h-5 text-slate-400 dark:text-white" />
            </span>
          </div>
        </div>
        <div>
          <label htmlFor={`todo-tag-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tag (Optional)
          </label>
          <input
            id={`todo-tag-${isEditing ? 'edit' : 'add'}`}
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., Work, Personal"
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`todo-details-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Details (Optional)
        </label>
        <textarea
          id={`todo-details-${isEditing ? 'edit' : 'add'}`}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add more details about the task..."
          rows={3}
          className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 flex items-center justify-center text-sm font-semibold text-white bg-blue-300 hover:bg-blue-700 dark:bg-blue-300 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-600 focus:ring-blue-500 transition-colors"
        >
          {isEditing ? 'Save Changes' : (
            <>
              <PlusIcon className="text-lg mr-1.5" />
              Add Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;