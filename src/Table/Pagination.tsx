import { Table } from '@tanstack/solid-table';
import { AiFillCaretLeft, AiFillCaretRight } from 'solid-icons/ai';
import { For, Show } from 'solid-js';

interface PaginationProps {
  table: Table<any>;
}

export default function Pagination({ table }: PaginationProps) {
  return (
    <div class="flex items-center justify-between border-x border-b border-gray-300 bg-white py-1">
      <div class="mx-1 flex items-stretch gap-1">
        <button
          class="flex items-center px-2 py-1 hover:bg-blue-100"
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
              const pageRangeSize = 5;

              // Calculate which range the current page is in
              const currentRange = Math.floor(current / pageRangeSize);
              const rangeStart = currentRange * pageRangeSize;
              const rangeEnd = Math.min(rangeStart + pageRangeSize, total);

              // Create array of page numbers in current range
              const pages: (number | string)[] = [];

              // Add "..." at the start if there are previous ranges
              if (currentRange > 0) {
                pages.push('prev');
              }

              // Add page numbers in current range
              for (let i = rangeStart; i < rangeEnd; i++) {
                pages.push(i);
              }

              // Add "..." at the end if there are more pages
              if (rangeEnd < total) {
                pages.push('next');
              }

              return pages;
            })()}
          >
            {(page) => (
              <Show
                when={typeof page === 'number'}
                fallback={
                  <button
                    class="flex items-center px-3 py-1 hover:bg-blue-100"
                    onClick={() => {
                      const currentRange = Math.floor(table.getState().pagination.pageIndex / 5);
                      if (page === 'prev') {
                        const prevRangeEnd = currentRange * 5 - 1;
                        if (prevRangeEnd >= 0) {
                          table.setPageIndex(prevRangeEnd);
                        }
                      } else if (page === 'next') {
                        const nextRangeStart = (currentRange + 1) * 5;
                        if (nextRangeStart < table.getPageCount()) {
                          table.setPageIndex(nextRangeStart);
                        }
                      }
                    }}
                  >
                    ...
                  </button>
                }
              >
                <button
                  class={`flex items-center px-3 py-1 ${
                    table.getState().pagination.pageIndex === page
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-blue-100'
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
          class="flex items-center px-2 py-1 hover:bg-blue-100"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <AiFillCaretRight />
        </button>
        <div class="flex items-center">
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
      </div>
      <span class="mx-2">
        {`${table.getState().pagination.pageIndex + 1} - ${table.getPageCount()} of ${table.getRowCount()} items`}
      </span>
    </div>
  );
}
