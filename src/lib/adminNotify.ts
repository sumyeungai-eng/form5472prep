/** Run independent notifications once, without letting failures delay signing indefinitely. */
export async function notifyAdminBestEffort(
  tasks: ReadonlyArray<() => Promise<unknown>>,
  ms: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        console.error("[admin notify] timed out");
        resolve();
      }, ms);
    });
    await Promise.race([
      Promise.allSettled(tasks.map((task) => Promise.resolve().then(task).catch(() => {
        // Handle late rejections too, without logging task data or error objects.
        console.error("[admin notify] task failed");
      }))),
      timeout,
    ]);
  } catch {
    console.error("[admin notify] failed");
  } finally {
    clearTimeout(timer);
  }
}
