import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "@/components/ledger/Icon";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C, ConfirmDialog, LoadingState, page, TextField } from "@/components/ledger/ui";
import { useLedger } from "@/hooks/ledger-context";
import { CURRENCIES, currencySymbol, type Category, type TransactionKind } from "@/shared/ledger";
import { exportBackup } from "@/lib/backup";
const REMINDER_KEY = "pocket-ledger.reminder-id";
export default function SettingsScreen() {
  const router = useRouter();
  const ledger = useLedger();
  const [permissionMessage, setPermissionMessage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryKind, setCategoryKind] = useState<TransactionKind>("expense");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [categoryMessageError, setCategoryMessageError] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState<Category | null>(null);
  const [dataMessage, setDataMessage] = useState("");
  const saveReminder = async (
    enabled: boolean,
    time = ledger.data.preferences.reminderTime,
  ) => {
    if (!enabled) {
      try {
        const Notifications = await import("expo-notifications");
        const id = await AsyncStorage.getItem(REMINDER_KEY);
        if (id) await Notifications.cancelScheduledNotificationAsync(id);
        await AsyncStorage.removeItem(REMINDER_KEY);
      } catch {}
      ledger.updatePreferences({ reminderEnabled: false });
      setPermissionMessage("Reminder turned off.");
      return;
    }
    if (Platform.OS === "web") {
      setPermissionMessage(
        "Reminders are scheduled on your phone. Open this app in Expo Go to enable device notifications.",
      );
      return;
    }
    try {
      const Notifications = await import("expo-notifications");
      const current = await Notifications.getPermissionsAsync();
      const permission = current.granted
        ? current
        : await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        setPermissionMessage(
          "Notifications are off. Allow them in your device Settings to use a reminder.",
        );
        ledger.updatePreferences({ reminderEnabled: false });
        return;
      }
      const [hourText, minuteText] = time.split(":");
      const hour = Number(hourText);
      const minute = Number(minuteText);
      if (
        !/^\d{2}:\d{2}$/.test(time) ||
        hour > 23 ||
        minute > 59 ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute)
      ) {
        setPermissionMessage("Choose a reminder time between 00:00 and 23:59.");
        return;
      }
      if (Platform.OS === "android")
        await Notifications.setNotificationChannelAsync("ledger-reminders", {
          name: "Ledger reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2F7A58",
        });
      const oldId = await AsyncStorage.getItem(REMINDER_KEY);
      if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "A minute for your money?",
          body: "Log today's spending while it’s still fresh.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: "ledger-reminders",
          hour,
          minute,
        },
      });
      await AsyncStorage.setItem(REMINDER_KEY, id);
      ledger.updatePreferences({ reminderEnabled: true, reminderTime: time });
      setPermissionMessage(`Daily reminder set for ${time}.`);
    } catch {
      setPermissionMessage(
        "We couldn’t schedule that reminder. Check notification permission and try again.",
      );
    }
  };
  const addCategory = () => {
    const name = categoryName.trim();
    if (!name) {
      setCategoryMessageError(true);
      setCategoryMessage("Enter a category name first.");
      return;
    }
    if (
      ledger.data.categories.some(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase() &&
          item.kind === categoryKind,
      )
    ) {
      setCategoryMessageError(true);
      setCategoryMessage("That category already exists.");
      return;
    }
    ledger.saveCategory({
      id: `custom-${Date.now().toString(36)}`,
      name: name.slice(0, 24),
      kind: categoryKind,
      color: categoryKind === "income" ? "#83AE75" : "#C493BD",
      icon: "pricetag-outline",
    });
    setCategoryName("");
    setCategoryMessageError(false);
    setCategoryMessage(`${name} added to ${categoryKind} categories.`);
  };
  const itemCount = ledger.data.transactions.length;
  const categoriesForKind = ledger.data.categories.filter(
    (item) => item.kind === categoryKind,
  );
  const activeCategories = categoriesForKind.filter((item) => !item.archived);
  const archivedCategories = categoriesForKind.filter((item) => item.archived);
  const categoryRemovalCount = categoryToRemove
    ? ledger.data.transactions.filter(
        (item) => item.categoryId === categoryToRemove.id,
      ).length
    : 0;
  const removeCategory = () => {
    if (!categoryToRemove) return;
    const category = categoryToRemove;
    const removed = ledger.archiveCategory(category.id);
    setCategoryMessageError(!removed);
    setCategoryMessage(
      removed
        ? `${category.name} removed from new entries. Past entries remain unchanged.`
        : `Keep at least one active ${category.kind} category.`,
    );
    setCategoryToRemove(null);
  };
  const restoreCategory = (category: Category) => {
    ledger.restoreCategory(category.id);
    setCategoryMessageError(false);
    setCategoryMessage(`${category.name} restored to ${category.kind} categories.`);
  };
  const onExport = async () => {
    try {
      await exportBackup(ledger.data);
      setDataMessage("");
    } catch {
      setDataMessage("We couldn’t create the backup. Try again on your phone.");
    }
  };
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text style={page.title}>Settings</Text>
          <Text style={page.subtitle}>Make your ledger feel like yours.</Text>
        </View>
        <View style={page.card}>
          <Text style={page.sectionTitle}>Your preferences</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Currency</Text>
              <Text style={styles.rowHint}>Used throughout your summaries</Text>
            </View>
            <View style={styles.currency}>
              <Text style={{ color: C.green, fontWeight: "800" }}>
                {ledger.data.preferences.currency} · {currencySymbol(ledger.data.preferences.currency)}
              </Text>
              <Icon name="chevron-down" size={14} color={C.green} />
            </View>
          </View>
          <View style={styles.currencyList}>
            {CURRENCIES.map((value) => (
              <Pressable
                key={value}
                onPress={() => ledger.updatePreferences({ currency: value })}
                accessibilityRole="button"
                accessibilityState={{
                  selected: ledger.data.preferences.currency === value,
                }}
                style={[
                  styles.currencyChip,
                  ledger.data.preferences.currency === value && {
                    backgroundColor: C.green,
                    borderColor: C.green,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      ledger.data.preferences.currency === value
                            ? "#fff"
                            : C.ink,
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {value} · {currencySymbol(value)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={page.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={page.sectionTitle}>Gentle reminders</Text>
              <Text style={[styles.rowHint, { marginTop: 4 }]}>
                A daily nudge to log while it’s fresh.
              </Text>
            </View>
            <Pressable
              onPress={() =>
                void saveReminder(!ledger.data.preferences.reminderEnabled)
              }
              accessibilityRole="switch"
              accessibilityState={{
                checked: ledger.data.preferences.reminderEnabled,
              }}
              style={[
                styles.switch,
                ledger.data.preferences.reminderEnabled && {
                  backgroundColor: C.green,
                },
              ]}
            >
              <View
                style={[
                  styles.knob,
                  ledger.data.preferences.reminderEnabled && {
                    alignSelf: "flex-end",
                  },
                ]}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 9,
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text style={{ color: C.muted, fontWeight: "600", fontSize: 13 }}>
              Reminder time
            </Text>
            <TextField
              value={ledger.data.preferences.reminderTime}
              onChangeText={(value: string) =>
                ledger.updatePreferences({ reminderTime: value })
              }
              placeholder="20:00"
              accessibilityLabel="Reminder time in 24-hour format"
              style={{ flex: 1, maxWidth: 112, minHeight: 41 }}
            />
            <Pressable
              onPress={() =>
                void saveReminder(true, ledger.data.preferences.reminderTime)
              }
              accessibilityRole="button"
              style={styles.outlineBtn}
            >
              <Text style={{ color: C.green, fontWeight: "700", fontSize: 12 }}>
                Save time
              </Text>
            </Pressable>
          </View>
          {permissionMessage ? (
            <Text
              accessibilityRole="alert"
              style={{
                color:
                  permissionMessage.includes("couldn’t") ||
                  permissionMessage.includes("off")
                    ? C.coral
                    : C.green,
                fontSize: 12,
                lineHeight: 18,
                marginTop: 10,
              }}
            >
              {permissionMessage}
            </Text>
          ) : null}
          <Text style={styles.tinyHint}>
            You’re always in control. Turn reminders off any time.
          </Text>
        </View>
        <View style={page.card}>
          <Text style={page.sectionTitle}>Categories</Text>
          <Text style={[styles.rowHint, { marginTop: 3 }]}>
            Add the labels that match your life.
          </Text>
          <View style={styles.categorySegments}>
            {(["expense", "income"] as const).map((value) => (
              <Pressable
                key={value}
                onPress={() => setCategoryKind(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: categoryKind === value }}
                style={[
                  styles.segment,
                  categoryKind === value && { backgroundColor: C.green },
                ]}
              >
                <Text
                  style={{
                    color: categoryKind === value ? "#fff" : C.muted,
                    fontWeight: "700",
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextField
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g. Pet care"
              accessibilityLabel="New category name"
              style={{ flex: 1 }}
              maxLength={24}
            />
            <Pressable
              onPress={addCategory}
              accessibilityRole="button"
              style={styles.addBtn}
            >
              <Icon name="add" size={19} color="#fff" />
            </Pressable>
          </View>
          {categoryMessage ? (
            <Text
              accessibilityLiveRegion="polite"
              style={{
                color: categoryMessageError ? C.coral : C.green,
                fontSize: 12,
                marginTop: 9,
              }}
            >
              {categoryMessage}
            </Text>
          ) : null}
          <View style={styles.categoryChips}>
            {activeCategories.map((item) => (
              <View key={item.id} style={styles.categoryPill}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text
                  style={{
                    color: C.ink,
                    fontSize: 11,
                    fontWeight: "600",
                    flexShrink: 1,
                  }}
                >
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => setCategoryToRemove(item)}
                  disabled={activeCategories.length <= 1}
                  accessibilityRole="button"
                  accessibilityLabel={
                    activeCategories.length <= 1
                      ? `Cannot remove the last active ${categoryKind} category`
                      : `Remove ${item.name} category`
                  }
                  accessibilityState={{ disabled: activeCategories.length <= 1 }}
                  hitSlop={6}
                  style={[
                    styles.categoryAction,
                    activeCategories.length <= 1 && { opacity: 0.4 },
                  ]}
                >
                  <Icon name="trash-outline" size={15} color={C.coral} />
                </Pressable>
              </View>
            ))}
          </View>
          {activeCategories.length === 0 ? (
            <Text style={styles.tinyHint}>
              No active {categoryKind} categories. Add one above to keep logging entries.
            </Text>
          ) : (
            <Text style={styles.tinyHint}>
              Removed categories stay in past entries. Keep at least one active {categoryKind} category.
            </Text>
          )}
          {archivedCategories.length > 0 && (
            <View style={styles.archivedCategoryList}>
              <Text style={styles.archivedHeading}>Archived {categoryKind} categories</Text>
              {archivedCategories.map((item) => {
                const uses = ledger.data.transactions.filter(
                  (entry) => entry.categoryId === item.id,
                ).length;
                return (
                  <View key={item.id} style={styles.archivedCategoryRow}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.ink, fontSize: 12, fontWeight: "700" }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                        {uses} past {uses === 1 ? "entry" : "entries"} · history kept
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => restoreCategory(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Restore ${item.name} category`}
                      style={styles.restoreBtn}
                    >
                      <Icon name="refresh-outline" size={14} color={C.green} />
                      <Text style={{ color: C.green, fontWeight: "700", fontSize: 12 }}>
                        Restore
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        <View style={page.card}>
          <Text style={page.sectionTitle}>Your data</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {itemCount} {itemCount === 1 ? "entry" : "entries"} saved
              </Text>
              <Text style={styles.rowHint}>Stored only on this phone.</Text>
            </View>
          </View>
        </View>
        <Pressable
            onPress={() => void onExport()}
            accessibilityRole="button"
            style={[styles.outlineBtn, { alignSelf: "flex-start" }]}
          >
            <Text style={{ color: C.green, fontWeight: "700", fontSize: 12 }}>
              Export backup
            </Text>
          </Pressable>
          {dataMessage ? (
            <Text
              accessibilityRole="alert"
              style={{ color: C.coral, fontSize: 12, marginTop: 10 }}
            >
              {dataMessage}
            </Text>
          ) : null}
        <Pressable
          onPress={() => {
            ledger.restartOnboarding();
            router.replace("/");
          }}
          accessibilityRole="button"
          style={styles.replay}
        >
          <Icon name="refresh-outline" size={16} color={C.green} />
          <Text style={{ color: C.green, fontWeight: "700" }}>
            Replay the introduction
          </Text>
        </Pressable>
        <Text style={styles.footer}>Made for a little more clarity.</Text>
      </ScrollView>
      <ConfirmDialog
        visible={!!categoryToRemove}
        title={`Remove ${categoryToRemove?.name ?? "category"}?`}
        message={
          categoryRemovalCount > 0
            ? `Remove it from new entries? ${categoryRemovalCount} existing ${categoryRemovalCount === 1 ? "entry" : "entries"} will keep this category in history. You can restore it later.`
            : "It will no longer appear for new entries. You can restore it later if you change your mind."
        }
        confirmLabel="Remove category"
        onCancel={() => setCategoryToRemove(null)}
        onConfirm={removeCategory}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowTitle: { color: C.ink, fontWeight: "700", fontSize: 14 },
  rowHint: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  currency: {
    borderRadius: 11,
    backgroundColor: "#EAF3EC",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  currencyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    paddingBottom: 15,
  },
  currencyChip: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
  },
  switch: {
    width: 48,
    height: 28,
    backgroundColor: "#D8DDD5",
    borderRadius: 20,
    justifyContent: "center",
    padding: 3,
  },
  knob: { width: 22, height: 22, borderRadius: 12, backgroundColor: "#fff" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#CFE1D3",
    backgroundColor: "#F5FAF5",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  tinyHint: { color: C.muted, fontSize: 11, marginTop: 10 },
  categorySegments: { flexDirection: "row", gap: 6, marginVertical: 12 },
  segment: {
    backgroundColor: "#F0F2EC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtn: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.green,
    borderRadius: 14,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 15,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  categoryAction: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
  },
  archivedCategoryList: { gap: 8, marginTop: 14 },
  archivedHeading: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  archivedCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#F7F8F5",
  },
  restoreBtn: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EAF3EC",
  },
  replay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
  },
  footer: {
    color: C.muted,
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 12,
  },
});
