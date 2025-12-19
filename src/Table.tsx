import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/solid-table';
import { AiFillCaretDown, AiFillCaretLeft, AiFillCaretRight, AiFillCaretUp } from 'solid-icons/ai';
import { RiEditorDraggable } from 'solid-icons/ri';
import { Accessor, For, Show, createEffect, createSignal } from 'solid-js';
import { DraggableItem } from './DraggableItem';

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
}

export default function Table({ data, columns }: TableProps<any>) {
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
    <div class="flex w-full flex-col overflow-x-hidden overflow-y-auto border border-gray-300">
      <table class="flex-1">
        <thead class="sticky top-0 bg-white shadow-md">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th
                      colSpan={header.colSpan}
                      class="relative border-gray-300 p-0 not-last:border-r"
                    >
                      <Show when={!header.isPlaceholder}>
                        <DraggableItem
                          id={header.column.id}
                          content={
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            ) as string
                          }
                        >
                          <div
                            class={
                              header.column.getCanSort()
                                ? 'flex items-center justify-between p-2 select-none'
                                : 'p-2'
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span class="flex items-center gap-1">
                              <RiEditorDraggable class="text-gray-400" />
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            <span>
                              {{
                                asc: <AiFillCaretDown />,
                                desc: <AiFillCaretUp />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </div>
                        </DraggableItem>
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody class="overflow-y-auto">
          <For each={table.getRowModel().rows}>
            {(row, index) => (
              <tr class={index() % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <td class="border-gray-300 p-2 not-last:border-r">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <div class="sticky bottom-0 flex items-center justify-between border-t border-gray-300 bg-white py-1">
        <div class="flex items-center gap-1">
          <button
            class="m-1 flex items-center px-3 py-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <AiFillCaretLeft />
          </button>
          <Show when={table.getPageCount() > 1}>
            <For
              each={(() => {
                const current = table.getState().pagination.pageIndex;
                const total = table.getPageCount();
                const maxPages = Math.min(5, total - current);
                const pages = Array.from({ length: maxPages }, (_, i) =>
                  i + 1 === maxPages && maxPages === 5 ? '...' : current + i
                );
                return pages;
              })()}
            >
              {(page) => (
                <Show when={typeof page === 'number'} fallback={<span class="mx-1">...</span>}>
                  <button
                    class={`flex items-center px-3 py-1 ${
                      table.getState().pagination.pageIndex === page ? 'bg-blue-500 text-white' : ''
                    }`}
                    onClick={() => table.setPageIndex(page as number)}
                  >
                    {(page as number) + 1}
                  </button>
                </Show>
              )}
            </For>
          </Show>
          <button
            class="m-1 flex items-center px-3 py-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <AiFillCaretRight />
          </button>
          <select
            class="h-full"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option value={pageSize}>{pageSize}</option>
            ))}
          </select>
        </div>
        <span class="mx-2">
          {`${table.getState().pagination.pageIndex + 1} - ${table.getPageCount()} of ${table.getRowCount()} items`}
        </span>
      </div>
    </div>
  );
}
