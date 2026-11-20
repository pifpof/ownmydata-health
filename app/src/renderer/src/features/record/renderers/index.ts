import type { ComponentType } from 'react'
import { GenericRecord } from './GenericRecord'
import type { RecordRendererProps } from './types'

/**
 * type → page component (REQUIREMENTS 7). v0 has only the generic page. A custom Episode or Lab
 * report page later is one new file in this folder plus one line here.
 */
const RENDERERS: Record<string, ComponentType<RecordRendererProps>> = {}

export function rendererFor(type: string | null): ComponentType<RecordRendererProps> {
  return (type && RENDERERS[type]) || GenericRecord
}
