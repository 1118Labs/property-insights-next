export type CronTask = {
  name: string;
  handler: () => Promise<void>;
  intervalMinutes: number;
};

// Placeholder scheduler registry for future background syncs. No timers are started here.
export const cronRegistry: CronTask[] = [];

export function registerCronTask(task: CronTask) {
  cronRegistry.push(task);
}

export function listCronTasks() {
  return [...cronRegistry];
}
