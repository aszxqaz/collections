export function singleton<T>(name: string, factory: () => T): T {
  const g = global as unknown as { __singletons: Record<string, unknown> };
  g.__singletons ??= {};
  g.__singletons[name] ??= factory();
  return g.__singletons[name] as T;
}
