/**
 * Client-side AI chat engine for LániCAD.
 * Re-exports from the new modular AI engine.
 */

export type { ChatMessage } from '@/lib/chat/types'
export { getLocalReplyLegacy as getLocalReply } from '@/lib/chat/ai-engine'
