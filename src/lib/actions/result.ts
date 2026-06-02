export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export function actionSuccess(message?: string): ActionResult {
  return { ok: true, message };
}

export function actionError(error: string): ActionResult {
  return { ok: false, error };
}
