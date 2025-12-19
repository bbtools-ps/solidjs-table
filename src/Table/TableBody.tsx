import { flexRender } from '@tanstack/solid-table';
import { clsx } from 'clsx';
import { For, Show } from 'solid-js';
import { useTableContext } from './useTableContext';

export default function TableBody() {
  const { table, data } = useTableContext();

  if (!table) {
    return null;
  }

  return (
    <div class="min-h-0 flex-1 overflow-y-scroll" role="rowgroup">
      <Show
        when={data().length > 0}
        fallback={
          <div class="flex items-center justify-center bg-white p-4 text-gray-500" role="row">
            No results
          </div>
        }
      >
        <For each={table.getRowModel().rows}>
          {(row, index) => (
            <div class={clsx('flex', index() % 2 === 0 ? 'bg-white' : 'bg-gray-100')} role="row">
              <For each={row.getVisibleCells()}>
                {(cell) => (
                  <div
                    class="border-gray-300 p-2 not-last:border-r"
                    style={{
                      width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                    }}
                    role="cell"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
