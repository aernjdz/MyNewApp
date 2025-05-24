
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function TabLayout() {

  return (
  <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }} />
            <Tabs.Screen name="todoList"
                options={{
                    title: "To-Do",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    )
                }} />
            <Tabs.Screen name="gallery"
                options={{
                    title: "Gallery",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="color-palette-outline" size={size} color={color} />
                    ),
                }} />
            <Tabs.Screen name="animation"
                options={{
                    title: "Animation",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="logo-ionic" size={size} color={color} />
                    ),
                }} />
            <Tabs.Screen name="gesture"
                options={{
                    title: "Gestures",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="hand-left-outline" size={size} color={color} />
                    ),
                }} />
        </Tabs>
  );
}
