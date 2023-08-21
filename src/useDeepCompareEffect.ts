import { useRef, useEffect } from "react";

const deepCompareEquals = (a: unknown, b: unknown) => {
  // TODO: implement deep comparison here
  // something like lodash
  // return _.isEqual(a, b);
  console.info("DIFF", a === b, a, b);
  return a === b;
};

type Callback = () => void;

export const useDeepCompareMemoize = (value: unknown) => {
  const ref = useRef<unknown>();
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!deepCompareEquals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

export const useDeepCompareEffect = (
  callback: Callback,
  dependencies: unknown[]
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
};
