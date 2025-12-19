import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { JSX } from 'solid-js';

type Orientation = 'horizontal' | 'vertical';

const EDGE_TO_ORIENTATION: Record<Edge, Orientation> = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
};

const ORIENTATION_STYLES: Record<Orientation, JSX.HTMLAttributes<HTMLElement>['class']> = {
  horizontal:
    'h-(--line-thickness) left-(--terminal-radius) right-0 before:left-(--negative-terminal-size)',
  vertical:
    'w-(--line-thickness) top-(--terminal-radius) bottom-0 before:top-(--negative-terminal-size)',
};

const EDGE_STYLES: Record<Edge, JSX.HTMLAttributes<HTMLElement>['class']> = {
  top: 'top-(--line-offset) before:top-(--offset-terminal)',
  right: 'right-(--line-offset) before:right-(--offset-terminal)',
  bottom: 'bottom-(--line-offset) before:bottom-(--offset-terminal)',
  left: 'left-(--line-offset) before:left-(--offset-terminal)',
};

const STROKE_SIZE = 2;
const TERMINAL_SIZE = 8;
const OFFSET_TO_ALIGN_TERMINAL_WITH_LINE = (STROKE_SIZE - TERMINAL_SIZE) / 2;

/**
 * This is a tailwind port of `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box`
 */
export function DropIndicator(props: { edge: Edge; gap: string }) {
  return (
    <div
      style={
        {
          '--line-thickness': `${STROKE_SIZE}px`,
          '--line-offset': `calc(-0.5 * (${props.gap} + ${STROKE_SIZE}px))`,
          '--terminal-size': `${TERMINAL_SIZE}px`,
          '--terminal-radius': `${TERMINAL_SIZE / 2}px`,
          '--negative-terminal-size': `-${TERMINAL_SIZE}px`,
          '--offset-terminal': `${OFFSET_TO_ALIGN_TERMINAL_WITH_LINE}px`,
        } as JSX.CSSProperties
      }
      class={`pointer-events-none absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-(--terminal-size) before:rounded-full before:border-(length:--line-thickness) before:border-solid before:border-blue-700 before:content-[''] ${ORIENTATION_STYLES[EDGE_TO_ORIENTATION[props.edge]]} ${[EDGE_STYLES[props.edge]]}`}
    />
  );
}
