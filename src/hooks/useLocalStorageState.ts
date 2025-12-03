import { useState, useEffect } from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  parser: (value: string) => T = JSON.parse,
  serializer: (value: T) => string = JSON.stringify
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      if (item !== null) {
        try {
          return parser(item);
        } catch {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, serializer(state));
  }, [key, state, serializer]);

  return [state, setState];
}