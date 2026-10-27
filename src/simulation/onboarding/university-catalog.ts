/**
 * Catalog-availability service for the University Finder.
 *
 * PROTOTYPE: the check matches the typed university name against a local mock directory.
 * To connect a real API, replace the body of `checkCatalogAvailability` — its signature and
 * result type are the contract the UI depends on.
 */
import { universities } from "@/mock/universities";
import type { UniversityStepValues } from "@/schemas/university";

/** What the student entered on the University Finder (validated by `universityStepSchema`). */
export type UniversitySelection = UniversityStepValues;

export type CatalogCheckResult =
  | {
      status: "available";
      /** Official name from the directory, which may differ from what was typed (e.g. "UBC"). */
      universityName: string;
      title: string;
      source: string;
      courses: number;
      programs: number;
    }
  | { status: "unavailable" };

/** Case-, accent-, and punctuation-insensitive form, ignoring a leading "The". */
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/^the /, "");

const SIMULATED_LATENCY_MS = 1400;

/** Simulates looking up whether the university publishes its course catalog. */
export async function checkCatalogAvailability(
  selection: UniversitySelection,
  signal?: AbortSignal,
): Promise<CatalogCheckResult> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, SIMULATED_LATENCY_MS);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    });
  });

  const name = normalize(selection.name);
  const match = universities.find(
    (university) =>
      normalize(university.name) === name ||
      (university.shortName && normalize(university.shortName) === name),
  );
  return match?.catalog
    ? { status: "available", universityName: match.name, ...match.catalog }
    : { status: "unavailable" };
}
