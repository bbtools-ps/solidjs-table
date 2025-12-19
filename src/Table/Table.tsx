import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  ColumnDef,
  createSolidTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/solid-table';
import { Accessor, createEffect, createMemo, createSignal } from 'solid-js';
import Pagination from './Pagination';
import TableBody from './TableBody';
import TableHeader from './TableHeaderCell';
import { TableContext } from './useTableContext';

interface SortingState {
  id: string;
  desc: boolean;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface TableProps<T> {
  data: Accessor<T[]>;
  columns: ColumnDef<T>[];
  isReorderable?: boolean;
  isSortable?: boolean;
}

export default function Table({
  data,
  columns,
  isReorderable = false,
  isSortable = false,
}: TableProps<any>) {
  const [sorting, setSorting] = createSignal<SortingState[]>([{ id: 'firstName', desc: false }]);
  const [pagination, setPagination] = createSignal<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnOrder, setColumnOrder] = createSignal<string[]>([]);

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns,
    state: {
      get sorting() {
        return sorting();
      },
      get pagination() {
        return pagination();
      },
      get columnOrder() {
        return columnOrder();
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
  });

  const columnSizeVars = createMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  // Initialize column order with current column IDs
  createEffect(() => {
    if (columnOrder().length === 0) {
      setColumnOrder(table.getAllColumns().map((column) => column.id));
    }
  });

  createEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data?.type === 'DRAGGABLE_ITEM';
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!sourceData || !targetData) {
          return;
        }

        const indexOfSource = columnOrder().findIndex((item) => item === sourceData.id);
        const indexOfTarget = columnOrder().findIndex((item) => item === targetData.id);

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        setColumnOrder(
          reorderWithEdge({
            list: columnOrder(),
            startIndex: indexOfSource,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: 'horizontal',
          })
        );
      },
    });
  });

  return (
    <TableContext.Provider value={{ table, data, isSortable, isReorderable }}>
      <div class="flex w-fit flex-col">
        <div
          class="flex max-h-150 w-fit flex-col border border-gray-300"
          style={columnSizeVars()}
          role="table"
        >
          <TableHeader />
          <TableBody />
        </div>
        <Pagination table={table} />
      </div>
    </TableContext.Provider>
  );
}
