import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { processImage } from "./pipeline.js";
import { log } from "./logger.js";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

/**
 * Auto-ingest watcher — the "no manual upload" path. Point AUTO_INGEST_DIR at
 * any folder your capture pipeline writes into (capture-card auto-saves, an
 * OBS screenshot hotkey, a Dropbox/Syncthing folder synced from your phone)
 * and every image that appears is OCR'd and filed automatically:
 * end-of-match screens become per-map match stats, combat-record screens
 * become lifetime snapshots. Processed files are moved to processed/ or
 * failed/ inside the watched folder.
 */
export function startIngestWatcher(): void {
  const dir = config.autoIngestDir;
  if (!dir) return;

  fs.mkdirSync(dir, { recursive: true });
  const processedDir = path.join(dir, "processed");
  const failedDir = path.join(dir, "failed");
  fs.mkdirSync(processedDir, { recursive: true });
  fs.mkdirSync(failedDir, { recursive: true });

  const inFlight = new Set<string>();

  const tryProcess = async (file: string): Promise<void> => {
    const full = path.join(dir, file);
    if (inFlight.has(full)) return;
    if (!IMAGE_EXT.has(path.extname(file).toLowerCase())) return;
    inFlight.add(full);
    try {
      // Wait until the file stops growing (still being written by the capture tool)
      let size = -1;
      for (let i = 0; i < 30; i++) {
        const stat = fs.statSync(full, { throwIfNoEntry: false });
        if (!stat) return; // vanished
        if (stat.size > 0 && stat.size === size) break;
        size = stat.size;
        await new Promise((r) => setTimeout(r, 1000));
      }

      const image = fs.readFileSync(full);
      const result = await processImage(image);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (result.ok) {
        fs.renameSync(full, path.join(processedDir, `${stamp}_${file}`));
        log.info(`Auto-ingest: ${file} → ${result.type === "match" ? `match on ${result.match.map ?? "?"}` : `snapshot #${result.snapshotId}`}`);
      } else {
        fs.renameSync(full, path.join(failedDir, `${stamp}_${file}`));
        log.warn(`Auto-ingest: ${file} unreadable (${result.error}) — moved to failed/`);
      }
    } catch (err: any) {
      log.error(`Auto-ingest failed for ${file}:`, err?.message ?? err);
    } finally {
      inFlight.delete(full);
    }
  };

  // Process anything already sitting in the folder, then watch for new files
  for (const file of fs.readdirSync(dir)) {
    if (fs.statSync(path.join(dir, file)).isFile()) void tryProcess(file);
  }
  fs.watch(dir, (_event, file) => {
    if (file) void tryProcess(file.toString());
  });

  log.info(`Auto-ingest armed: watching ${dir} — drop screenshots there and they file themselves`);
}
