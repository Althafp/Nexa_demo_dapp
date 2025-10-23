import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
      }
    },
    [key, storedValue]
  )

  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, clearValue]
}
