import { useCallback, useEffect, useRef } from 'react'
import useResumeStore from '../store/resumeStore'
import useUndoStore from '../store/undoStore'

/**
 * Undo/Redo 快捷键 + 自动快照订阅
 */
export function useUndo() {
  const undoAction = useUndoStore((s) => s.undo)
  const redoAction = useUndoStore((s) => s.redo)
  const pushState = useUndoStore((s) => s.pushState)
  const undoPast = useUndoStore((s) => s.past)
  const undoFuture = useUndoStore((s) => s.future)

  const skipUndoRef = useRef(false)
  const pushRef = useRef(pushState)
  pushRef.current = pushState

  // 订阅 resume 变更 → 自动推入 undo 栈（在 React 渲染流之外）
  useEffect(() => {
    return useResumeStore.subscribe(
      (s) => s.resume,
      (resume, prevResume) => {
        if (!skipUndoRef.current) {
          pushRef.current(prevResume)
        }
        skipUndoRef.current = false
      }
    )
  }, [])

  const handleUndo = useCallback(() => {
    skipUndoRef.current = true
    const current = useResumeStore.getState().resume
    const snapshot = undoAction(current)
    if (snapshot) useResumeStore.getState().importResume(snapshot)
  }, [undoAction])

  const handleRedo = useCallback(() => {
    skipUndoRef.current = true
    const current = useResumeStore.getState().resume
    const snapshot = redoAction(current)
    if (snapshot) useResumeStore.getState().importResume(snapshot)
  }, [redoAction])

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) { handleRedo(); e.preventDefault() }
        else { handleUndo(); e.preventDefault() }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo(); e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo])

  return {
    canUndo: undoPast.length > 0,
    canRedo: undoFuture.length > 0,
    handleUndo,
    handleRedo,
  }
}
