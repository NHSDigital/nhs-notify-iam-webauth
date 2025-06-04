import type { AxiosHeaderValue } from 'axios';

export function extractStringRecord(
  object: Record<string, AxiosHeaderValue | undefined>
): Record<string, string> {
  const stringEntries = Object.entries(object).flatMap(([key, value]) =>
    value ? [[key, value.toString()]] : []
  );
  return Object.fromEntries(stringEntries);
}
