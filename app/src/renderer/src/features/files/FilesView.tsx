import { useMemo } from 'react'
import { ChevronDown, ChevronRight, File, Folder, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoute } from '@/store/route'
import { useUi } from '@/store/ui'
import { useVault } from '@/store/vault'

const NONE: string[] = []

interface Node {
  name: string
  path: string
  children: Node[]
  file: boolean
}

function buildTree(paths: string[]): Node[] {
  const root: Node = { name: '', path: '', children: [], file: false }
  for (const p of paths) {
    let cur = root
    const parts = p.split('/')
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join('/')
      const file = i === parts.length - 1
      let next = cur.children.find((c) => c.name === part && c.file === file)
      if (!next) {
        next = { name: part, path, children: [], file }
        cur.children.push(next)
      }
      cur = next
    })
  }
  const sort = (n: Node): void => {
    n.children.sort((a, b) => (a.file === b.file ? a.name.localeCompare(b.name) : a.file ? 1 : -1))
    n.children.forEach(sort)
  }
  sort(root)
  return root.children
}

function Row({ node, depth }: { node: Node; depth: number }) {
  const expanded = useUi((s) => s.expanded.has(node.path))
  const toggle = useUi((s) => s.toggle)
  const go = useRoute((s) => s.go)
  const summary = useVault((s) => s.byPath.get(node.path))
  const pad = { paddingLeft: 12 + depth * 18 }
  if (node.file) {
    return (
      <li>
        <button
          style={pad}
          onClick={() => go({ kind: 'file', path: node.path })}
          className="hover:bg-accent/60 flex w-full items-center gap-2 py-1 pr-3 text-left text-[14px]"
        >
          <File className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <span className="truncate">{node.name}</span>
          {summary?.restricted && <Lock className="text-muted-foreground size-3 shrink-0" aria-label="Private" />}
          {summary && !summary.restricted && (
            <span className="text-muted-foreground truncate text-[13px]">· {summary.title}</span>
          )}
        </button>
      </li>
    )
  }
  return (
    <li>
      <button
        style={pad}
        onClick={() => toggle(node.path)}
        aria-expanded={expanded}
        className="hover:bg-secondary flex w-full items-center gap-1.5 py-1 pr-3 text-left text-[14px] font-medium"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <Folder className={cn('size-4', expanded ? 'text-link' : 'text-muted-foreground')} aria-hidden />
        {node.name}
      </button>
      {expanded && (
        <ul>
          {node.children.map((c) => (
            <Row key={c.path} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

/** The vault's files as folders, for anything the sections don't cover (REQUIREMENTS 2.1 item 12). */
export function FilesView() {
  const paths = useVault((s) => s.snapshot?.paths ?? NONE)
  const tree = useMemo(() => buildTree(paths), [paths])
  return (
    <div className="px-8 py-8">
      <p className="eyebrow mb-3">Vault</p>
      <h1 className="mb-2 text-[30px]">All files</h1>
      <p className="text-muted-foreground mb-6 text-[14px]">
        Every markdown file in the vault, including the indexes, change logs and the rules Claude follows.
      </p>
      <ul className="rounded-[12px] border py-2">
        {tree.map((n) => (
          <Row key={n.path} node={n} depth={0} />
        ))}
      </ul>
    </div>
  )
}
