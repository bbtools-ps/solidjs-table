import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { JSX } from 'solid-js';

type Orientation = 'horizontal' | 'vertical';

const edgeToOrientationMap: Record<Edge, Orientation> = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
};

const orientationStyles: Record<Orientation, JSX.HTMLAttributes<HTMLElement>['class']> = {
  horizontal:
    'h-[var(--line-thickness)] left-[var(--terminal-radius)] right-0 before:left-[var(--negative-terminal-size)]',
  vertical:
    'w-[var(--line-thickness)] top-[var(--terminal-radius)] bottom-0 before:top-[var(--negative-terminal-size)]',
};

const edgeStyles: Record<Edge, JSX.HTMLAttributes<HTMLElement>['class']> = {
  top: 'top-[var(--line-offset)] before:top-[var(--offset-terminal)]',
  right: 'right-[var(--line-offset)] before:right-[var(--offset-terminal)]',
  bottom: 'bottom-[var(--line-offset)] before:bottom-[var(--offset-terminal)]',
  left: 'left-[var(--line-offset)] before:left-[var(--offset-terminal)]',
};

const strokeSize = 2;
const terminalSize = 8;
const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;

/**
 * This is a tailwind port of `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box`
 */
export function DropIndicator(props: { edge: Edge; gap: string }) {
  return (
    <div
      style={
        {
          '--line-thickness': `${strokeSize}px`,
          '--line-offset': `calc(-0.5 * (${props.gap} + ${strokeSize}px))`,
          '--terminal-size': `${terminalSize}px`,
          '--terminal-radius': `${terminalSize / 2}px`,
          '--negative-terminal-size': `-${terminalSize}px`,
          '--offset-terminal': `${offsetToAlignTerminalWithLine}px`,
        } as JSX.CSSProperties
      }
      class={`pointer-events-none absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-[(--terminal-size)] before:rounded-full before:border-[length:(--line-thickness)] before:border-solid before:border-blue-700 before:content-[''] ${orientationStyles[edgeToOrientationMap[props.edge]]} ${[edgeStyles[props.edge]]}`}
    />
  );
}
