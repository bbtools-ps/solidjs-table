import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { createEffect, createSignal, type JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import invariant from 'tiny-invariant';
import { DropIndicator } from './DropIndicator';

// Type narrowing is tricky with Solid's signal accessors
interface ItemState {
  type: 'idle' | 'preview' | 'is-dragging' | 'is-dragging-over';
  container?: HTMLElement;
  closestEdge?: Edge | null;
}

const stateStyles: Partial<Record<ItemState['type'], JSX.HTMLAttributes<HTMLDivElement>['class']>> =
  {
    'is-dragging': 'opacity-40',
  };

const idle: ItemState = { type: 'idle' };

export function DraggableItem(props: { id: string; content: string; children?: any }) {
  let ref: HTMLDivElement | undefined = undefined;
  const [state, setState] = createSignal<ItemState>(idle);

  createEffect(() => {
    const element = ref;
    const id = props.id;
    invariant(element);

    draggable({
      element,
      getInitialData() {
        return { type: 'DRAGGABLE_ITEM', id };
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: pointerOutsideOfPreview({
            x: '16px',
            y: '8px',
          }),
          render({ container }) {
            setState({ type: 'preview', container });
          },
        });
      },
      onDragStart() {
        setState({ type: 'is-dragging' });
      },
      onDrop() {
        setState(idle);
      },
    });

    dropTargetForElements({
      element,
      canDrop({ source }) {
        // not allowing dropping on yourself
        if (source.element === element) {
          return false;
        }
        // only allowing items to be dropped on me
        return source.data.type === 'DRAGGABLE_ITEM';
      },
      getData({ input }) {
        const data = { type: 'DRAGGABLE_ITEM', id: props.id };
        return attachClosestEdge(data, {
          element,
          input,
          allowedEdges: ['left', 'right'],
        });
      },
      getIsSticky() {
        return true;
      },
      onDragEnter({ self }) {
        const closestEdge = extractClosestEdge(self.data);
        setState({ type: 'is-dragging-over', closestEdge });
      },
      onDrag({ self }) {
        const closestEdge = extractClosestEdge(self.data);

        // Only need to update state if nothing has changed.
        // Prevents re-rendering.
        setState((current) => {
          if (current.type === 'is-dragging-over' && current.closestEdge === closestEdge) {
            return current;
          }
          return { type: 'is-dragging-over', closestEdge };
        });
      },
      onDragLeave() {
        setState(idle);
      },
      onDrop() {
        setState(idle);
      },
    });
  });

  return (
    <>
      <div class="relative" role="columnheader">
        <div
          ref={ref}
          data-column-id={props.id}
          class={`flex h-full w-full items-center ${stateStyles[state().type] ?? ''}`}
        >
          {props.children}
        </div>
        {state().type === 'is-dragging-over' && state().closestEdge ? (
          <DropIndicator edge={state().closestEdge!} gap="0px" />
        ) : null}
      </div>
      {state().type === 'preview' ? (
        <Portal mount={state().container}>
          <DragOverlay content={props.content} />
        </Portal>
      ) : null}
    </>
  );
}

function DragOverlay(props: { content: string }) {
  return <div class="rounded bg-white p-2">{props.content}</div>;
}
