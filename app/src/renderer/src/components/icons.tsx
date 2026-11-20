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
