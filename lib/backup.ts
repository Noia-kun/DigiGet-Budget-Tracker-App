import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { makeBackup, parseBackup, type LedgerSnapshot } from "@/shared/ledger";

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
// undefined = cancelled, null = invalid file, otherwise the snapshot
export async function pickBackup() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });
  if (result.canceled) return undefined;
  const text = await (await fetch(result.assets[0].uri)).text();
  return parseBackup(text);
}