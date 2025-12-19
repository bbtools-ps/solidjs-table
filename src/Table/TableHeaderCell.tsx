import { flexRender, Header } from '@tanstack/solid-table';
import { AiFillCaretDown, AiFillCaretUp } from 'solid-icons/ai';
import { RiEditorDraggable } from 'solid-icons/ri';
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
  const { isSortable } = useTableContext();

  return (
    <div
      class={
        isSortable && header.column.getCanSort()
          ? 'flex flex-1 items-center justify-between p-2 select-none'
          : 'p-2'
      }
      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
    >
      <span class="flex items-center gap-1">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>
      <SortIndicator header={header} />
    </div>
  );
}

export default function TableHeader() {
  const { table, isReorderable } = useTableContext();

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
                class="border-gray-300 p-0 not-last:border-r"
                style={{
                  width: `calc(var(--col-${header?.id}-size) * 1px)`,
                }}
                role="row"
              >
                <Show when={!header.isPlaceholder}>
                  <Show when={isReorderable} fallback={<TableHeaderCell header={header} />}>
                    <DraggableItem
                      id={header.column.id}
                      content={
                        flexRender(header.column.columnDef.header, header.getContext()) as string
                      }
                    >
                      <RiEditorDraggable />
                      <TableHeaderCell header={header} />
                    </DraggableItem>
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
