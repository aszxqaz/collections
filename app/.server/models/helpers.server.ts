import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export enum PgError {
  UniqueKeyViolation,
  Unknown,
}

type SafeDbExecResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: PgError;
    };

export async function safeDbExec<T>(cb: () => Promise<T>): Promise<SafeDbExecResult<T>> {
  try {
    const data = await cb();
    return { ok: true, data };
  } catch (e) {
    console.log(`safeDbExec(): `, e);
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code == 'P2002') {
        return { ok: false, error: PgError.UniqueKeyViolation };
      }
    }
    return { ok: false, error: PgError.Unknown };
  }
}

export function splitDbExecResult<T>(
  promise: Promise<SafeDbExecResult<T>>,
): [Promise<T | null>, Promise<PgError | null>] {
  return [promise.then(r => (r.ok ? r.data : null)), promise.then(r => (!r.ok ? r.error : null))];
}
