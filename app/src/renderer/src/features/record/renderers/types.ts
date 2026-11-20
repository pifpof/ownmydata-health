import type { OpenedFile } from '@shared/vault-model'

export interface RecordRendererProps {
  /** A readable, non-hidden record (the gate and problems are handled before this). */
  file: OpenedFile
}
