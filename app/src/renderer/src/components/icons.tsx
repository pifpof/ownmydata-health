import {
  CalendarDays,
  Ear,
  FileText,
  FlaskConical,
  FolderHeart,
  Hospital,
  ListChecks,
  NotebookPen,
  Pill,
  Scale,
  Scissors,
  Shapes,
  ShieldAlert,
  Stethoscope,
  Syringe,
  UserRound,
  Users,
  type LucideIcon
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  'folder-heart': FolderHeart,
  stethoscope: Stethoscope,
  pill: Pill,
  'shield-alert': ShieldAlert,
  'flask-conical': FlaskConical,
  'calendar-days': CalendarDays,
  scissors: Scissors,
  syringe: Syringe,
  users: Users,
  'user-round': UserRound,
  hospital: Hospital,
  ear: Ear,
  'file-text': FileText,
  'notebook-pen': NotebookPen,
  scale: Scale,
  'list-checks': ListChecks,
  shapes: Shapes
}

export function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Shapes
  return <Icon className={className} aria-hidden />
}

/** Pastel tile + strong icon colour per section tone. Static strings so Tailwind keeps them. */
const TONES: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-600',
  orange: 'bg-orange-100 text-orange-600',
  amber: 'bg-amber-100 text-amber-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  lime: 'bg-lime-100 text-lime-700',
  green: 'bg-green-100 text-green-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  teal: 'bg-teal-100 text-teal-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  sky: 'bg-sky-100 text-sky-700',
  indigo: 'bg-indigo-100 text-indigo-600',
  violet: 'bg-violet-100 text-violet-600',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
  slate: 'bg-slate-100 text-slate-600'
}

/** A section's icon in its coloured tile, as on the Overview cards. */
export function SectionTile({
  icon,
  tone,
  size = 'md'
}: {
  icon: string
  tone: string
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={
        `${TONES[tone] ?? TONES.slate} inline-flex shrink-0 items-center justify-center ` +
        (size === 'md' ? 'size-10 rounded-[10px] [&_svg]:size-5' : 'size-7 rounded-[8px] [&_svg]:size-4')
      }
    >
      <SectionIcon name={icon} />
    </span>
  )
}
