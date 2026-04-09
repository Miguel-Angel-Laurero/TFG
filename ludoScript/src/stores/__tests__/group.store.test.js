// Unit tests for group.store.js (Pinia)
// groupService is mocked so no real HTTP requests are made

import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { useGroupStore } from '../group.store'

// Mock the groupService module
vi.mock('@/api/group.service', () => ({
  groupService: {
    getMyGroups: vi.fn(),
    createGroup: vi.fn(),
    joinGroup: vi.fn(),
    leaveGroup: vi.fn(),
    deleteGroup: vi.fn(),
  },
}))

import { groupService } from '@/api/group.service'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─── fetchMyGroups ────────────────────────────────────────────────────────────

describe('fetchMyGroups', () => {
  it('populates groups on success', async () => {
    const mockGroups = [{ id: 1, name: 'Grupo A' }, { id: 2, name: 'Grupo B' }]
    groupService.getMyGroups.mockResolvedValue({ data: mockGroups })

    const store = useGroupStore()
    await store.fetchMyGroups()

    expect(store.groups).toEqual(mockGroups)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets error message on failure', async () => {
    groupService.getMyGroups.mockRejectedValue({
      response: { data: { message: 'No autorizado' } },
    })

    const store = useGroupStore()
    await store.fetchMyGroups()

    expect(store.groups).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('No autorizado')
  })

  it('uses fallback error message when response has no message', async () => {
    groupService.getMyGroups.mockRejectedValue(new Error('Network error'))

    const store = useGroupStore()
    await store.fetchMyGroups()

    expect(store.error).toBe('Error al cargar grupos')
  })

  it('sets loading to true during the request', async () => {
    let capturedLoading = false
    groupService.getMyGroups.mockImplementation(() => {
      capturedLoading = useGroupStore().loading
      return Promise.resolve({ data: [] })
    })

    const store = useGroupStore()
    await store.fetchMyGroups()

    expect(capturedLoading).toBe(true)
    expect(store.loading).toBe(false)
  })
})

// ─── createGroup ─────────────────────────────────────────────────────────────

describe('createGroup', () => {
  it('adds the new group to the list and returns it', async () => {
    const newGroup = { id: 10, name: 'Nuevo Grupo' }
    groupService.createGroup.mockResolvedValue({ data: newGroup })

    const store = useGroupStore()
    const result = await store.createGroup({ name: 'Nuevo Grupo' })

    expect(result).toEqual(newGroup)
    expect(store.groups).toContainEqual(newGroup)
    expect(store.loading).toBe(false)
  })

  it('sets error and rethrows on failure', async () => {
    const axiosError = { response: { data: { message: 'Nombre muy corto' } } }
    groupService.createGroup.mockRejectedValue(axiosError)

    const store = useGroupStore()

    await expect(store.createGroup({ name: 'ab' })).rejects.toEqual(axiosError)
    expect(store.error).toBe('Nombre muy corto')
    expect(store.loading).toBe(false)
  })

  it('uses fallback error message when response has no message', async () => {
    groupService.createGroup.mockRejectedValue(new Error('Network error'))

    const store = useGroupStore()

    await expect(store.createGroup({ name: 'Grupo' })).rejects.toThrow()
    expect(store.error).toBe('Error al crear grupo')
  })
})

// ─── joinGroup ────────────────────────────────────────────────────────────────

describe('joinGroup', () => {
  it('adds the joined group to the list and returns it', async () => {
    const joinedGroup = { id: 7, name: 'Grupo Ajeno' }
    groupService.joinGroup.mockResolvedValue({ data: joinedGroup })

    const store = useGroupStore()
    const result = await store.joinGroup('invite-code-123')

    expect(result).toEqual(joinedGroup)
    expect(store.groups).toContainEqual(joinedGroup)
    expect(groupService.joinGroup).toHaveBeenCalledWith('invite-code-123')
  })

  it('sets error and rethrows on failure', async () => {
    const axiosError = { response: { data: { message: 'Código inválido' } } }
    groupService.joinGroup.mockRejectedValue(axiosError)

    const store = useGroupStore()

    await expect(store.joinGroup('bad-code')).rejects.toEqual(axiosError)
    expect(store.error).toBe('Código inválido')
  })

  it('uses fallback error message when response has no message', async () => {
    groupService.joinGroup.mockRejectedValue(new Error('Network error'))

    const store = useGroupStore()

    await expect(store.joinGroup('code')).rejects.toThrow()
    expect(store.error).toBe('Error al unirse al grupo')
  })
})

// ─── leaveGroup ───────────────────────────────────────────────────────────────

describe('leaveGroup', () => {
  it('removes the group from the list on success', async () => {
    groupService.leaveGroup.mockResolvedValue({})

    const store = useGroupStore()
    store.groups = [{ id: 3, name: 'A' }, { id: 4, name: 'B' }]

    await store.leaveGroup(3)

    expect(store.groups).toEqual([{ id: 4, name: 'B' }])
    expect(groupService.leaveGroup).toHaveBeenCalledWith(3)
  })

  it('sets error and rethrows on failure', async () => {
    const axiosError = { response: { data: { message: 'No perteneces a este grupo' } } }
    groupService.leaveGroup.mockRejectedValue(axiosError)

    const store = useGroupStore()

    await expect(store.leaveGroup(99)).rejects.toEqual(axiosError)
    expect(store.error).toBe('No perteneces a este grupo')
  })

  it('uses fallback error message when response has no message', async () => {
    groupService.leaveGroup.mockRejectedValue(new Error('Network error'))

    const store = useGroupStore()

    await expect(store.leaveGroup(1)).rejects.toThrow()
    expect(store.error).toBe('Error al abandonar grupo')
  })
})

// ─── deleteGroup ──────────────────────────────────────────────────────────────

describe('deleteGroup', () => {
  it('removes the group from the list on success', async () => {
    groupService.deleteGroup.mockResolvedValue({})

    const store = useGroupStore()
    store.groups = [{ id: 5, name: 'A' }, { id: 6, name: 'B' }]

    await store.deleteGroup(5)

    expect(store.groups).toEqual([{ id: 6, name: 'B' }])
    expect(groupService.deleteGroup).toHaveBeenCalledWith(5)
  })

  it('sets error and rethrows on failure', async () => {
    const axiosError = { response: { data: { message: 'No autorizado' } } }
    groupService.deleteGroup.mockRejectedValue(axiosError)

    const store = useGroupStore()

    await expect(store.deleteGroup(99)).rejects.toEqual(axiosError)
    expect(store.error).toBe('No autorizado')
  })

  it('uses fallback error message when response has no message', async () => {
    groupService.deleteGroup.mockRejectedValue(new Error('Network error'))

    const store = useGroupStore()

    await expect(store.deleteGroup(1)).rejects.toThrow()
    expect(store.error).toBe('Error al eliminar grupo')
  })
})
