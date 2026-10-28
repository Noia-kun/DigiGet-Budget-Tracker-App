import { Icon } from "@/components/ledger/Icon";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionComposer } from "@/components/ledger/TransactionComposer";
import {
  C,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  page,
  TextField,
  TransactionRow,
} from "@/components/ledger/ui";
import { useLedger } from "@/hooks/ledger-context";
import { type Transaction, type TransactionKind } from "@/shared/ledger";
export default function ActivityScreen() {
  const ledger = useLedger();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | TransactionKind>("all");
  const [category, setCategory] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [composer, setComposer] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const results = useMemo(
    () =>
      ledger.converted
        .filter((item) => {
          const label =
            ledger.data.categories.find((cat) => cat.id === item.categoryId)
              ?.name ?? "";
          const text =
            `${item.note} ${label} ${item.date} ${item.amountCents / 100}`.toLowerCase();
          return (
            (!query.trim() || text.includes(query.toLowerCase())) &&
            (kind === "all" || item.kind === kind) &&
            (category === "all" || item.categoryId === category) &&
            (!from || item.date >= from) &&
            (!to || item.date <= to) &&
            (!min || item.amountCents >= Number(min) * 100) &&
            (!max || item.amountCents <= Number(max) * 100)
          );
        })
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.updatedAt.localeCompare(a.updatedAt),
        ),
    [ledger.data, ledger.converted, query, kind, category, from, to, min, max],
  );
  if (!ledger.ready)
    return (
      <SafeAreaView style={page.root}>
        <LoadingState />
      </SafeAreaView>
    );
  const groups = results.reduce<Record<string, Transaction[]>>((all, item) => {
    const key = item.date.slice(0, 7);
    (all[key] ??= []).push(item);
    return all;
  }, {});
  return (
    <SafeAreaView style={page.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={page.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text style={page.title}>Activity</Text>
          <Text style={page.subtitle}>Every little thing, in one place.</Text>
        </View>
        <View style={styles.searchRow}>
          <Icon name="search-outline" size={18} color={C.muted} />
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes, category, date…"
            accessibilityLabel="Search transactions"
            style={styles.search}
          />
          <Pressable
            onPress={() => setFiltersOpen(!filtersOpen)}
            accessibilityRole="button"
            accessibilityLabel="Toggle date and amount filters"
            style={[
              styles.filterBtn,
              filtersOpen && { backgroundColor: C.green },
            ]}
          >
            <Icon
              name="options-outline"
              size={18}
              color={filtersOpen ? "#fff" : C.green}
            />
          </Pressable>
        </View>
        <View style={styles.segment}>
          <FilterChip
            label="All"
            active={kind === "all"}
            onPress={() => setKind("all")}
          />
          <FilterChip
            label="Expenses"
            active={kind === "expense"}
            onPress={() => setKind("expense")}
          />
          <FilterChip
            label="Income"
            active={kind === "income"}
            onPress={() => setKind("income")}
          />
        </View>
        {filtersOpen && (
          <View style={[page.card, { gap: 10 }]}>
            <Text style={{ color: C.ink, fontWeight: "700" }}>
              More filters
            </Text>
            <View style={styles.filterInputs}>
              <TextField
                value={from}
                onChangeText={setFrom}
                placeholder="From · YYYY-MM-DD"
                accessibilityLabel="Start date filter"
                style={styles.filterInput}
              />
              <TextField
                value={to}
                onChangeText={setTo}
                placeholder="To · YYYY-MM-DD"
                accessibilityLabel="End date filter"
                style={styles.filterInput}
              />
            </View>
            <View style={styles.filterInputs}>
              <TextField
                value={min}
                onChangeText={setMin}
                placeholder="Min amount"
                keyboardType="decimal-pad"
                accessibilityLabel="Minimum amount filter"
                style={styles.filterInput}
              />
              <TextField
                value={max}
                onChangeText={setMax}
                placeholder="Max amount"
                keyboardType="decimal-pad"
                accessibilityLabel="Maximum amount filter"
                style={styles.filterInput}
              />
            </View>
            <Pressable
              onPress={() => {
                setFrom("");
                setTo("");
                setMin("");
                setMax("");
                setCategory("all");
              }}
              accessibilityRole="button"
            >
              <Text style={{ color: C.green, fontWeight: "700", fontSize: 13 }}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 3 }}
        >
          <FilterChip
            label="Every category"
            active={category === "all"}
            onPress={() => setCategory("all")}
          />
          {ledger.data.categories
            .filter((item) => kind === "all" || item.kind === kind)
            .map((item) => (
              <FilterChip
                key={item.id}
                label={item.name}
                active={category === item.id}
                onPress={() => setCategory(item.id)}
              />
            ))}
        </ScrollView>
        <View style={page.card}>
          <View style={styles.listHeader}>
            <View>
              <Text style={page.sectionTitle}>Your entries</Text>
              <Text style={[page.subtitle, { marginTop: 3 }]}>
                {results.length} {results.length === 1 ? "record" : "records"} ·
                tap to edit
              </Text>
            </View>
            <Pressable
              onPress={() => setComposer(true)}
              accessibilityRole="button"
              style={styles.add}
            >
              <Icon name="add" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </Pressable>
          </View>
          {results.length === 0 ? (
            <EmptyState
              title={
                ledger.data.transactions.length
                  ? "No matches"
                  : "Your story starts here"
              }
              text={
                ledger.data.transactions.length
                  ? "Try another search or clear a filter."
                  : "Log your first income or expense and it will appear here."
              }
              action={
                ledger.data.transactions.length
                  ? "Clear search"
                  : "Add first entry"
              }
              onAction={() =>
                ledger.data.transactions.length
                  ? (setQuery(""),
                    setKind("all"),
                    setCategory("all"),
                    setFrom(""),
                    setTo(""),
                    setMin(""),
                    setMax(""))
                  : setComposer(true)
              }
            />
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <View key={group} style={{ marginTop: 8 }}>
                <Text style={styles.monthLabel}>
                  {new Date(`${group}-02T12:00:00`).toLocaleDateString(
                    undefined,
                    { month: "long", year: "numeric" },
                  )}
                </Text>
                {items.map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    category={ledger.data.categories.find(
                      (cat) => cat.id === item.categoryId,
                    )}
                    currency={ledger.data.preferences.currency}
                    onPress={() =>
                      setEditing(
                        ledger.data.transactions.find((t) => t.id === item.id) ?? null,
                      )
                    }
                    onDelete={() => setDeleting(item)}
                  />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {(composer || !!editing) && (
        <TransactionComposer
          visible
          categories={ledger.data.categories}
          currency={ledger.data.preferences.currency}
          editing={editing}
          onClose={() => {
            setComposer(false);
            setEditing(null);
          }}
          onSave={ledger.saveTransaction}
        />
      )}
      <ConfirmDialog
        visible={!!deleting}
        title="Remove this entry?"
        message="This will remove it from your ledger. This can’t be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) ledger.deleteTransaction(deleting.id);
          setDeleting(null);
        }}
      />
    </SafeAreaView>
  );
}
function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        active && { backgroundColor: C.green, borderColor: C.green },
      ]}
    >
      <Text
        style={{
          color: active ? "#fff" : C.muted,
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#fff",
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 13,
    paddingRight: 5,
    minHeight: 51,
  },
  search: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    minHeight: 42,
    paddingHorizontal: 0,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EAF3EC",
    alignItems: "center",
    justifyContent: "center",
  },
  segment: { flexDirection: "row", gap: 8 },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterInputs: { flexDirection: "row", gap: 8 },
  filterInput: { flex: 1, minWidth: 0, fontSize: 13, paddingHorizontal: 9 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 7,
    marginBottom: 3,
  },
});
