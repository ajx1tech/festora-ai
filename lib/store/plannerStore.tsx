'use client'

import type {
  AiBundle,
  BudgetLine,
  EventPlan,
  EventProfile,
  EventType,
  Expense,
  RunOfShowItem,
  Task,
  Vendor,
} from '@/lib/domain/schemas'
import { EventPlanSchema } from '@/lib/domain/schemas'
import { rebalance } from '@/lib/engines/budgetEngine'
import type { ReadinessResult } from '@/lib/engines/readinessEngine'
import { computeReadiness } from '@/lib/engines/readinessEngine'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { z } from 'zod'

export const STORAGE_KEY = 'festora:v1'
export const MAX_STORED_EVENTS = 5

/**
 * Storage schema for persistent state in localStorage.
 */
export const StoredDataSchema = z.object({
  schemaVersion: z.number().default(1),
  events: z.array(EventPlanSchema).max(MAX_STORED_EVENTS),
  activeEventId: z.string().nullable(),
})
export type StoredData = z.infer<typeof StoredDataSchema>

export interface PlannerState {
  events: EventPlan[]
  activeEventId: string | null
  hydrated: boolean
}

export type PlannerAction =
  | {
      type: 'HYDRATE'
      payload: { events: EventPlan[]; activeEventId: string | null }
    }
  | { type: 'CREATE_EVENT'; payload: { profile: EventProfile; now?: Date } }
  | { type: 'LOAD_SAMPLE'; payload: { kind: EventType; now?: Date } }
  | { type: 'UPDATE_PROFILE'; payload: { updates: Partial<EventProfile> } }
  | { type: 'TOGGLE_TASK'; payload: { taskId: string } }
  | { type: 'ADD_TASK'; payload: { task: Task } }
  | {
      type: 'UPDATE_TASK'
      payload: { taskId: string; updates: Partial<Task> }
    }
  | {
      type: 'UPDATE_BUDGET_LINE'
      payload: { lineId: string; updates: Partial<BudgetLine> }
    }
  | { type: 'LOCK_BUDGET_LINE'; payload: { lineId: string; locked: boolean } }
  | { type: 'ADD_EXPENSE'; payload: { expense: Expense } }
  | { type: 'UPDATE_VENDOR'; payload: { vendor: Vendor } }
  | { type: 'SET_AI_BUNDLE'; payload: { bundle: AiBundle } }
  | { type: 'SET_RUN_OF_SHOW'; payload: { items: RunOfShowItem[] } }
  | { type: 'DELETE_EVENT'; payload: { eventId: string } }
  | { type: 'SET_ACTIVE'; payload: { eventId: string } }
  | { type: 'IMPORT_JSON'; payload: { jsonString: string } }

/**
 * Pure reducer function for all event planning actions.
 *
 * @param state - Current planner state.
 * @param action - Action to perform.
 * @returns New planner state.
 */
