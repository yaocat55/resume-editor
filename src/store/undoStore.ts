/**
 * undoStore — Undo/Redo 历史栈
 *
 * 独立于 resumeStore，不持久化。
 * 最大 30 步历史，由 useUndo hook 自动订阅 resume 变更并推入快照。
 */
import { create } from 'zustand'
import type { Resume } from '../types/resume'

const MAX_HISTORY = 30

interface UndoStore {
  past: Resume[]
  future: Resume[]
  pushState: (snapshot: Resume) => void
  undo: (current: Resume) => Resume | null
  redo: (current: Resume) => Resume | null
  clear: () => void
}

const useUndoStore = create<UndoStore>((set, get) => ({
  past: [],
  future: [],

  pushState: (snapshot) =>
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    })),

  undo: (current) => {
    const { past } = get()
    if (past.length === 0) return null
    const snapshot = past[past.length - 1]
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [current, ...s.future],
    }))
    return snapshot
  },

  redo: (current) => {
    const { future } = get()
    if (future.length === 0) return null
    const snapshot = future[0]
    set((s) => ({
      past: [...s.past, current],
      future: s.future.slice(1),
    }))
    return snapshot
  },

  clear: () => set({ past: [], future: [] }),
}))

export default useUndoStore
