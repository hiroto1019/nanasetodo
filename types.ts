export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null; // Keep as YYYY-MM-DD string
  tag: string;
  details: string;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  deleted: boolean;
  isFavorite: boolean;
}

export enum FilterType {
  HOME = 'HOME', // Shows non-deleted tasks
  TRASH = 'TRASH', // Shows deleted tasks
}

export enum SortCategory {
  CREATED_AT = 'CREATED_AT',
  DUE_DATE = 'DUE_DATE',
  TEXT = 'TEXT',
  LAST_UPDATED = 'LAST_UPDATED',
  FAVORITE = 'FAVORITE',
  TAG_NAME = 'TAG_NAME',
}

export type SortDirection = 'ASC' | 'DESC';

// Props for TodoForm, covering both add and edit scenarios
export type TodoFormData = Omit<Todo, 'id' | 'completed' | 'createdAt' | 'updatedAt' | 'deleted' | 'isFavorite'>;