import { fetchZillow, mergeZillow } from "@/lib/enrichers/zillow";
import { fetchRentcast, mergeRentcast } from "@/lib/enrichers/rentcast";
import { PropertyRecord } from "@/lib/types";

export type EnrichmentAdapter = {
  label: string;
  fetch: (address: string) => Promise<unknown>;
  merge: (result: unknown, base: PropertyRecord) => PropertyRecord;
  enabled: () => boolean;
};

export const adapters: EnrichmentAdapter[] = [
  {
    label: "zillow",
    fetch: fetchZillow,
    merge: mergeZillow,
    enabled: () => Boolean(process.env.ZILLOW_API_URL && process.env.ZILLOW_API_KEY),
  },
  {
    label: "rentcast",
    fetch: fetchRentcast,
    merge: mergeRentcast,
    enabled: () => Boolean(process.env.RENTCAST_API_KEY),
  },
];
