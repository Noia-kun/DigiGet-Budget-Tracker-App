import { Icon } from "@/components/ledger/Icon";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  C,
  DonutChart,
  EmptyState,
  LoadingState,
  MonthPicker,
  page,
  SyncBanner,
} from "@/components/ledger/ui";
import { useLedger } from "@/hooks/ledger-context";
import {
  formatMoney,
  monthLabel,
  monthTransactions,
  monthTotals,
} from "@/shared/ledger";
export default function InsightsScreen() {
  const ledger = useLedger();
  const [month, setMonth] = useState(() => new Date());
  const current = monthTransactions(ledger.data.transactions, month);
  const totals = monthTotals(current);
  const priorDate = useMemo(
    () => new Date(month.getFullYear(), month.getMonth() - 1, 1),
    [month],
  );
  const prior = monthTotals(
    monthTransactions(ledger.data.transactions, priorDate),
  );
  const categoryTotals = ledger.data.categories
    .filter((cat) => cat.kind === "expense")
    .map((category) => ({
      category,
      value: current
        .filter(
          (item) => item.kind === "expense" && item.categoryId === category.id,
        )
        .reduce((sum, item) => sum + item.amountCents, 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const expenseDiff = totals.expense - prior.expense;
  const changePercent = prior.expense
    ? Math.round((Math.abs(expenseDiff) / prior.expense) * 100)
    : null;
  if (!ledger.ready)
    return (
      <SafeAreaView style={page.root}>
        <LoadingState />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={page.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={page.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 5 }}>
          <Text style={page.title}>Monthly insights</Text>
          <Text style={page.subtitle}>
            Your patterns, without the pressure.
          </Text>
        </View>
        <SyncBanner
          state={ledger.syncState}
          onRetry={() => void ledger.syncNow()}
        />
        <MonthPicker date={month} onChange={setMonth} />
        <View style={styles.overview}>
          <Text
            style={{
              color: "#D8E7D8",
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            MONTHLY BALANCE
          </Text>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.balance}>
            {formatMoney(
              totals.income - totals.expense,
              ledger.data.preferences.currency,
            )}
          </Text>
          <Text style={{ color: "#DCE8DC", fontSize: 13 }}>
            {monthLabel(month)}
          </Text>
          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <Icon
                name="arrow-down-circle-outline"
                size={17}
                color="#B9D58B"
              />
              <Text style={styles.pairLabel}>Income</Text>
              <Text style={styles.pairValue}>
                {formatMoney(totals.income, ledger.data.preferences.currency)}
              </Text>
            </View>
            <View style={styles.pairItem}>
              <Icon name="arrow-up-circle-outline" size={17} color="#F1AE90" />
              <Text style={styles.pairLabel}>Expenses</Text>
              <Text style={styles.pairValue}>
                {formatMoney(totals.expense, ledger.data.preferences.currency)}
              </Text>
            </View>
          </View>
        </View>
        <View style={page.card}>
          <Text style={page.sectionTitle}>Spending breakdown</Text>
          <Text style={[page.subtitle, { marginTop: 3 }]}>
            By category · {monthLabel(month)}
          </Text>
          {categoryTotals.length ? (
            <View style={{ marginTop: 16, gap: 14 }}>
              <View style={{ alignItems: "center", paddingBottom: 4 }}>
                <DonutChart
                  items={categoryTotals.map(({ category, value }) => ({
                    value,
                    color: category.color,
                  }))}
                  size={164}
                />
              </View>
              {categoryTotals.map(({ category, value }) => (
                <View key={category.id} style={styles.categoryRow}>
                  <View
                    style={[styles.dot, { backgroundColor: category.color }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: C.ink, fontSize: 13, fontWeight: "700" }}
                    >
                      {category.name}
                    </Text>
                    <View style={styles.barBg}>
                      <View
                        style={{
                          width: `${Math.max(5, totals.expense ? (value / totals.expense) * 100 : 0)}%`,
                          height: 5,
                          backgroundColor: category.color,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", width: 90 }}>
                    <Text
                      style={{ color: C.ink, fontSize: 13, fontWeight: "700" }}
                    >
                      {formatMoney(value, ledger.data.preferences.currency)}
                    </Text>
                    <Text
                      style={{ color: C.muted, fontSize: 11, marginTop: 2 }}
                    >
                      {totals.expense
                        ? Math.round((value / totals.expense) * 100)
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="Insights are taking shape"
              text="Add a few expenses and your category breakdown will appear here."
            />
          )}
        </View>
        <View style={page.card}>
          <Text style={page.sectionTitle}>Compared with last month</Text>
          <Text style={[page.subtitle, { marginTop: 3 }]}>
            Your spending pace, month to month.
          </Text>
          <View style={styles.compare}>
            <View style={{ flex: 1 }}>
              <Text style={page.label}>{monthLabel(priorDate)}</Text>
              <Text style={styles.compareValue}>
                {formatMoney(prior.expense, ledger.data.preferences.currency)}
              </Text>
            </View>
            <Icon name="arrow-forward" size={19} color={C.muted} />
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={page.label}>{monthLabel(month)}</Text>
              <Text style={[styles.compareValue, { color: C.ink }]}>
                {formatMoney(totals.expense, ledger.data.preferences.currency)}
              </Text>
            </View>
          </View>
          {changePercent === null ? (
            <Text style={styles.compareNote}>
              Keep logging to see a month-over-month trend.
            </Text>
          ) : (
            <Text
              style={[
                styles.compareNote,
                { color: expenseDiff <= 0 ? C.green : C.coral },
              ]}
            >
              {expenseDiff <= 0 ? "↓" : "↑"} {changePercent}%{" "}
              {expenseDiff <= 0 ? "less" : "more"} spending than last month
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  overview: { backgroundColor: C.green, borderRadius: 24, padding: 21 },
  balance: {
    color: "#fff",
    fontSize: 34,
    letterSpacing: -0.7,
    fontWeight: "800",
    marginTop: 11,
  },
  pair: { flexDirection: "row", gap: 11, marginTop: 20 },
  pairItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.11)",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  pairLabel: { color: "#DDE9DA", fontSize: 12, fontWeight: "600" },
  pairValue: {
    width: "100%",
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 3,
  },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  barBg: {
    marginTop: 6,
    width: "100%",
    height: 5,
    backgroundColor: "#F0F2EC",
    borderRadius: 3,
  },
  compare: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  compareValue: {
    color: C.muted,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  compareNote: {
    marginTop: 16,
    color: C.muted,
    fontSize: 13,
    fontWeight: "700",
  },
});
