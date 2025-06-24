import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, FilterType, SortCategory, SortDirection, TodoFormData } from './types';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import FilterControls from './components/FilterControls';
import DisplayOptionsControls from './components/SortControls';
import Modal from './components/Modal';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, SunIcon, MoonIcon } from './components/icons';

interface TagWithCount {
  name: string;
  count: number;
}

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FilterType.HOME);
  
  const [sortCategory, setSortCategory] = useState<SortCategory>(SortCategory.CREATED_AT);
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false); 

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [selectedTagsForFilter, setSelectedTagsForFilter] = useState<string[]>([]);

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('todoAppTheme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('todoAppTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        const parsedTodos: Todo[] = JSON.parse(storedTodos);
        setTodos(parsedTodos.map((todo: any) => ({
            ...todo,
            createdAt: todo.createdAt || Date.now(),
            updatedAt: todo.updatedAt || Date.now(),
            deleted: todo.deleted || false,
            isFavorite: todo.isFavorite || false,
        })));
      } catch (error) {
        console.error("Failed to parse todos from localStorage", error);
        setTodos([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const addTodo = useCallback((data: TodoFormData) => {
    const newTodo: Todo = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
      isFavorite: false,
    };
    setTodos(prevTodos => [newTodo, ...prevTodos]);
    handleCloseAddModal();
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, isFavorite: !todo.isFavorite, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const softDeleteTodo = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, deleted: true, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const restoreTodo = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, deleted: false, completed: false, updatedAt: Date.now() } : todo
      )
    );
  }, []);
  
  const permanentDeleteTodo = useCallback((id: string) => {
     if (window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
     }
  }, []);

  const handleStartEdit = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  }, []);
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTodo(null);
  }

  const handleUpdateTodo = useCallback((data: TodoFormData) => {
    if (!editingTodo) return;
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingTodo.id ? { ...editingTodo, ...data, updatedAt: Date.now() } : todo
      )
    );
    handleCloseEditModal();
  }, [editingTodo]);

  const tagsWithCount = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    todos.forEach(todo => {
      if (todo.tag && !todo.deleted) { 
        tagCounts[todo.tag] = (tagCounts[todo.tag] || 0) + 1;
      }
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [todos]);

  const processedTodos = useMemo(() => {
    return todos
    .filter(todo => {
      switch (filter) {
        case FilterType.HOME:
          return !todo.deleted;
        case FilterType.TRASH:
          return todo.deleted;
        default:
          return true;
      }
    })
    .filter(todo => {
      if (!searchTerm.trim()) return true;
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        todo.text.toLowerCase().includes(lowerSearchTerm) ||
        todo.details.toLowerCase().includes(lowerSearchTerm)
      );
    })
    .filter(todo => {
        if (filter === FilterType.TRASH) return true; 
        if (showOnlyFavorites && !todo.isFavorite) return false;
        if (selectedTagsForFilter.length > 0 && (!todo.tag || !selectedTagsForFilter.includes(todo.tag))) return false;
        return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      const dirMultiplier = sortDirection === 'ASC' ? 1 : -1;

      switch (sortCategory) {
        case SortCategory.CREATED_AT:
          comparison = a.createdAt - b.createdAt;
          break;
        case SortCategory.DUE_DATE:
          if (a.dueDate === b.dueDate) comparison = a.createdAt - b.createdAt;
          else if (a.dueDate === null) comparison = 1; 
          else if (b.dueDate === null) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case SortCategory.LAST_UPDATED:
          comparison = a.updatedAt - b.updatedAt;
          break;
        case SortCategory.TEXT:
          comparison = a.text.localeCompare(b.text);
          break;
        case SortCategory.FAVORITE:
          if (a.isFavorite && !b.isFavorite) comparison = -1;
          else if (!a.isFavorite && b.isFavorite) comparison = 1;
          else comparison = a.createdAt - b.createdAt; 
          break;
        case SortCategory.TAG_NAME:
          const tagA = a.tag || '\uffff'; 
          const tagB = b.tag || '\uffff';
          comparison = tagA.localeCompare(tagB);
          if (comparison === 0) comparison = a.createdAt - b.createdAt; 
          break;
        default:
          comparison = a.createdAt - b.createdAt; 
      }
      return comparison * dirMultiplier;
    });
  }, [todos, filter, searchTerm, showOnlyFavorites, selectedTagsForFilter, sortCategory, sortDirection]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const displayOptionsTrigger = document.getElementById('display-options-trigger');
        const displayOptionsPanel = document.getElementById('display-options-panel');

        if (isDisplayOptionsOpen && 
            displayOptionsTrigger && !displayOptionsTrigger.contains(event.target as Node) &&
            displayOptionsPanel && !displayOptionsPanel.contains(event.target as Node)) {
            setIsDisplayOptionsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDisplayOptionsOpen]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-6 sm:py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-lg md:max-w-2xl lg:max-w-3xl">
        <header className="mb-6 md:mb-8 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Todo List
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <MoonIcon className="text-xl" /> : <SunIcon className="text-xl" />}
          </button>
        </header>

        <main>
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-center sm:items-stretch gap-3 sm:gap-4">
            <div className="w-full sm:w-auto"> 
              <FilterControls currentFilter={filter} onFilterChange={setFilter} />
            </div>
            <div className="relative w-full sm:flex-grow">
              <input 
                type="text"
                placeholder="Search title & details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 pl-10 pr-4 h-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
                aria-label="Search tasks by title or details"
              />
              <SearchIcon className="text-lg text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="relative mb-3 md:mb-4"> {/* Reduced margin-bottom here */}
            <button
              id="display-options-trigger"
              onClick={() => setIsDisplayOptionsOpen(!isDisplayOptionsOpen)}
              className="w-full sm:w-auto px-4 py-2.5 flex items-center justify-center text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
              aria-expanded={isDisplayOptionsOpen}
              aria-controls="display-options-panel"
            >
              Display Options
              {isDisplayOptionsOpen ? <ArrowUpIcon className="text-md ml-2" /> : <ArrowDownIcon className="text-md ml-2" />}
            </button>

            {isDisplayOptionsOpen && (
              <div 
                id="display-options-panel"
                className="absolute top-full left-0 mt-1 w-full sm:w-80 md:w-96 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl z-20 overflow-hidden" 
              >
                 <DisplayOptionsControls
                    currentSortCategory={sortCategory}
                    onSortCategoryChange={setSortCategory}
                    currentSortDirection={sortDirection}
                    onSortDirectionChange={setSortDirection}
                    showOnlyFavorites={showOnlyFavorites}
                    onShowOnlyFavoritesChange={setShowOnlyFavorites}
                    selectedTags={selectedTagsForFilter}
                    onSelectedTagsChange={setSelectedTagsForFilter}
                    availableTagsWithCount={tagsWithCount}
                 />
              </div>
            )}
          </div>

          <div className="mb-4 md:mb-6">
            { (todos.length > 0 || isAddModalOpen ) && ( 
                <button
                onClick={handleOpenAddModal}
                className="w-full px-6 py-3 flex items-center justify-center text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors"
                aria-label="Add a new task"
                >
                <PlusIcon className="text-xl mr-2" />
                Add New Task
                </button>
            )}
          </div>
          
          {todos.length === 0 && !isAddModalOpen && (
            <div className="text-center text-slate-500 dark:text-slate-400 my-10 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Your list is empty!</h2>
              <p className="text-sm mb-4">Let's get productive. Click below to start.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 flex items-center justify-center mx-auto text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors"
                aria-label="Add a new task"
                >
                <PlusIcon className="text-lg mr-1.5" />
                Add New Task
              </button>
            </div>
          )}

          {todos.length > 0 && processedTodos.length === 0 && (
             <p className="text-center text-slate-500 dark:text-slate-400 my-8 text-lg p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
                {filter === FilterType.TRASH && "The trash is empty!"}
                {filter === FilterType.HOME && "No tasks match your current filters or search. Try adjusting them!"}
             </p>
          )}

          {processedTodos.length > 0 && (
            <ul className="space-y-1.5">
              {processedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onToggleFavorite={toggleFavorite}
                  onDelete={filter === FilterType.TRASH ? permanentDeleteTodo : softDeleteTodo}
                  onEdit={handleStartEdit}
                  onRestore={filter === FilterType.TRASH ? restoreTodo : undefined}
                  isTrashView={filter === FilterType.TRASH}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New Task"
      >
        <TodoForm
          onSubmit={addTodo}
          onCancel={handleCloseAddModal} 
          isEditing={false}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Task"
      >
        {editingTodo && (
          <TodoForm
            onSubmit={handleUpdateTodo}
            initialData={editingTodo}
            onCancel={handleCloseEditModal}
            isEditing={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default App;