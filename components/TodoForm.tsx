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
      alert('タスクの内容を入力してください。'); 
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
          タスクの内容
        </label>
        <input
          id={`todo-text-${isEditing ? 'edit' : 'add'}`}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="何をしますか？"
          className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`todo-duedate-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            期限日 (任意)
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
          </div>
        </div>
        <div>
          <label htmlFor={`todo-tag-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            タグ (任意)
          </label>
          <input
            id={`todo-tag-${isEditing ? 'edit' : 'add'}`}
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="例: 仕事、プライベート"
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
/>
        </div>
      </div>

      <div>
        <label htmlFor={`todo-details-${isEditing ? 'edit' : 'add'}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          詳細 (任意)
        </label>
        <textarea
          id={`todo-details-${isEditing ? 'edit' : 'add'}`}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="タスクの詳細を追加..."
          rows={3}
          className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 flex items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-600 focus:ring-blue-500 transition-colors"
        >
          {isEditing ? '変更を保存' : (
            <>
              <PlusIcon className="text-lg mr-1.5" />
              タスクを追加
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;