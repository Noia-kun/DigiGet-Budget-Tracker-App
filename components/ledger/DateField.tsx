import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ledger/Icon";
import { C, TextField } from "@/components/ledger/ui";
import { dateKey } from "@/shared/ledger";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
};

export function DateField({ value, onChange, placeholder, label }: Props) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  const text = value
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : placeholder;
  const onPick = (_: unknown, picked?: Date) => {
    if (picked) onChange(dateKey(picked));
  };
  if (Platform.OS === "web")
    return (
      <TextField
        value={value}
        onChangeText={onChange}
        placeholder={`${placeholder} · YYYY-MM-DD`}
        accessibilityLabel={label}
        style={{ flex: 1, minWidth: 0, fontSize: 13 }}
      />
    );
  if (Platform.OS === "ios")
    return <DateTimePicker value={date} mode="date" onChange={onPick} />;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() =>
          DateTimePickerAndroid.open({
            value: date,
            mode: "date",
            onChange: (event, picked) => {
              if (event.type === "set") onPick(event, picked);
            },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`${label}${value ? `: ${text}` : ""}. Change`}
        style={styles.button}
      >
        <Text
          numberOfLines={1}
          style={{
            color: value ? C.ink : C.muted,
            fontSize: 13,
            fontWeight: value ? "700" : "500",
          }}
        >
          {text}
        </Text>
      </Pressable>
      {!!value && (
        <Pressable
          onPress={() => onChange("")}
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label.toLowerCase()}`}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Icon name="close" size={14} color={C.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F7F8F4",
    borderWidth: 1,
    borderColor: C.line,
    paddingLeft: 12,
    paddingRight: 8,
  },
  button: { flex: 1, justifyContent: "center", minHeight: 46 },
});