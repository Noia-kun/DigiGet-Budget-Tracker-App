import { Icon } from "@/components/ledger/Icon";
import { DateField } from "@/components/ledger/DateField";
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
  shadow,
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
  const activeFilters = [category !== "all", !!from, !!to, !!min, !!max].filter(Boolean).length;
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
  const chooseKind = (next: "all" | TransactionKind) => {
    setKind(next);
    setCategory("all");
  };
  return (
    <SafeAreaView style={page.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={page.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text style={page.title}>Activity</Text>
          <Text style={page.subtitle}>All your income and expenses.</Text>
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
            accessibilityLabel={`Filters${activeFilters ? `, ${activeFilters} active` : ""}`}
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
            {activeFilters > 0 && !filtersOpen && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilters}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={styles.segment}>
          <FilterChip
            label="All"
            active={kind === "all"}
            onPress={() => chooseKind("all")}
          />
          <FilterChip
            label="Expenses"
            active={kind === "expense"}
            onPress={() => chooseKind("expense")}
          />
          <FilterChip
            label="Income"
            active={kind === "income"}
            onPress={() => chooseKind("income")}
          />
        </View>
        {filtersOpen && (
          <View style={[page.card, { gap: 16 }]}>
            <View>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterChips}>
                <FilterChip
                  label="All"
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
              </View>
            </View>
            <View>
              <Text style={styles.filterLabel}>Date range</Text>
              <View style={styles.filterInputs}>
                <DateField value={from} onChange={setFrom} placeholder="From" label="Start date" />
                <DateField value={to} onChange={setTo} placeholder="To" label="End date" />
              </View>
            </View>
            <View>
              <Text style={styles.filterLabel}>Amount range</Text>
              <View style={styles.filterInputs}>
                <TextField
                  value={min}
                  onChangeText={setMin}
                  placeholder="Min"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Minimum amount filter"
                  style={styles.filterInput}
                />
                <TextField
                  value={max}
                  onChangeText={setMax}
                  placeholder="Max"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Maximum amount filter"
                  style={styles.filterInput}
                />
              </View>
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
        <View style={page.card}>
          <View style={styles.listHeader}>
            <View>
              <Text style={page.sectionTitle}>Your entries</Text>
              <Text style={[page.subtitle, { marginTop: 3 }]}>
                {results.length} {results.length === 1 ? "entry" : "entries"} ·
                tap one to edit
              </Text>
            </View>
          </View>
          {results.length === 0 ? (
            <EmptyState
              title={
                ledger.data.transactions.length
                  ? "No matches"
                  : "No entries yet"
              }
              text={
                ledger.data.transactions.length
                  ? "Try another search or clear a filter."
                  : "Add an income or expense and it will appear here."
              }
              action={
                ledger.data.transactions.length
                  ? "Clear filters"
                  : "Add entry"
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
      <Pressable
        onPress={() => setComposer(true)}
        accessibilityRole="button"
        accessibilityLabel="Add income or expense"
        style={styles.fab}
      >
        <Icon name="add" size={22} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700" }}>Add entry</Text>
      </Pressable>
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
  filterLabel: { color: C.muted, fontSize: 13, fontWeight: "600", marginBottom: 8 },
  filterChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.coral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
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
  fab: {
    position: "absolute",
    right: 22,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: C.green,
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 18,
    ...shadow,
  },
  monthLabel: { color: C.muted, fontSize: 13, fontWeight: "700", marginTop: 7, marginBottom: 3 },
});