export function plannerReducer(
  state: PlannerState,
  action: PlannerAction
): PlannerState {
  switch (action.type) {
    case 'HYDRATE': {
      return {
        ...state,
        events: action.payload.events.slice(0, MAX_STORED_EVENTS),
        activeEventId: action.payload.activeEventId,
        hydrated: true,
      }
    }

    case 'CREATE_EVENT': {
      const now = action.payload.now ?? new Date()
      const newPlan = createPlanFromProfile(action.payload.profile, now)
      const nextEvents = [
        newPlan,
        ...state.events.filter((e) => e.id !== newPlan.id),
      ].slice(0, MAX_STORED_EVENTS)
      return {
        ...state,
        events: nextEvents,
        activeEventId: newPlan.id,
      }
    }

    case 'LOAD_SAMPLE': {
      const now = action.payload.now ?? new Date()
      const profiles = createSampleProfiles(now)
      const sampleProfile = profiles[action.payload.kind]
      const newPlan = createPlanFromProfile(sampleProfile, now)
      const nextEvents = [
        newPlan,
        ...state.events.filter((e) => e.id !== newPlan.id),
      ].slice(0, MAX_STORED_EVENTS)
      return {
        ...state,
        events: nextEvents,
        activeEventId: newPlan.id,
      }
    }

    case 'UPDATE_PROFILE': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        return {
          ...plan,
          profile: {
            ...plan.profile,
            ...action.payload.updates,
          },
        }
      })
      return { ...state, events: nextEvents }
    }

    case 'TOGGLE_TASK': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const nextTasks = plan.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, done: !task.done }
            : task
        )
        return { ...plan, tasks: nextTasks }
      })
      return { ...state, events: nextEvents }
    }

    case 'ADD_TASK': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        return {
          ...plan,
          tasks: [...plan.tasks, action.payload.task],
        }
      })
      return { ...state, events: nextEvents }
    }

    case 'UPDATE_TASK': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const nextTasks = plan.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        )
        return { ...plan, tasks: nextTasks }
      })
      return { ...state, events: nextEvents }
    }

    case 'UPDATE_BUDGET_LINE': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const { lineId, updates } = action.payload
        let nextBudget = [...plan.budget]

        if (typeof updates.allocated === 'number') {
          nextBudget = rebalance(nextBudget, lineId, updates.allocated)
        }

        nextBudget = nextBudget.map((line) => {
          if (line.id !== lineId) return line
          return {
            ...line,
            ...updates,
          }
        })

        return { ...plan, budget: nextBudget }
      })
      return { ...state, events: nextEvents }
    }

    case 'LOCK_BUDGET_LINE': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const nextBudget = plan.budget.map((line) =>
          line.id === action.payload.lineId
            ? { ...line, locked: action.payload.locked }
            : line
        )
        return { ...plan, budget: nextBudget }
      })
      return { ...state, events: nextEvents }
    }

    case 'ADD_EXPENSE': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const expenses = [...plan.expenses, action.payload.expense]
        // Update spent on matching budget category
        const nextBudget = plan.budget.map((b) => {
          if (b.id !== action.payload.expense.categoryId) return b
          return {
            ...b,
            spent: b.spent + action.payload.expense.amount,
          }
        })
        return { ...plan, expenses, budget: nextBudget }
      })
      return { ...state, events: nextEvents }
    }

    case 'UPDATE_VENDOR': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        const nextVendors = plan.vendors.map((v) =>
          v.id === action.payload.vendor.id ? action.payload.vendor : v
        )
        return { ...plan, vendors: nextVendors }
      })
      return { ...state, events: nextEvents }
    }

    case 'SET_AI_BUNDLE': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        return { ...plan, aiBundle: action.payload.bundle }
      })
      return { ...state, events: nextEvents }
    }

    case 'SET_RUN_OF_SHOW': {
      if (!state.activeEventId) return state
      const nextEvents = state.events.map((plan) => {
        if (plan.id !== state.activeEventId) return plan
        return { ...plan, runOfShow: action.payload.items }
      })
      return { ...state, events: nextEvents }
    }

    case 'DELETE_EVENT': {
      const remaining = state.events.filter(
        (e) => e.id !== action.payload.eventId
      )
      const nextActiveId =
        state.activeEventId === action.payload.eventId
          ? (remaining[0]?.id ?? null)
          : state.activeEventId
      return {
        ...state,
        events: remaining,
        activeEventId: nextActiveId,
      }
    }

    case 'SET_ACTIVE': {
      const exists = state.events.some((e) => e.id === action.payload.eventId)
      if (!exists) return state
      return {
        ...state,
        activeEventId: action.payload.eventId,
      }
    }

    case 'IMPORT_JSON': {
      try {
        const parsed = JSON.parse(action.payload.jsonString)
        // Check if single plan
        const planResult = EventPlanSchema.safeParse(parsed)
        if (planResult.success) {
          const importedPlan = planResult.data
          const nextEvents = [
            importedPlan,
            ...state.events.filter((e) => e.id !== importedPlan.id),
          ].slice(0, MAX_STORED_EVENTS)
          return {
            ...state,
            events: nextEvents,
            activeEventId: importedPlan.id,
          }
        }

        // Check if full export
        const fullResult = StoredDataSchema.safeParse(parsed)
        if (fullResult.success) {
          return {
            ...state,
            events: fullResult.data.events.slice(0, MAX_STORED_EVENTS),
            activeEventId:
              fullResult.data.activeEventId ??
              fullResult.data.events[0]?.id ??
              null,
          }
        }
      } catch {
        // Corrupt or invalid JSON ignored without crashing
      }
      return state
    }

    default:
      return state
  }
}

