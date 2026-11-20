import { memo, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { resolveLink } from '@shared/refs'
import { api } from '@/lib/api'
import { useRoute } from '@/store/route'
import { useVault } from '@/store/vault'

/** Drops a leading `# Title` (the page header already shows it) and HTML comments. */
export function prepareBody(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*#\s+[^\n]*\n/, '')
}

function makeComponents(docPath: string, paths: Set<string>, go: (path: string) => void): Components {
  return {
    h1: (p) => <h2 className="mt-6 mb-2 text-xl leading-tight first:mt-0">{p.children}</h2>,
    h2: (p) => <h2 className="mt-6 mb-2 text-xl leading-tight first:mt-0">{p.children}</h2>,
    h3: (p) => <h3 className="mt-4 mb-1.5 text-[17px] leading-snug first:mt-0">{p.children}</h3>,
    p: (p) => <p className="my-3 first:mt-0 last:mb-0">{p.children}</p>,
    ul: (p) => <ul className="my-3 list-disc space-y-1 pl-6">{p.children}</ul>,
    ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-6">{p.children}</ol>,
    blockquote: (p) => (
      <blockquote className="border-primary-light text-muted-foreground my-3 border-l-2 pl-4">
        {p.children}
      </blockquote>
    ),
    hr: () => <hr className="my-5" />,
    code: (p) => (
      <code className="bg-secondary rounded px-1 py-0.5 font-mono text-[13px]">{p.children}</code>
    ),
    pre: (p) => (
      <pre className="bg-secondary my-3 overflow-x-auto rounded-lg p-3 font-mono text-[13px] [&_code]:bg-transparent [&_code]:p-0">
        {p.children}
      </pre>
    ),
    table: (p) => (
      <div className="my-4 overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-[14px] [overflow-wrap:normal]">{p.children}</table>
      </div>
    ),
    thead: (p) => <thead className="bg-secondary text-left">{p.children}</thead>,
    th: (p) => (
      <th className="border-b px-3 py-2 text-[13px] font-semibold whitespace-nowrap">{p.children}</th>
    ),
    td: (p) => <td className="border-b px-3 py-2 align-top [word-break:keep-all]">{p.children}</td>,
    a: ({ href, children }) => {
      if (!href) return <span>{children}</span>
      if (href.startsWith('#')) return <span className="text-link">{children}</span>
      if (/^https?:/i.test(href)) {
        return (
          <a
            href={href}
            title={`${href} (opens in your browser)`}
            onClick={(e) => {
              e.preventDefault()
              void api.openExternal(href)
            }}
            className="text-link hover:text-link-hover underline underline-offset-2"
          >
            {children}
          </a>
        )
      }
      const target = resolveLink(docPath, href)
      if (target && paths.has(target)) {
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              go(target)
            }}
            className="text-link hover:text-link-hover underline underline-offset-2"
          >
            {children}
          </a>
        )
      }
      return (
        <span
          title="Not in the vault"
          className="decoration-muted-foreground/60 underline decoration-dotted underline-offset-2"
        >
          {children}
        </span>
      )
    }
  }
}

/** Vault markdown: GFM tables, links that open records in the app, no raw HTML. */
export const Markdown = memo(function Markdown({ source, docPath }: { source: string; docPath: string }) {
  const paths = useVault((s) => s.pathSet)
  const go = useRoute((s) => s.go)
  const components = useMemo(
    () => makeComponents(docPath, paths, (path) => go({ kind: 'file', path })),
    [docPath, paths, go]
  )
  return (
    <div className="text-[15px] leading-relaxed [overflow-wrap:anywhere]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {source}
      </ReactMarkdown>
    </div>
  )
})
