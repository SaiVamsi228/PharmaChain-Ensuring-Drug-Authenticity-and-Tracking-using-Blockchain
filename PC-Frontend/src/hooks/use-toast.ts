"use client"

import type React from "react"

import { useState, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
  open?: boolean // Added to resolve the error
}

type ToastState = {
  toasts: ToastProps[]
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToastProps
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToastProps> & { id: string }
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId: string
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId: string
    }

interface Toast extends Omit<ToastProps, "id"> {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        const timeout = toastTimeouts.get(toastId)
        if (timeout) clearTimeout(timeout)

        const dismissTimeout = setTimeout(() => {
          // dispatch({
          //   type: actionTypes.REMOVE_TOAST,
          //   toastId,
          // })
        }, TOAST_REMOVE_DELAY)

        toastTimeouts.set(toastId, dismissTimeout)
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const dispatch = useCallback((action: Action) => {
    setState((prevState) => reducer(prevState, action))
  }, [])

  const toast = useCallback(
    ({ ...props }: Toast) => {
      const id = props.id || generateId()

      const update = (props: Toast) =>
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        })

      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) dismiss()
          },
        },
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    [dispatch],
  )

  const dismissToast = useCallback(
    (toastId?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
    },
    [dispatch],
  )

  return {
    toast,
    dismissToast,
    toasts: state.toasts,
  }
}
