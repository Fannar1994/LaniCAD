/**
 * Chat↔CAD bridge context.
 * Allows the chat AI to dispatch CAD actions that the DrawingPage can listen to.
 */

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import type { CadAction } from '@/lib/chat/types'

interface ChatCadContextValue {
  /** Last dispatched action (consumed by DrawingPage) */
  pendingAction: CadAction | null
  /** Dispatch a CAD action from chat */
  dispatchCadAction: (action: CadAction) => void
  /** Clear the pending action after consumption */
  clearPendingAction: () => void
}

const ChatCadContext = createContext<ChatCadContextValue | null>(null)

export function ChatCadProvider({ children }: { children: ReactNode }) {
  const [pendingAction, setPendingAction] = useState<CadAction | null>(null)

  const dispatchCadAction = useCallback((action: CadAction) => {
    setPendingAction(action)
  }, [])

  const clearPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  return (
    <ChatCadContext.Provider value={{ pendingAction, dispatchCadAction, clearPendingAction }}>
      {children}
    </ChatCadContext.Provider>
  )
}

export function useChatCad() {
  const ctx = useContext(ChatCadContext)
  if (!ctx) throw new Error('useChatCad must be used within ChatCadProvider')
  return ctx
}
