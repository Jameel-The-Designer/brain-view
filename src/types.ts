export interface Company {
  id: string
  name: string
  tagline: string
  location: string
  positioning: string
  pitch: string
  target_verticals: string[]
  value_model: string
  status: string
  updated_at: string
}

export interface Person {
  id: string
  name: string
  alias: string | null
  role: string
  responsibilities: string[]
  github: string | null
  notes: string | null
  sort_order: number
}

export interface Client {
  id: string
  name: string
  status: string
  mrr_zar: number | null
  deliverables: string[] | null
  stack: string[] | null
  notes: string | null
  url: string | null
  sort_order: number
  updated_at: string
}

export interface Goal {
  id: string
  label: string
  current_value: number
  target_value: number
  unit: string
  description: string | null
  milestone: boolean
  achieved: boolean
  sort_order: number
}

export interface Project {
  id: string
  name: string
  status: string
  url: string | null
  stack: string[] | null
  description: string | null
  notes: string | null
  sort_order: number
  updated_at: string
}

export interface StackItem {
  id: string
  name: string
  category: string
  notes: string | null
  sort_order: number
}

export interface ConversationEntry {
  id: string
  date: string
  topic: string
  decision: string | null
  source: string
  tags: string[] | null
  created_at: string
}

export type Section = 'overview' | 'clients' | 'goals' | 'projects' | 'stack' | 'log'
