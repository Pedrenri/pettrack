import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#f3f4f6" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Animals", tabBarIcon: ({ color }) => <TabIcon emoji="🦎" color={color} /> }}
      />
      <Tabs.Screen
        name="schedules"
        options={{ title: "Schedules", tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20, opacity: color === "#10b981" ? 1 : 0.5 }}>{emoji}</Text>;
}
