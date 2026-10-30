import type { Root, Paragraph } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n|$)/i

// Turns GitHub-style `> [!NOTE]` blockquotes into styled alert blocks
export const remarkAlerts: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children[0]
      if (first?.type !== 'paragraph') return
      const lead = first.children[0]
      if (lead?.type !== 'text') return

      const match = ALERT_MARKER.exec(lead.value)
      if (!match) return

      const kind = match[1].toLowerCase()
      lead.value = lead.value.slice(match[0].length)
      if (lead.value === '') first.children.shift()
      if (first.children.length === 0) node.children.shift()

      const title: Paragraph = {
        type: 'paragraph',
        children: [{ type: 'text', value: kind[0].toUpperCase() + kind.slice(1) }],
        data: { hProperties: { className: ['markdown-alert-title'] } },
      }
      node.children.unshift(title)
      node.data = {
        hName: 'div',
        hProperties: { className: ['markdown-alert', `markdown-alert-${kind}`] },
      }
    })
  }
}
