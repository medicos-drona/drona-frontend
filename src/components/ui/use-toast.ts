"use client"

import * as React from "react"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Create a simple event-based toast system
const toastEventTarget = typeof window !== 'undefined' ? new EventTarget() : null
const TOAST_ADD_EVENT = 'toast-add'
const TOAST_REMOVE_EVENT = 'toast-remove'

// Global toast state
let toasts: ToastProps[] = []
let listeners: ((toasts: ToastProps[]) => void)[] = []

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]))
}

// Add a toast
function addToast(toast: ToastProps) {
  const id = toast.id || Math.random().toString(36).substring(2, 9)
  const newToast = { ...toast, id }
  toasts = [...toasts, newToast]
  notifyListeners()
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
  
  return id
}

// Remove a toast
function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  notifyListeners()
}

export function useToast() {
  const [state, setState] = React.useState<ToastProps[]>(toasts)
  
  React.useEffect(() => {
    // Add this component as a listener
    listeners.push(setState)
    
    // Initial state sync
    setState([...toasts])
    
    // Cleanup
    return () => {
      listeners = listeners.filter(listener => listener !== setState)
    }
  }, [])
  
  return {
    toast: (props: ToastProps) => addToast(props),
    dismiss: (id?: string) => {
      if (id) {
        removeToast(id)
      } else {
        // Dismiss all toasts if no ID is provided
        toasts.forEach(t => t.id && removeToast(t.id))
      }
    },
    toasts: state,
  }
}

// Standalone toast function
export const toast = (props: ToastProps) => {
  return addToast(props)
}
