import { useState, useEffect, useId } from 'react'
import { supabase } from '../lib/supabase'
import type { Company, Person, Client, Goal, Project, StackItem, ConversationEntry } from '../types'

function useRealtimeTable<T>(table: string, orderBy = 'sort_order') {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const id = useId()

  useEffect(() => {
    const fetchData = () => {
      supabase
        .from(table)
        .select('*')
        .order(orderBy)
        .then(({ data }) => {
          if (data) setData(data as T[])
          setLoading(false)
        })
    }
    fetchData()
    const channelName = `${table}-${id}`
    const ch = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [table, orderBy, id])

  return { data, loading }
}

export function useCompany() {
  const [data, setData] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const id = useId()

  useEffect(() => {
    const fetchData = () => {
      supabase
        .from('company')
        .select('*')
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) setData(data as Company)
          setLoading(false)
        })
    }
    fetchData()
    const ch = supabase
      .channel(`company-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  return { data, loading }
}

export function usePeople() {
  return useRealtimeTable<Person>('people')
}

export function useClients() {
  return useRealtimeTable<Client>('clients')
}

export function useGoals() {
  return useRealtimeTable<Goal>('goals')
}

export function useProjects() {
  return useRealtimeTable<Project>('projects')
}

export function useStackItems() {
  return useRealtimeTable<StackItem>('stack_items')
}

export function useConversationLog() {
  return useRealtimeTable<ConversationEntry>('conversation_log', 'created_at')
}
