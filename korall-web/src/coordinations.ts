export type Sector = 'gaming' | 'football'
export type SectorFilter = 'all' | Sector
export type CoordinationStatus = 'new' | 'planned' | 'in-progress' | 'blocked' | 'completed'

export type Coordination = {
  id: string
  title: string
  sector: Sector
  location: string
  status: CoordinationStatus
  createdAt: string
  owner?: string
  dueDate?: string
  description?: string
}

export const coordinationStatuses: { value: CoordinationStatus; label: string }[] = [
  { value: 'new', label: 'Nueva' },
  { value: 'planned', label: 'Planificada' },
  { value: 'in-progress', label: 'En seguimiento' },
  { value: 'blocked', label: 'Bloqueada' },
  { value: 'completed', label: 'Completada' },
]

export const initialCoordinations: Coordination[] = [
  {
    id: 'demo-gaming-onboarding',
    title: 'Integración de nuevos afiliados',
    sector: 'gaming',
    location: 'Red internacional',
    status: 'in-progress',
    createdAt: '2026-10-27T12:00:00.000Z',
    owner: 'Equipo gaming',
  },
  {
    id: 'demo-football-community',
    title: 'Próxima jornada comunitaria',
    sector: 'football',
    location: 'Colombia',
    status: 'planned',
    createdAt: '2026-10-27T12:00:00.000Z',
    owner: 'Equipo microfútbol',
  },
  {
    id: 'demo-gaming-calendar',
    title: 'Alineación de calendario competitivo',
    sector: 'gaming',
    location: 'Global',
    status: 'planned',
    createdAt: '2026-10-27T12:00:00.000Z',
    owner: 'Coordinación global',
  },
]

const storageKey = 'korall.coordinations.v1'

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>

function isCoordination(value: unknown): value is Coordination {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const isValidDate = (date: unknown) =>
    typeof date === 'string' && !Number.isNaN(Date.parse(date))
  const isValidDateOnly = (date: unknown) => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date
  }
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    (item.sector === 'gaming' || item.sector === 'football') &&
    typeof item.location === 'string' &&
    coordinationStatuses.some(({ value: status }) => status === item.status) &&
    isValidDate(item.createdAt) &&
    (item.owner === undefined || typeof item.owner === 'string') &&
    (item.dueDate === undefined || isValidDateOnly(item.dueDate)) &&
    (item.description === undefined || typeof item.description === 'string')
  )
}

export function loadCoordinations(
  storage?: StoragePort,
  fallback: Coordination[] = initialCoordinations,
): Coordination[] {
  try {
    const source = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    const stored = source?.getItem(storageKey)
    if (!stored) return fallback

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every(isCoordination)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

export function saveCoordinations(items: Coordination[], storage?: StoragePort): boolean {
  try {
    const destination = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    if (!destination) return false
    destination.setItem(storageKey, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

export function createCoordinationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createCoordination(
  details: Omit<Coordination, 'id' | 'createdAt'>,
): Coordination {
  return {
    ...details,
    id: createCoordinationId(),
    createdAt: new Date().toISOString(),
  }
}