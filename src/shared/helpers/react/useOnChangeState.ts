import { useEffect, useRef } from 'react';

type Predicate<T> = (prevValue: T, value: T) => boolean;
type Handler<T> = (prevValue: T, value: T) => void;

export default function useOnChangeState<T extends any>(
  value: T, predicate: Predicate<T>, handler: Handler<T>, deps: any[],
) {
  const prevValue = useRef(value);

  useEffect(() => {
    if (predicate(prevValue.current, value)) {
      handler(prevValue.current, value);
    }
    prevValue.current = value;
  }, deps);
}
