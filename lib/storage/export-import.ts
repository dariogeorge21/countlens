import { Counter } from "@/types/counter";
import { AppSettings } from "@/types/settings";
import { CURRENT_SCHEMA_VERSION } from "./migrations";
import { ExportData, ExportDataSchema } from "./schema";

export function generateExportJSON(
  counters: Counter[],
  settings: AppSettings
): string {
  const exportPayload: ExportData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    counters,
    settings,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function downloadBackupFile(
  counters: Counter[],
  settings: AppSettings
): void {
  const json = generateExportJSON(counters, settings);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `countlens-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ParseImportResult =
  | { success: true; data: ExportData }
  | { success: false; error: string };

export function parseAndValidateImport(jsonString: string): ParseImportResult {
  try {
    const raw = JSON.parse(jsonString);
    const result = ExportDataSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      return {
        success: false,
        error: `Invalid file schema: ${issues}`,
      };
    }
    return { success: true, data: result.data };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse JSON: ${err instanceof Error ? err.message : "Malformed file"}`,
    };
  }
}
