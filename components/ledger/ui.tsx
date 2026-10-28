import { Icon } from "@/components/ledger/Icon";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  formatMoney,
  monthLabel,
  monthTotals,
  type Category,
  type Transaction,
} from "@/shared/ledger";

export const C = {
  paper: "#F7F7F1",
  card: "#FFFFFF",
  ink: "#17231C",
  muted: "#7D867F",
  line: "#E6E9E1",
  green: "#2F7A58",
  paleGreen: "#E6F1E9",
  coral: "#C97158",
  paleCoral: "#FAEAE4",
  gold: "#D9B85B",
  blue: "#819CA6",
};
export const shadow = Platform.select({
  web: { boxShadow: "0 8px 24px rgba(26,43,32,0.06)" } as any,
  default: {
    shadowColor: "#27392E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
export const page = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 108,
    gap: 18,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  title: { fontSize: 28, color: C.ink, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    ...shadow,
  },
  sectionTitle: { color: C.ink, fontWeight: "700", fontSize: 17 },
  label: {
    color: C.muted,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  body: { color: C.ink, fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center" },
});
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: C.green,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="book-outline" size={size * 0.58} color="#FFF" />
      <View
        style={{
          position: "absolute",
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: 8,
          backgroundColor: "#B9D58B",
          right: size * 0.16,
          top: size * 0.13,
        }}
      />
    </View>
  );
}

export function MonthPicker({
  date,
  onChange,
}: {
  date: Date;
  onChange: (next: Date) => void;
}) {
  const shift = (amount: number) =>
    onChange(new Date(date.getFullYear(), date.getMonth() + amount, 1));
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#EEF0E8",
        borderRadius: 15,
        padding: 4,
      }}
    >
      <Pressable
        onPress={() => shift(-1)}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        hitSlop={8}
        style={styles.monthButton}
      >
        <Icon name="chevron-back" size={18} color={C.ink} />
      </Pressable>
      <Text style={{ color: C.ink, fontWeight: "700", fontSize: 14 }}>
        {monthLabel(date)}
      </Text>
      <Pressable
        onPress={() => shift(1)}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        hitSlop={8}
        style={styles.monthButton}
      >
        <Icon name="chevron-forward" size={18} color={C.ink} />
      </Pressable>
    </View>
  );
}
export function TransactionRow({
  item,
  category,
  currency,
  onPress,
  onDelete,
}: {
  item: Transaction;
  category?: Category;
  currency: string;
  onPress: () => void;
  onDelete?: () => void;
}) {
  const income = item.kind === "income";
  const date = new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return (
    <View style={styles.transactionRow}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${category?.name ?? "Transaction"}, ${income ? "income" : "expense"}, ${formatMoney(item.amountCents, currency)}. Edit`}
        style={{
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
          gap: 12,
          minHeight: 58,
        }}
      >
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: category?.color ?? "#A0AAA3" },
          ]}
        >
          <Icon
            name={(category?.icon ?? "ellipse-outline") as any}
            size={18}
            color="#fff"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: C.ink, fontWeight: "700", fontSize: 14 }}
          >
            {item.note || category?.name || "Transaction"}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
            {category?.name ?? "Other"} · {date}
          </Text>
        </View>
        <Text
          style={{
            color: income ? C.green : C.ink,
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          {income ? "+" : "−"}
          {formatMoney(item.amountCents, currency)}
        </Text>
      </Pressable>
      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
          hitSlop={8}
          style={{ padding: 8, marginLeft: 5 }}
        >
          <Icon name="trash-outline" size={17} color="#A9B0A8" />
        </Pressable>
      )}
    </View>
  );
}
export function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ alignItems: "center", padding: 22, gap: 9 }}>
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 20,
          backgroundColor: C.paleGreen,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="leaf-outline" size={25} color={C.green} />
      </View>
      <Text style={{ fontWeight: "700", color: C.ink, fontSize: 16 }}>
        {title}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: C.muted,
          fontSize: 13,
          lineHeight: 19,
        }}
      >
        {text}
      </Text>
      {action && (
        <Pressable onPress={onAction} style={styles.primarySmall}>
          <Text style={{ color: "white", fontWeight: "700" }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
export function DonutChart({
  items,
  size = 142,
}: {
  items: { value: number; color: string }[];
  size?: number;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = size * 0.37;
  const stroke = size * 0.13;
  const circumference = 2 * Math.PI * radius;
  const arcs = useMemo(() => {
    const positive = items.filter((item) => item.value > 0);
    return positive.map((item, index) => {
      const offset = positive
        .slice(0, index)
        .reduce(
          (sum, prior) =>
            sum + (total ? (prior.value / total) * circumference : 0),
          0,
        );
      const length = total ? (item.value / total) * circumference : 0;
      return { ...item, length: Math.max(0, length - 2), offset };
    });
  }, [items, total, circumference]);
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EEF0E8"
          strokeWidth={stroke}
          fill="none"
        />
        {arcs.map((arc, i) => (
          <Circle
            key={`${arc.color}-${i}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={arc.color}
            strokeWidth={stroke}
            strokeDasharray={`${arc.length} ${circumference}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </Svg>
      <Text style={{ fontSize: 11, color: C.muted, fontWeight: "600" }}>
        SPENT
      </Text>
      <Text
        style={{ color: C.ink, fontSize: 16, fontWeight: "800", marginTop: 2 }}
      >
        {total ? "This month" : "No data"}
      </Text>
    </View>
  );
}
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalShade}>
        <View style={styles.dialog}>
          <Text style={{ color: C.ink, fontSize: 19, fontWeight: "800" }}>
            {title}
          </Text>
          <Text
            style={{
              color: C.muted,
              fontSize: 14,
              lineHeight: 20,
              marginTop: 8,
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              style={[styles.dialogBtn, { backgroundColor: "#F0F1EC" }]}
            >
              <Text style={{ color: C.ink, fontWeight: "700" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              style={[styles.dialogBtn, { backgroundColor: C.coral }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
export function TextField({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  accessibilityLabel,
  style,
  ...props
}: any) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A2AAA3"
      keyboardType={keyboardType}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      style={[styles.input, style]}
      {...props}
    />
  );
}
export function LoadingState() {
  return (
    <View
      style={{
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator color={C.green} />
      <Text style={{ color: C.muted, fontSize: 13 }}>Opening your ledger…</Text>
    </View>
  );
}
export function SummaryMini({
  title,
  value,
  income,
  currency,
}: {
  title: string;
  value: number;
  income?: boolean;
  currency: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F6F1",
        padding: 13,
        borderRadius: 16,
      }}
    >
      <Text style={page.label}>{title}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          color: income ? C.green : C.ink,
          fontSize: 18,
          fontWeight: "800",
          marginTop: 7,
        }}
      >
        {formatMoney(value, currency)}
      </Text>
    </View>
  );
}
export function totalsFor(items: Transaction[]) {
  return monthTotals(items);
}
const styles = StyleSheet.create({
  monthButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0EB",
    paddingVertical: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primarySmall: {
    backgroundColor: C.green,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 8,
  },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(12,24,16,0.36)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    ...shadow,
  },
  dialogBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F7F8F4",
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    color: C.ink,
    fontSize: 15,
  },
});
