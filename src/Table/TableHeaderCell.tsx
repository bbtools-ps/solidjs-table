import { flexRender, Header } from '@tanstack/solid-table';
import { clsx } from 'clsx';
import { AiFillCaretDown, AiFillCaretUp } from 'solid-icons/ai';
import { For, Show } from 'solid-js';
import { DraggableItem } from './DraggableItem';
import { useTableContext } from './useTableContext';

interface SortIndicatorProps {
  header: Header<any, unknown>;
}

export function SortIndicator({ header }: SortIndicatorProps) {
  const { isSortable } = useTableContext();

  return (
    <Show when={isSortable}>
      <span>
        {{
          asc: <AiFillCaretDown />,
          desc: <AiFillCaretUp />,
        }[header.column.getIsSorted() as string] ?? null}
      </span>
    </Show>
  );
}

interface TableHeaderCellProps {
  header: Header<any, unknown>;
}

function TableHeaderCell({ header }: TableHeaderCellProps) {
  const { isSortable, isResizable } = useTableContext();

  return (
    <div
      class={'flex flex-1 items-center justify-between p-2 select-none'}
      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      <SortIndicator header={header} />
    </div>
  );
}

export default function TableHeader() {
  const { table, isReorderable, isSelectable, isResizable } = useTableContext();

  if (!table) {
    return null;
  }

  return (
    <For each={table.getHeaderGroups()}>
      {(headerGroup) => (
        <div class="flex w-fit border-b border-gray-300 bg-white pr-4" role="rowgroup">
          <For each={headerGroup.headers}>
            {(header) => (
              <div
                class="relative flex border-gray-300 p-0 not-last:border-r"
                style={{
                  width: `calc(var(--col-${header?.id}-size) * 1px)`,
                }}
                role="row"
              >
                <Show when={!header.isPlaceholder}>
                  <Show
                    when={isReorderable && !(isSelectable && header.column.id === 'select')}
                    fallback={<TableHeaderCell header={header} />}
                  >
                    <DraggableItem
                      id={header.column.id}
                      content={
                        flexRender(header.column.columnDef.header, header.getContext()) as string
                      }
                    >
                      <TableHeaderCell header={header} />
                    </DraggableItem>
                    <Show when={isResizable}>
                      <div
                        onMouseDown={isResizable ? header.getResizeHandler() : undefined}
                        onTouchStart={isResizable ? header.getResizeHandler() : undefined}
                        class={clsx(
                          'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-blue-500 opacity-0 select-none hover:opacity-100',
                          header.column.getIsResizing() ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </Show>
                  </Show>
                </Show>
              </div>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
