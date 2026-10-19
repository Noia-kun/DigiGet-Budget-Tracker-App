import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { makeBackup, type LedgerSnapshot } from "@/shared/ledger";

export async function exportBackup(snapshot: LedgerSnapshot) {
  if (!(await Sharing.isAvailableAsync())) throw new Error("sharing unavailable");
  const day = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `digiget-backup-${day}.json`);
  if (file.exists) file.delete();
  file.create();
  await file.write(makeBackup(snapshot));
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Save DigiGet backup",
  });
}