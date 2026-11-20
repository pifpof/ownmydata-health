import { Markdown, prepareBody } from '@/components/Markdown'
import { KeyFacts, LinkedFrom, RawData, Sources } from '../parts'
import type { RecordRendererProps } from './types'

/** The fallback record page: body on the left, facts, sources and backlinks on the right. */
export function GenericRecord({ file }: RecordRendererProps) {
  const fhir = file.frontmatter?.fhir
  return (
    <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {file.body && <Markdown source={prepareBody(file.body)} docPath={file.path} />}
      </div>
      <aside className="mt-8 min-w-0 lg:mt-0">
        <KeyFacts fhir={fhir} />
        <Sources items={file.sources} verified={file.verified} />
        <LinkedFrom items={file.linkedFrom} />
        <RawData file={file} />
      </aside>
    </div>
  )
}
