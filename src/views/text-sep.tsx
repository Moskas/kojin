import type { FC } from 'hono/jsx'

// separator hidden by CSS, keeps adjacent inline elements readable in text browsers
export const Sep: FC<{ text?: string }> = ({ text = ' · ' }) => <span class="text-sep">{text}</span>

export function joinNodes(nodes: unknown[], text = ', '): unknown[] {
  return nodes.flatMap((node, i) => (i === 0 ? [node] : [<Sep text={text} />, node]))
}

// marks the active filter chip for text browsers; aria-current covers screen readers
export const Selected: FC<{ active: boolean }> = ({ active }) =>
  active ? <Sep text=" (selected)" /> : null
