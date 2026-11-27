import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyAdminBestEffort } from "./adminNotify";

describe("notifyAdminBestEffort", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts tasks in parallel exactly once and clears the timer on success", async () => {
    let finish!: () => void;
    const first = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const second = vi.fn().mockResolvedValue(true);
    const notification = notifyAdminBestEffort([first, second], 4000);

    await vi.advanceTimersByTimeAsync(0);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    finish();
    await expect(notification).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(4000);
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([0, 1])("isolates task %i rejection and logs no error details", async (index) => {
    const tasks = [vi.fn().mockResolvedValue(true), vi.fn().mockResolvedValue(true)];
    tasks[index].mockRejectedValue(new Error("Pat Personal pat@example.test 123-45-6789"));

    await expect(notifyAdminBestEffort(tasks, 4000)).resolves.toBeUndefined();

    tasks.forEach((task) => expect(task).toHaveBeenCalledTimes(1));
    expect(console.error).toHaveBeenCalledExactlyOnceWith("[admin notify] task failed");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("catches a synchronous throw and still starts the other task", async () => {
    const first = vi.fn((): Promise<void> => { throw new Error("private@example.test"); });
    const second = vi.fn().mockResolvedValue(true);

    await expect(notifyAdminBestEffort([first, second], 4000)).resolves.toBeUndefined();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledExactlyOnceWith("[admin notify] task failed");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("caps never-resolving tasks at the supplied timeout and clears the timer", async () => {
    const task = vi.fn(() => new Promise<void>(() => {}));
    const returned = vi.fn();
    const notification = notifyAdminBestEffort([task], 4000).then(returned);

    await vi.advanceTimersByTimeAsync(3999);
    expect(returned).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await notification;

    expect(returned).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(task).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledExactlyOnceWith("[admin notify] timed out");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("handles rejections after timeout without exposing their contents", async () => {
    let reject!: (reason: Error) => void;
    const task = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
    const notification = notifyAdminBestEffort([task], 25);
    await vi.advanceTimersByTimeAsync(25);
    await notification;

    reject(new Error("Pat Personal pat@example.test"));
    await vi.advanceTimersByTimeAsync(0);

    expect(console.error).toHaveBeenNthCalledWith(1, "[admin notify] timed out");
    expect(console.error).toHaveBeenNthCalledWith(2, "[admin notify] task failed");
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the timer for an empty task list", async () => {
    await expect(notifyAdminBestEffort([], 4000)).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    expect(console.error).not.toHaveBeenCalled();
  });
});
