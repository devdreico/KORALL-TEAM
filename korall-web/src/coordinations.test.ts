import { describe, expect, it } from 'vitest'
import {
  initialCoordinations,
  loadCoordinations,
  saveCoordinations,
  type Coordination,
} from './coordinations'

function createStorage(initialValue?: string) {
  const values = new Map<string, string>()
  if (initialValue !== undefined) values.set('korall.coordinations.v1', initialValue)

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

describe('coordinaciones persistidas', () => {
  it('usa los datos de demostración si todavía no hay almacenamiento', () => {
    expect(loadCoordinations(createStorage())).toEqual(initialCoordinations)
  })

  it('guarda y recupera las coordinaciones con sus campos opcionales', () => {
    const storage = createStorage()
    const items: Coordination[] = [
      {
        ...initialCoordinations[0],
        id: 'coord-test',
        owner: 'Equipo local',
        dueDate: '2026-11-02',
        description: 'Preparar la siguiente reunión.',
      },
    ]

    expect(saveCoordinations(items, storage)).toBe(true)
    expect(loadCoordinations(storage)).toEqual(items)
  })

  it('recupera el conjunto de demostración si el JSON está corrupto', () => {
    expect(loadCoordinations(createStorage('{not-json'))).toEqual(initialCoordinations)
  })

  it('rechaza registros con estados o fechas que no reconoce', () => {
    const invalidItems = [
      { ...initialCoordinations[0], status: 'waiting' },
      { ...initialCoordinations[0], dueDate: '2026-02-31' },
    ]

    expect(loadCoordinations(createStorage(JSON.stringify(invalidItems)))).toEqual(initialCoordinations)
  })

  it('degrada sin bloquear la aplicación si el navegador rechaza el almacenamiento', () => {
    const unavailableStorage = {
      getItem: () => { throw new Error('Storage unavailable') },
      setItem: () => { throw new Error('Storage unavailable') },
    }

    expect(loadCoordinations(unavailableStorage)).toEqual(initialCoordinations)
    expect(saveCoordinations(initialCoordinations, unavailableStorage)).toBe(false)
  })
})