// App.tsx の一番上に追加
import { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, FilterType, SortCategory, SortDirection, TodoFormData } from './types';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import FilterControls from './components/FilterControls';
import DisplayOptionsControls from './components/SortControls';
import Modal from './components/Modal';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, SunIcon, MoonIcon } from './components/icons';
import { supabase } from './src/supabaseClient';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

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
  
// App.tsxの69行目あたりを置き換える
useEffect(() => {
  // ログインしている場合にのみ、Todoリストを取得する
  if (session) {
    const getTodos = async () => {
      setLoading(true); // データ取得を開始するのでローディング中にする
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setTodos(data.map(mapDbTodoToAppTodo));
        } else if (error) {
          console.error('Error fetching todos:', error);
          alert(error.message);
        } 
      } catch (error) {
          console.error('An unexpected error occurred:', error);
      } finally {
        setLoading(false); // データ取得が完了したのでローディングを解除
      }
    };
    getTodos();
  } else {
    // ログインしていない場合は、Todoリストは空で、ローディングも完了とする
    setTodos([]);
    setLoading(false);
  }
}, [session?.user?.id]);

// App.tsx の useEffect が並んでいるところに追加
useEffect(() => {
  // 最初のセッション情報を取得
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  // 認証状態が変化（ログイン、ログアウトなど）するたびにセッション情報を更新
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  // クリーンアップ関数
  return () => subscription.unsubscribe();
}, []);


  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const addTodo = useCallback(async (data: TodoFormData) => {
    if (!session?.user) {
      alert("ログインしてください。");
      return;
    }

    try {
      // dueDate → due_date に変換
      const newTodoData = {
        ...data,
        due_date: data.dueDate ?? null, // ここで変換
        user_id: session.user.id,
      };
      delete newTodoData.dueDate; // キャメルケースは削除

      const { data: insertedTodo, error } = await supabase
        .from('todos')
        .insert(newTodoData)
        .select()
        .single();

      if (insertedTodo) {
        setTodos(prev => [mapDbTodoToAppTodo(insertedTodo), ...prev]);
        handleCloseAddModal();
      } else if (error) {
        console.error("Error adding todo:", error);
        alert(error.message);
      } 
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }, [session]); // sessionに依存するようになったので追加

  const toggleComplete = useCallback(async (id: string) => {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
      )
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !targetTodo.completed, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        alert('データベースの更新に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
    }
  }, [todos]);

  const toggleFavorite = useCallback(async (id: string) => {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, isFavorite: !todo.isFavorite, updatedAt: Date.now() } : todo
      )
    );

    try {
      const updateData = { is_favorite: !targetTodo.isFavorite };
      console.log('toggleFavorite updateData', updateData);
      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id);
      if (error) {
        console.log('Supabase error:', error);
        alert('データベースの更新に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
    }
  }, [todos]);

  const softDeleteTodo = useCallback(async (id: string) => {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, deleted: true, updatedAt: Date.now() } : todo
      )
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        alert('データベースの更新に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
    }
  }, [todos]);

  const restoreTodo = useCallback(async (id: string) => {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, deleted: false, updatedAt: Date.now() } : todo
      )
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ deleted: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        alert('データベースの更新に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
    }
  }, [todos]);
  
  const permanentDeleteTodo = useCallback(async (id: string) => {
    if (!window.confirm('このタスクを完全に削除しますか？この操作は元に戻せません。')) {
      return;
    }
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      if (error) {
        alert('データベースからの削除に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
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

  const handleUpdateTodo = useCallback(async (data: TodoFormData) => {
    if (!editingTodo) return;

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingTodo.id ? { ...editingTodo, ...data, updatedAt: Date.now() } : todo
      )
    );
    handleCloseEditModal();

    try {
      // 必要なカラムだけ送る（undefined/nullは除外）
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (typeof data.text === 'string') updateData.text = data.text;
      if (typeof data.details === 'string') updateData.details = data.details;
      if (typeof data.dueDate === 'string' || data.dueDate === null) updateData.due_date = data.dueDate;
      if (typeof data.tag === 'string') updateData.tag = data.tag;
      if (typeof data.isFavorite === 'boolean') updateData.is_favorite = data.isFavorite;
      if (typeof data.completed === 'boolean') updateData.completed = data.completed;
      if (typeof data.deleted === 'boolean') updateData.deleted = data.deleted;

      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', editingTodo.id);

      if (error) {
        alert('データベースの更新に失敗しました');
      }
    } catch (e) {
      alert('予期せぬエラーが発生しました');
    }
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

// DBのtodoをReact用に変換
function mapDbTodoToAppTodo(dbTodo: any): Todo {
  return {
    ...dbTodo,
    isFavorite: dbTodo.is_favorite ?? false,
    createdAt: new Date(dbTodo.created_at).getTime(),
    updatedAt: dbTodo.updated_at ? new Date(dbTodo.updated_at).getTime() : 0,
    dueDate: dbTodo.due_date ?? null,
  };
}

// App.tsx の return 以降を置き換える

if (loading) {
  return <div className="text-center text-slate-500 dark:text-slate-400 p-10">読み込み中...</div>;
}

return (
  <div className="container mx-auto p-4 max-w-lg md:max-w-2xl lg:max-w-3xl">
    {!session ? (
      // ▼ ログインしていない場合に表示する内容 ▼
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Todoアプリ ログイン</h1>
<Auth
  supabaseClient={supabase}
  appearance={{
    theme: ThemeSupa,
    style: {
      button: {
        borderRadius: '8px',
        borderColor: 'transparent',
      },
    },
  }}
  theme={theme}
  providers={['github']}
  view="sign_in"
  // App.tsxのAuthコンポーネントのlocalizationプロパティ
localization={{
  variables: {
    sign_in: {
      email_label: 'メールアドレス',
      password_label: 'パスワード',
      email_input_placeholder: 'あなたのメールアドレス',
      password_input_placeholder: 'あなたのパスワード',
      button_label: 'ログイン',
      social_provider_text: '{{provider}}でログイン'
    },
    sign_up: {
      email_label: 'メールアドレス',
      password_label: 'パスワード',
      email_input_placeholder: 'あなたのメールアドレス',
      password_input_placeholder: 'あなたのパスワード',
      button_label: '新規登録',
      social_provider_text: '{{provider}}で登録'
    },
    forgotten_password: {
      link_text: 'パスワードを忘れましたか？'
    },
    sign_in_up_prompt: {
      text: '新規登録はまだですか？ ',
      link_text: 'サインアップを行う'
    },
    sign_up_in_prompt: {
      link_text: 'すでにアカウントをお持ちですか？ ログイン',
      text: '',
    }
  }
}}
/>
      </div>
    ) : (
      // ▼ ログインしている場合に表示する内容（これまでのアプリ本体） ▼
      <>
        <header className="mb-6 md:mb-8 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Todoリスト
          </h1>
           {/* ログアウトボタン */}
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signOut();
                  setSession(null); // UI上は必ずログアウト状態に
                  if (error && error.status !== 403) {
                    alert('ログアウトに失敗しました: ' + error.message);
                  }
                } catch (e) {
                  setSession(null); // 万一の例外時もUI上はログアウト
                  alert('予期せぬエラーが発生しました');
                }
              }}
              className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md shadow-sm"
            >
              ログアウト
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
              title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
            >
              {theme === 'light' ? <MoonIcon className="text-xl" /> : <SunIcon className="text-xl" />}
            </button>
          </div>
        </header>

        <main>
           <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto flex-shrink-0"> 
              <FilterControls currentFilter={filter} onFilterChange={setFilter} />
              </div>
              <div className="relative w-full sm:flex-grow">
              <input 
                  type="text"
                  placeholder="タイトルや詳細で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2.5 pl-8 pr-4 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-colors"
                  aria-label="タスクをタイトルや詳細で検索"
              />
              <SearchIcon className="text-lg text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
          </div>
          
          <div className="relative mb-3 md:mb-4">
              <button
              id="display-options-trigger"
              onClick={() => setIsDisplayOptionsOpen(!isDisplayOptionsOpen)}
              className="w-full sm:w-auto px-4 py-2.5 h-10 flex items-center justify-center text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
              aria-expanded={isDisplayOptionsOpen}
              aria-controls="display-options-panel"
              >
              表示オプション
              {isDisplayOptionsOpen ? <ArrowUpIcon className="text-md ml-2" /> : <ArrowDownIcon className="text-md ml-2" />}
              </button>

              {isDisplayOptionsOpen && (
                <div id="display-options-panel" className="absolute top-full left-0 mt-1 w-full sm:w-80 md:w-96 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl z-20 overflow-hidden" >
                    <DisplayOptionsControls
                        currentSortCategory={sortCategory} onSortCategoryChange={setSortCategory}
                        currentSortDirection={sortDirection} onSortDirectionChange={setSortDirection}
                        showOnlyFavorites={showOnlyFavorites} onShowOnlyFavoritesChange={setShowOnlyFavorites}
                        selectedTags={selectedTagsForFilter} onSelectedTagsChange={setSelectedTagsForFilter}
                        availableTagsWithCount={tagsWithCount}
                    />
                </div>
              )}
          </div>

          <div className="mb-4 md:mb-6">
              { (todos.length > 0 || isAddModalOpen ) && ( 
                  <button onClick={handleOpenAddModal} className="w-full px-6 py-3 flex items-center justify-center text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors" aria-label="新しいタスクを追加">
                      <PlusIcon className="text-xl mr-2" />
                      新しいタスクを追加
                  </button>
              )}
          </div>
          
          {todos.length === 0 && !isAddModalOpen && (
              <div className="text-center text-slate-500 dark:text-slate-400 my-10 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">リストは空です！</h2>
              <p className="text-sm mb-4">始めましょう。下をクリックしてタスクを追加してください。</p>
              <button onClick={handleOpenAddModal} className="px-5 py-2.5 flex items-center justify-center mx-auto text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors" aria-label="新しいタスクを追加">
                  <PlusIcon className="text-lg mr-1.5" />
                  新しいタスクを追加
                  </button>
              </div>
          )}

          {todos.length > 0 && processedTodos.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 my-8 text-lg p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
                  {filter === FilterType.TRASH && "ゴミ箱は空です！"}
                  {filter === FilterType.HOME && "フィルターや検索条件に合うタスクがありません。"}
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

        <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="新しいタスクを追加">
          <TodoForm onSubmit={addTodo} onCancel={handleCloseAddModal} isEditing={false} />
        </Modal>

        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="タスクを編集">
          {editingTodo && (
            <TodoForm
              onSubmit={handleUpdateTodo}
              initialData={editingTodo}
              onCancel={handleCloseEditModal}
              isEditing={true}
            />
          )}
        </Modal>
      </>
    )}
  </div>
  );
}

export default App;