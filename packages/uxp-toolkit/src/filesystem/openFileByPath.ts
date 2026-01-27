import { app } from "photoshop";
import { storage } from "uxp";
import { executeAsModal } from "../core/executeAsModal";

export async function openFileByPath(path: string) {
  const fs = (storage as any).localFileSystem;
  const file = (await fs.getEntryWithUrl(path)) as storage.File;
  const doc = await executeAsModal("Open file", () => app.open(file as any));
  return doc;
}
