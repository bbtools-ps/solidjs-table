import { Table } from '@tanstack/solid-table';
import { createContext, useContext } from 'solid-js';

interface TableContextType {
  table: Table<any> | null;
  data: () => any[];
  isSortable: boolean;
  isReorderable: boolean;
  isSelectable: boolean;
  isResizable: boolean;
}

export const TableContext = createContext<TableContextType>({
  table: null,
  data: () => [],
  isSortable: false,
  isReorderable: false,
  isSelectable: false,
  isResizable: false,
});

export function useTableContext() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }

  return context;
}
