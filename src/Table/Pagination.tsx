import { Table } from '@tanstack/solid-table';
import { AiFillCaretLeft, AiFillCaretRight } from 'solid-icons/ai';
import { For, Show } from 'solid-js';

interface PaginationProps {
  table: Table<any>;
}

export default function Pagination({ table }: PaginationProps) {
  return (
    <div class="flex items-center justify-between border-x border-b border-gray-300 bg-white py-1">
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
          aria-label="Page size"
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
  );
}
