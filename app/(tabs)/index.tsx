import { Icon } from "@/components/ledger/Icon";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionComposer } from "@/components/ledger/TransactionComposer";
import {
  BrandMark,
  C,
  DonutChart,
  EmptyState,
  LoadingState,
  MonthPicker,
  page,
  shadow,
  SummaryMini,
  SyncBanner,
  TransactionRow,
} from "@/components/ledger/ui";
import { useLedger } from "@/hooks/ledger-context";
import {
  formatMoney,
  CURRENCIES,
  DEFAULT_PREFERENCES,
  monthLabel,
  monthTransactions,
  monthTotals,
  type Transaction,
} from "@/shared/ledger";

export default function HomeScreen() {
  const router = useRouter();
  const ledger = useLedger();
  const [month, setMonth] = useState(() => new Date());
  const [composer, setComposer] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  if (!ledger.ready)
    return (
      <View style={page.root}>
        <LoadingState />
      </View>
    );
  const { data } = ledger;
  const monthItems = monthTransactions(data.transactions, month);
  const totals = monthTotals(monthItems);
  const spent = monthItems.filter((item) => item.kind === "expense");
  const top = data.categories
    .filter((category) => category.kind === "expense")
    .map((category) => ({
      category,
      value: spent
        .filter((item) => item.categoryId === category.id)
        .reduce((sum, item) => sum + item.amountCents, 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  const recent = [...monthItems]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt),
    )
    .slice(0, 4);
  return (
    <SafeAreaView style={page.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={page.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
            <BrandMark size={39} />
            <View>
              <Text
                style={{
                  color: C.ink,
                  fontWeight: "800",
                  fontSize: 17,
                  letterSpacing: -0.3,
                }}
              >
                DigiGet
              </Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                A little more clarity, daily.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={styles.avatar}
          >
            <Icon name="person-outline" color={C.green} size={19} />
          </Pressable>
        </View>
        <SyncBanner
          state={ledger.syncState}
          onRetry={() => void ledger.syncNow()}
        />
        {!data.onboardingComplete ? (
          <Onboarding
            initialCurrency={data.preferences.currency || DEFAULT_PREFERENCES.currency}
            onFinish={(currency) => {
              ledger.updatePreferences({ currency });
              ledger.finishOnboarding();
            }}
          />
        ) : (
          <>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={page.title}>Your money,</Text>
                <Text style={[page.title, { color: C.green }]}>
                  at a glance.
                </Text>
              </View>
              <MonthPicker date={month} onChange={setMonth} />
            </View>
            <View style={styles.balanceCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.balanceLabel}>NET THIS MONTH</Text>
                <View style={styles.cardBadge}>
                  <Icon name="leaf-outline" size={13} color="#D7E7C9" />
                  <Text
                    style={{
                      color: "#D7E7C9",
                      fontWeight: "600",
                      fontSize: 11,
                    }}
                  >
                    {month.toLocaleDateString(undefined, { month: "short" })}
                  </Text>
                </View>
              </View>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.balanceAmount}
              >
                {formatMoney(
                  totals.income - totals.expense,
                  data.preferences.currency,
                )}
              </Text>
              <Text style={styles.balanceHint}>
                {totals.income >= totals.expense
                  ? "A steady month so far."
                  : "A clear picture is a good first step."}
              </Text>
              <View style={styles.balanceLine}>
                <View
                  style={{
                    width: "42%",
                    height: 4,
                    backgroundColor: "#B9D58B",
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: "rgba(255,255,255,0.17)",
                    borderRadius: 4,
                  }}
                />
              </View>
              <View style={styles.balanceMeta}>
                <Text style={styles.balanceMetaText}>
                  Income {formatMoney(totals.income, data.preferences.currency)}
                </Text>
                <Text style={styles.balanceMetaText}>
                  Spent {formatMoney(totals.expense, data.preferences.currency)}
                </Text>
              </View>
            </View>
            <View style={styles.stats}>
              <SummaryMini
                title="INCOME"
                value={totals.income}
                income
                currency={data.preferences.currency}
              />
              <SummaryMini
                title="SPENDING"
                value={totals.expense}
                currency={data.preferences.currency}
              />
            </View>
            <View style={page.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={page.sectionTitle}>Where it went</Text>
                  <Text style={[page.subtitle, { marginTop: 3 }]}>
                    {monthLabel(month)} spending
                  </Text>
                </View>
                <Pressable
                  onPress={() => setComposer(true)}
                  accessibilityRole="button"
                  style={styles.addTiny}
                >
                  <Icon name="add" size={17} color={C.green} />
                  <Text
                    style={{ color: C.green, fontWeight: "700", fontSize: 12 }}
                  >
                    Add
                  </Text>
                </Pressable>
              </View>
              {spent.length === 0 ? (
                <EmptyState
                  title="A fresh page"
                  text="Your spending categories will show up here after your first entry."
                  action="Add an expense"
                  onAction={() => setComposer(true)}
                />
              ) : (
                <View style={styles.chartRow}>
                  <DonutChart
                    items={top.map((item) => ({
                      value: item.value,
                      color: item.category.color,
                    }))}
                  />
                  <View style={{ flex: 1, gap: 12 }}>
                    {top.map(({ category, value }) => (
                      <View key={category.id} style={styles.categoryStat}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: category.color },
                          ]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: C.ink,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {category.name}
                          </Text>
                          <Text style={{ color: C.muted, fontSize: 11 }}>
                            {totals.expense
                              ? Math.round((value / totals.expense) * 100)
                              : 0}
                            % of spending
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: C.ink,
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {formatMoney(value, data.preferences.currency)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            <View style={page.card}>
              <View style={styles.sectionHeader}>
                <Text style={page.sectionTitle}>Recent activity</Text>
                <Text style={{ color: C.muted, fontSize: 12 }}>
                  {monthItems.length}{" "}
                  {monthItems.length === 1 ? "entry" : "entries"}
                </Text>
              </View>
              {recent.length ? (
                recent.map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    category={data.categories.find(
                      (category) => category.id === item.categoryId,
                    )}
                    currency={data.preferences.currency}
                    onPress={() => setEditing(item)}
                  />
                ))
              ) : (
                <EmptyState
                  title="Nothing logged yet"
                  text="Add an income or expense to start your monthly story."
                  action="Add first entry"
                  onAction={() => setComposer(true)}
                />
              )}
            </View>
            <Pressable
              onPress={() => setComposer(true)}
              accessibilityRole="button"
              accessibilityLabel="Add income or expense"
              style={styles.fab}
            >
              <Icon name="add" size={22} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Add entry
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
      {(composer || !!editing) && (
        <TransactionComposer
          visible
          categories={data.categories}
          currency={data.preferences.currency}
          editing={editing}
          onClose={() => {
            setComposer(false);
            setEditing(null);
          }}
          onSave={(item) => ledger.saveTransaction(item)}
        />
      )}
    </SafeAreaView>
  );
}
function Onboarding({
  initialCurrency,
  onFinish,
}: {
  initialCurrency: string;
  onFinish: (currency: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState(initialCurrency);
  const steps = [
    {
      icon: "book-outline" as const,
      title: "Make money feel simpler.",
      body: "A calm little place to notice what comes in, what goes out, and what matters to you.",
    },
    {
      icon: "flash-outline" as const,
      title: "Log it in a moment.",
      body: "Pick a category, add an amount, and get right back to your day. Your entries stay on this phone when offline.",
    },
    {
      icon: "sparkles-outline" as const,
      title: "Start with your currency.",
      body: "Choose the money format you use most. You can change it later in Settings.",
    },
  ];
  const current = steps[step];
  return (
    <View style={styles.onboard}>
      <View style={styles.onboardTop}>
        <Text
          style={{
            color: C.green,
            fontWeight: "800",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          A FRESH PAGE
        </Text>
        <Pressable
          onPress={() => onFinish(currency)}
          accessibilityRole="button"
        >
          <Text style={{ color: C.muted, fontWeight: "600" }}>Skip</Text>
        </Pressable>
      </View>
      <View style={styles.onboardArt}>
        <View style={styles.artCircle}>
          <Icon name={current.icon} size={42} color={C.green} />
        </View>
        <View style={styles.leafDot}>
          <Icon name="leaf" size={17} color="#fff" />
        </View>
      </View>
      <Text
        style={{
          fontSize: 29,
          lineHeight: 35,
          fontWeight: "800",
          color: C.ink,
          letterSpacing: -0.7,
        }}
      >
        {current.title}
      </Text>
      <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23 }}>
        {current.body}
      </Text>
      {step === 2 && (
        <View style={styles.currencyWrap}>
          {CURRENCIES.map((value) => (
            <Pressable
              key={value}
              onPress={() => setCurrency(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: currency === value }}
              style={[
                styles.currencyChip,
                currency === value && {
                  backgroundColor: C.green,
                  borderColor: C.green,
                },
              ]}
            >
              <Text
                style={{
                  color: currency === value ? "#fff" : C.ink,
                  fontWeight: "700",
                }}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.onboardBottom}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 23 : 7,
                height: 7,
                borderRadius: 6,
                backgroundColor: i === step ? C.green : "#DCE1D9",
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={() => (step < 2 ? setStep(step + 1) : onFinish(currency))}
          accessibilityRole="button"
          style={styles.onboardButton}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {step === 2 ? "Start tracking" : "Continue"}
          </Text>
          <Icon name="arrow-forward" size={17} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#E7EFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    backgroundColor: C.green,
    borderRadius: 25,
    padding: 21,
    overflow: "hidden",
    ...shadow,
  },
  balanceLabel: {
    color: "#D4E4D3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 14,
  },
  balanceHint: { color: "#DCEAD8", fontSize: 12, marginTop: 5 },
  balanceLine: { flexDirection: "row", gap: 5, marginTop: 22 },
  balanceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  balanceMetaText: { color: "#E2EDE1", fontSize: 11, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  addTiny: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#EAF3EC",
    borderRadius: 11,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },
  categoryStat: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  fab: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: C.ink,
    minHeight: 49,
    paddingHorizontal: 22,
    borderRadius: 17,
    ...shadow,
  },
  onboard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    padding: 21,
    gap: 16,
    minHeight: 500,
    justifyContent: "space-between",
    ...shadow,
  },
  onboardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  onboardArt: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  artCircle: {
    width: 122,
    height: 122,
    borderRadius: 44,
    backgroundColor: "#EAF3EC",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
  },
  leafDot: {
    position: "absolute",
    bottom: 23,
    right: "30%",
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  currencyChip: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  onboardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  onboardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.green,
    borderRadius: 15,
    paddingHorizontal: 17,
    minHeight: 48,
  },
});
