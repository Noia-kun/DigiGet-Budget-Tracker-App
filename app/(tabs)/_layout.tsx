import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/components/ledger/ui";
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "grid-outline",
  activity: "receipt-outline",
  insights: "pie-chart-outline",
  settings: "settings-outline",
};
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: "#969F97",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 1 },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              width: 38,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 13,
              backgroundColor: focused ? "#E6F1E9" : "transparent",
            }}
          >
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={19}
              color={color}
            />
          </View>
        ),
        tabBarStyle: {
          height: 60 + bottom,
          paddingTop: 7,
          paddingBottom: bottom,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E6E9E1",
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarButtonTestID: `tab-${route.name}`,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarAccessibilityLabel: "Home" }}
      />
      <Tabs.Screen
        name="activity"
        options={{ title: "Activity", tabBarAccessibilityLabel: "Activity" }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarAccessibilityLabel: "Monthly insights",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarAccessibilityLabel: "Settings" }}
      />
    </Tabs>
  );
}
