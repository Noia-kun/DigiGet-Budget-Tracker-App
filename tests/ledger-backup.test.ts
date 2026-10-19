import { describe, expect, it } from "vitest";
import { EMPTY_SNAPSHOT, makeBackup, parseBackup } from "../shared/ledger";

describe("backup", () => {
  it("round-trips a snapshot", () => {
    expect(parseBackup(makeBackup(EMPTY_SNAPSHOT))).toEqual(EMPTY_SNAPSHOT);
  });
  it("rejects invalid input", () => {
    expect(parseBackup("not json")).toBeNull();
    expect(parseBackup(JSON.stringify({ snapshot: EMPTY_SNAPSHOT }))).toBeNull();
    const bad = { ...EMPTY_SNAPSHOT, transactions: [{ id: 1 }] };
    expect(parseBackup(JSON.stringify({ app: "digiget", snapshot: bad }))).toBeNull();
  });
});