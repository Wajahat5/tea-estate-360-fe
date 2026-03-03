import { useState, useCallback, useRef, useEffect } from "react";

// Global in-memory cache to preserve state across page unmounts
const globalStateCache: Record<string, any> = {};

export function clearPageState() {
  for (const key in globalStateCache) {
    delete globalStateCache[key];
  }
}

/**
 * A hook that behaves exactly like `useState`, but stores its value in a global
 * memory object using a provided key. This allows the state to persist
 * even when the component using it is unmounted.
 *
 * @param key - A unique string to identify this state item globally.
 * @param initialState - The default value if no state has been saved yet.
 */
export function usePageState<T>(
  key: string,
  initialState: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void] {
  // Determine the starting value by checking the global cache first.
  const getInitialValue = useCallback((): T => {
    if (globalStateCache.hasOwnProperty(key)) {
      return globalStateCache[key];
    }
    return typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState;
  }, [key, initialState]);

  const [state, setState] = useState<T>(getInitialValue);
  const stateRef = useRef(state);

  // Sync the ref and the global cache whenever the state changes
  useEffect(() => {
    stateRef.current = state;
    globalStateCache[key] = state;
  }, [state, key]);

  const setPersistentState = useCallback(
    (value: T | ((val: T) => T)) => {
      setState((prevValue) => {
        const newValue = typeof value === "function" ? (value as Function)(prevValue) : value;
        stateRef.current = newValue;
        globalStateCache[key] = newValue;
        return newValue;
      });
    },
    [key]
  );

  return [state, setPersistentState];
}
