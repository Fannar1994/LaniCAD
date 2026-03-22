/** Chat system types for LániCAD AI assistant */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  actions?: CadAction[]
  timestamp?: number
}

export type CadActionType =
  | 'draw_rect'
  | 'draw_circle'
  | 'draw_line'
  | 'draw_text'
  | 'place_fence'
  | 'place_scaffold'
  | 'place_formwork'
  | 'place_rolling'
  | 'place_ceiling'
  | 'navigate'
  | 'set_equipment'
  | 'clear_canvas'

export interface CadAction {
  type: CadActionType
  label: string
  params: Record<string, unknown>
}

export type Intent =
  | 'greet'
  | 'help'
  | 'draw'
  | 'place_equipment'
  | 'ask_product'
  | 'ask_price'
  | 'calculate'
  | 'recommend'
  | 'safety'
  | 'standard'
  | 'assembly'
  | 'navigate'
  | 'cad_tool'
  | 'unknown'

export interface ParsedIntent {
  intent: Intent
  entities: Record<string, string | number | boolean>
  equipment?: 'fence' | 'scaffold' | 'rolling' | 'formwork' | 'ceiling'
  confidence: number
}
