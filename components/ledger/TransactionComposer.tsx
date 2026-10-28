import { Icon } from "@/components/ledger/Icon";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  dateKey,
  currencySymbol,
  type Category,
  type Transaction,
  type TransactionKind,
} from "@/shared/ledger";
import { C, TextField } from "@/components/ledger/ui";

type Props = {
  visible: boolean;
  categories: Category[];
  currency: string;
  editing?: Transaction | null;
  onClose: () => void;
  onSave: (item: Transaction) => void;
};

export function TransactionComposer({
  visible,
  categories,
  currency,
  editing,
  onClose,
  onSave,
}: Props) {
  const [kind, setKind] = useState<TransactionKind>(editing?.kind ?? "expense");
  const [amount, setAmount] = useState(
    editing ? (editing.amountCents / 100).toFixed(2) : "",
  );
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(editing?.date ?? dateKey());
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const entryCurrency = editing?.currency ?? currency;
  const choices = categories.filter(
    (category) =>
      category.kind === kind &&
      (!category.archived || category.id === editing?.categoryId),
  );
  const activeCategoryId = choices.some(
    (category) => category.id === categoryId,
  )
    ? categoryId
    : (choices[0]?.id ?? "");

  const submit = () => {
    const parsed = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      setError("Enter a real date in YYYY-MM-DD format.");
      return;
    }
    if (!activeCategoryId) {
      setError("Choose a category to continue.");
      return;
    }
    const cents = Math.round(parsed * 100);
    if (!Number.isSafeInteger(cents) || cents <= 0) {
      setError("That amount is too large. Try a smaller value.");
      return;
    }
    const item: Transaction = {
      id:
        editing?.id ??
        `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      amountCents: cents,
      categoryId: activeCategoryId,
      note: note.trim(),
      date,
      currency: entryCurrency,
      updatedAt: new Date().toISOString(),
    };
    onSave(item);
    setSaved(true);
    setTimeout(onClose, 650);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              {editing ? "EDIT ENTRY" : "NEW ENTRY"}
            </Text>
            <Text style={styles.title}>
              {editing ? "Update your ledger" : "Add to your ledger"}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close entry form"
            style={styles.close}
          >
            <Icon name="close" size={21} color={C.ink} />
          </Pressable>
        </View>
        <View style={styles.segment}>
          <Pressable
            onPress={() => {
              setKind("expense");
              setError("");
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: kind === "expense" }}
            style={[
              styles.segmentBtn,
              kind === "expense" && styles.expenseActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                kind === "expense" && styles.activeText,
              ]}
            >
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setKind("income");
              setError("");
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: kind === "income" }}
            style={[
              styles.segmentBtn,
              kind === "income" && styles.incomeActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                kind === "income" && styles.activeText,
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 17, paddingBottom: 30 }}
        >
          <View>
            <Text style={styles.fieldLabel}>AMOUNT</Text>
            <View style={styles.amountWrap}>
              <Text style={{ color: C.green, fontSize: 28, fontWeight: "700" }}>
                {currencySymbol(entryCurrency)}
              </Text>
              <TextField
                value={amount}
                onChangeText={(text: string) => {
                  setAmount(text);
                  setError("");
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                accessibilityLabel="Amount"
                style={styles.amountInput}
              />
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.categories}>
              {choices.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: activeCategoryId === category.id,
                  }}
                  style={[
                    styles.category,
                    activeCategoryId === category.id && {
                      borderColor: C.green,
                      backgroundColor: "#EAF3EC",
                    },
                  ]}
                >
                  <Icon
                    name={category.icon as any}
                    size={15}
                    color={activeCategoryId === category.id ? C.green : C.muted}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: activeCategoryId === category.id ? C.green : C.ink,
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>DATE · YYYY-MM-DD</Text>
            <TextField
              value={date}
              onChangeText={setDate}
              placeholder="2026-10-14"
              accessibilityLabel="Date in year month day format"
            />
          </View>
          <View>
            <Text style={styles.fieldLabel}>NOTE · OPTIONAL</Text>
            <TextField
              value={note}
              onChangeText={setNote}
              placeholder="What was it for?"
              accessibilityLabel="Optional note"
              maxLength={100}
              returnKeyType="done"
            />
          </View>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {saved ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>
              Saved on this phone.
            </Text>
          ) : null}
          <Pressable
            onPress={submit}
            accessibilityRole="button"
            style={[
              styles.save,
              { backgroundColor: kind === "income" ? C.green : C.ink },
            ]}
          >
            <Icon
              name={saved ? "checkmark-circle" : "checkmark"}
              size={18}
              color="#fff"
            />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              {saved ? "Saved" : editing ? "Save changes" : "Save entry"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.card,
    paddingHorizontal: 22,
    paddingTop: 9,
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#D8DDD5",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: C.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: { fontSize: 22, color: C.ink, fontWeight: "800", marginTop: 4 },
  close: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F2F3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 15,
    backgroundColor: "#F2F3EF",
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 12,
  },
  expenseActive: { backgroundColor: "#FBEAE4" },
  incomeActive: { backgroundColor: "#E3F0E7" },
  segmentText: { color: C.muted, fontWeight: "700" },
  activeText: { color: C.ink },
  fieldLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  amountWrap: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#F7F8F4",
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountInput: {
    borderWidth: 0,
    backgroundColor: "transparent",
    fontSize: 30,
    fontWeight: "800",
    paddingHorizontal: 0,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  category: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  error: { color: "#A94435", fontSize: 13 },
  success: { color: C.green, fontSize: 13, fontWeight: "600" },
  save: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
});
