import { faker } from '@faker-js/faker';
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/solid-table';
import { AiFillCaretDown, AiFillCaretLeft, AiFillCaretRight, AiFillCaretUp } from 'solid-icons/ai';
import { createSignal, For, Show } from 'solid-js';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = Array.from({ length: 100 }, (_, i) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: Math.floor(Math.random() * 100),
  visits: Math.floor(Math.random() * 1000),
  status: ['Single', 'In Relationship', 'Complicated'][Math.floor(Math.random() * 3)],
  progress: Math.floor(Math.random() * 100),
}));

const defaultColumns: ColumnDef<Person>[] = [
  {
    id: 'firstName',
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    id: 'lastName',
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
  },
  {
    id: 'visits',
    accessorKey: 'visits',
    header: 'Visits',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'progress',
    accessorKey: 'progress',
    header: 'Profile Progress',
  },
];

interface SortingState {
  id: string;
  desc: boolean;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export default function App() {
  const [data, setData] = createSignal(defaultData);
  const [sorting, setSorting] = createSignal<SortingState[]>([{ id: 'firstName', desc: false }]);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [pagination, setPagination] = createSignal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: defaultColumns,
    state: {
      get sorting() {
        return sorting();
      },
      get pagination() {
        return pagination();
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const handleChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    setSearchTerm(value);
    setData(() =>
      defaultData.filter((person) => person.firstName.toLowerCase().includes(value.toLowerCase()))
    );
  };

  return (
    <div class="flex max-w-5xl flex-1 flex-col overflow-hidden p-2">
      <input
        type="text"
        value={searchTerm()}
        onInput={handleChange}
        placeholder="Type to filter by first name..."
        class="mb-4 w-full border p-2"
      />
      <div class="flex w-full flex-col overflow-auto">
        <table class="w-full overflow-hidden overflow-y-auto">
          <thead class="sticky -top-px bg-white shadow-md">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th colSpan={header.colSpan} class="border border-gray-300 p-2">
                        <Show when={!header.isPlaceholder}>
                          <div
                            class={
                              header.column.getCanSort()
                                ? 'flex cursor-pointer items-center justify-between select-none'
                                : undefined
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <AiFillCaretDown />,
                              desc: <AiFillCaretUp />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
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
                      <td class="border border-gray-300 p-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div class="sticky bottom-0 flex items-center justify-between bg-white py-1">
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
                  const pages: (number | string)[] = [];

                  if (total <= 7) {
                    for (let i = 0; i < total; i++) pages.push(i);
                  } else {
                    pages.push(0);
                    if (current > 3) pages.push('...');

                    const start = Math.max(1, current - 1);
                    const end = Math.min(total - 2, current + 1);

                    for (let i = start; i <= end; i++) pages.push(i);

                    if (current < total - 4) pages.push('...');
                    pages.push(total - 1);
                  }

                  return pages;
                })()}
              >
                {(page) => (
                  <Show when={typeof page === 'number'} fallback={<span class="mx-1">...</span>}>
                    <button
                      class={`flex items-center px-3 py-1 ${
                        table.getState().pagination.pageIndex === page
                          ? 'bg-blue-500 text-white'
                          : ''
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
    </div>
  );
}
