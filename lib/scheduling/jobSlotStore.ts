import { JobSlot } from "@/lib/scheduling/types";

const jobSlots = new Map<string, JobSlot>();

export function createJobSlot(slot: JobSlot) {
  jobSlots.set(slot.id, slot);
  return slot;
}

export function listJobSlots() {
  return Array.from(jobSlots.values());
}

export function getJobSlot(id: string) {
  return jobSlots.get(id) || null;
}

export function updateJobSlot(id: string, patch: Partial<JobSlot>) {
  const existing = jobSlots.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  jobSlots.set(id, updated);
  return updated;
}

export function deleteJobSlot(id: string) {
  return jobSlots.delete(id);
}