export interface PlannerContextValue {
  state: PlannerState
  dispatch: React.Dispatch<PlannerAction>
  createEvent: (profile: EventProfile) => void
  loadSample: (kind: EventType) => void
  updateProfile: (updates: Partial<EventProfile>) => void
  toggleTask: (taskId: string) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  updateBudgetLine: (lineId: string, updates: Partial<BudgetLine>) => void
  lockBudgetLine: (lineId: string, locked: boolean) => void
  addExpense: (expense: Expense) => void
  updateVendor: (vendor: Vendor) => void
  setAiBundle: (bundle: AiBundle) => void
  setRunOfShow: (items: RunOfShowItem[]) => void
  deleteEvent: (eventId: string) => void
  setActive: (eventId: string) => void
  importJson: (jsonString: string) => void
}

const PlannerContext = createContext<PlannerContextValue | null>(null)

export interface PlannerProviderProps {
  initialState?: Partial<PlannerState>
  children: React.ReactNode
}

/**
 * Root Planner state provider with debounced localStorage persistence and Zod validation.
 *
 * @param props - Provider properties.
 * @returns Context provider wrapping the application tree.
 */
export function PlannerProvider({
  initialState,
  children,
}: PlannerProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(plannerReducer, {
    events: initialState?.events ?? [],
    activeEventId: initialState?.activeEventId ?? null,
    hydrated: initialState?.hydrated ?? false,
  })

  // Hydrate from localStorage on client mount
  useEffect(() => {
    if (state.hydrated) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Schema version migration stub
        if (parsed && typeof parsed.schemaVersion === 'number') {
          const validated = StoredDataSchema.safeParse(parsed)
          if (validated.success) {
            dispatch({
              type: 'HYDRATE',
              payload: {
                events: validated.data.events,
                activeEventId:
                  validated.data.activeEventId ??
                  validated.data.events[0]?.id ??
                  null,
              },
            })
            return
          }
        }
      }
    } catch {
      // Graceful fallback to empty state if corrupt
    }

    dispatch({
      type: 'HYDRATE',
      payload: { events: [], activeEventId: null },
    })
  }, [state.hydrated])

  // Debounced write to localStorage on state changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!state.hydrated) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const payload: StoredData = {
          schemaVersion: 1,
          events: state.events.slice(0, MAX_STORED_EVENTS),
          activeEventId: state.activeEventId,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // Handle storage quota or private browsing silently
      }
    }, 200)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state.events, state.activeEventId, state.hydrated])

  // Action helpers
  const createEvent = useCallback((profile: EventProfile): void => {
    dispatch({ type: 'CREATE_EVENT', payload: { profile } })
  }, [])

  const loadSample = useCallback((kind: EventType): void => {
    dispatch({ type: 'LOAD_SAMPLE', payload: { kind } })
  }, [])

  const updateProfile = useCallback((updates: Partial<EventProfile>): void => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { updates } })
  }, [])

  const toggleTask = useCallback((taskId: string): void => {
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId } })
  }, [])

  const addTask = useCallback((task: Task): void => {
    dispatch({ type: 'ADD_TASK', payload: { task } })
  }, [])

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>): void => {
      dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } })
    },
    []
  )

  const updateBudgetLine = useCallback(
    (lineId: string, updates: Partial<BudgetLine>): void => {
      dispatch({ type: 'UPDATE_BUDGET_LINE', payload: { lineId, updates } })
    },
    []
  )

  const lockBudgetLine = useCallback(
    (lineId: string, locked: boolean): void => {
      dispatch({ type: 'LOCK_BUDGET_LINE', payload: { lineId, locked } })
    },
    []
  )

  const addExpense = useCallback((expense: Expense): void => {
    dispatch({ type: 'ADD_EXPENSE', payload: { expense } })
  }, [])

  const updateVendor = useCallback((vendor: Vendor): void => {
    dispatch({ type: 'UPDATE_VENDOR', payload: { vendor } })
  }, [])

  const setAiBundle = useCallback((bundle: AiBundle): void => {
    dispatch({ type: 'SET_AI_BUNDLE', payload: { bundle } })
  }, [])

  const setRunOfShow = useCallback((items: RunOfShowItem[]): void => {
    dispatch({ type: 'SET_RUN_OF_SHOW', payload: { items } })
  }, [])

  const deleteEvent = useCallback((eventId: string): void => {
    dispatch({ type: 'DELETE_EVENT', payload: { eventId } })
  }, [])

  const setActive = useCallback((eventId: string): void => {
    dispatch({ type: 'SET_ACTIVE', payload: { eventId } })
  }, [])

  const importJson = useCallback((jsonString: string): void => {
    dispatch({ type: 'IMPORT_JSON', payload: { jsonString } })
  }, [])

  const contextValue = useMemo<PlannerContextValue>(
    () => ({
      state,
      dispatch,
      createEvent,
      loadSample,
      updateProfile,
      toggleTask,
      addTask,
      updateTask,
      updateBudgetLine,
      lockBudgetLine,
      addExpense,
      updateVendor,
      setAiBundle,
      setRunOfShow,
      deleteEvent,
      setActive,
      importJson,
    }),
    [
      state,
      createEvent,
      loadSample,
      updateProfile,
      toggleTask,
      addTask,
      updateTask,
      updateBudgetLine,
      lockBudgetLine,
      addExpense,
      updateVendor,
      setAiBundle,
      setRunOfShow,
      deleteEvent,
      setActive,
      importJson,
    ]
  )

  return (
    <PlannerContext.Provider value={contextValue}>
      {children}
    </PlannerContext.Provider>
  )
}

