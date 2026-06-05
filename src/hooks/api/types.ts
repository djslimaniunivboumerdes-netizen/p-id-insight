import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Standard data-fetching hook contract used across the app.
 * Extends react-query's result with a derived `isEmpty` flag so pages can
 * render loading / error / empty states uniformly.
 */
export type DataResult<T> = UseQueryResult<T, Error> & {
  isEmpty: boolean;
};

export function withEmpty<T>(
  q: UseQueryResult<T, Error>,
  isEmpty: (data: T) => boolean,
): DataResult<T> {
  const empty = !q.isLoading && !q.isError && q.data !== undefined && isEmpty(q.data);
  return Object.assign(Object.create(Object.getPrototypeOf(q)), q, { isEmpty: empty }) as DataResult<T>;
}

export function arrayIsEmpty<T>(arr: T[] | undefined): boolean {
  return !arr || arr.length === 0;
}
