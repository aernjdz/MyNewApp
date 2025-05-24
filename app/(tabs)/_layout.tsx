import { Tabs } from "expo-router";
import { Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from '../../hooks/hook';
import { selectNotifications, setNotifications } from '../../slices/menuSlice';
import { useEffect } from 'react';

import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { todosTable } from '../../store/shema';

export default function TabLayout() {
  const notifications = useAppSelector(selectNotifications);
  const dispatch = useAppDispatch();
  const db = drizzle(useSQLiteContext());

  useEffect(() => {
    const loadInitialCount = async () => {
      try {
        const result = await db.select().from(todosTable).all();
        const uncompletedCount = result.filter(todo => !todo.completed).length;
        dispatch(setNotifications(uncompletedCount));
      } catch (error) {
        console.error('Помилка завантаження завдань:', error);
      }
    };

    loadInitialCount();
  }, [db, dispatch]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38b000',          // колір активної іконки/тексту
        tabBarInactiveTintColor: '#888888',        // неактивної
        tabBarStyle: {
          backgroundColor: '#1b1f23',              // фон таббару
          borderTopColor: '#2c3136',
          height: 60,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Створити',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircleo" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Список',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list" size={size} color={color} />
          ),
          tabBarBadge: notifications === 0 ? undefined : notifications,
          tabBarBadgeStyle: {
            backgroundColor: '#38b000',
            color: '#fff',
          },
        }}
      />
    </Tabs>
  );
}