/**
 * Access the core planner state and action dispatchers.
 *
 * @returns PlannerContextValue with reactive state and action handlers.
 */
export function usePlannerStore(): PlannerContextValue {
  const context = useContext(PlannerContext)
  if (!context) {
    throw new Error('usePlannerStore must be used within a PlannerProvider')
  }
  return context
}

/**
 * Custom selector returning the currently active EventPlan, or null if no events exist.
 *
 * @returns The active EventPlan or null.
 */
export function useActivePlan(): EventPlan | null {
  const { state } = usePlannerStore()
  return useMemo(() => {
    if (!state.activeEventId) return state.events[0] ?? null
    return (
      state.events.find((e) => e.id === state.activeEventId) ??
      state.events[0] ??
      null
    )
  }, [state.events, state.activeEventId])
}

/**
 * Custom selector computing the memoized readiness score and actionable alerts for the active plan.
 *
 * @param now - Optional reference date (defaults to current date).
 * @returns ReadinessResult or null.
 */
export function useReadiness(now?: Date): ReadinessResult | null {
  const activePlan = useActivePlan()
  const referenceNow = useMemo(() => now ?? new Date(), [now])

  return useMemo(() => {
    if (!activePlan) return null
    return computeReadiness(activePlan, referenceNow)
  }, [activePlan, referenceNow])
}

/**
 * Exports an EventPlan as an indented, valid JSON string.
 *
 * @param plan - EventPlan to export.
 * @returns JSON string.
 */
export function exportPlanAsJson(plan: EventPlan): string {
  return JSON.stringify(plan, null, 2)
}

/**
 * Validates and imports a JSON string as an EventPlan.
 *
 * @param jsonString - Raw JSON string.
 * @returns Validated EventPlan.
 * @throws Error if JSON is malformed or schema validation fails.
 */
export function importPlanFromJson(jsonString: string): EventPlan {
  const parsed = JSON.parse(jsonString)
  return EventPlanSchema.parse(parsed)
}
