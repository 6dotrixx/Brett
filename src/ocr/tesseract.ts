import { createWorker, type Worker } from "tesseract.js";
import { log } from "../logger.js";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    log.info("Starting Tesseract worker (first run downloads language data)...");
    // errorHandler keeps worker failures (e.g. blocked language-data download)
    // from being thrown asynchronously and crashing the process. If a cached
    // ./eng.traineddata exists it is used instead of downloading.
    workerPromise = createWorker("eng", undefined, {
      errorHandler: (err: unknown) => log.error("Tesseract worker error:", err),
    }).catch((err) => {
      workerPromise = null;
      throw err instanceof Error ? err : new Error(`Tesseract init failed: ${String(err)}`);
    });
  }
  return workerPromise;
}

export async function ocrImage(image: Buffer): Promise<string> {
  const worker = await withTimeout(getWorker(), 120_000, "Tesseract worker startup timed out");
  const { data } = await withTimeout(worker.recognize(image), 120_000, "OCR timed out");
  return data.text;
}

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(msg)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

export async function shutdownOcr(): Promise<void> {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
    } catch { /* already failed */ }
    workerPromise = null;
  }
}
