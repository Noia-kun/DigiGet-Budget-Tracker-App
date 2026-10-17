import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { LedgerProvider } from "@/hooks/ledger-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

const metrics = initialWindowMetrics ?? {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};
// Ensure minimum padding for top and bottom
const providerInitialMetrics = {
  ...metrics,
  insets: {
    ...metrics.insets,
    top: Math.max(metrics.insets.top, 16),
    bottom: Math.max(metrics.insets.bottom, 12),
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LedgerProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />
          </LedgerProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}