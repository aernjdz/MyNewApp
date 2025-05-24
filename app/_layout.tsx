import { Stack } from 'expo-router';
import { Suspense } from 'react';
import { ActivityIndicator , View,Text} from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { todosTable } from '../store/shema';
import migrations from '../drizzle/migrations/migrations';
const databaseName = 'ToDoList.db';

export default function RootLayout() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={databaseName} useSuspense>
        <Provider store={store}>
          <DatabaseProvider>
            {/* Не треба NavigationContainer тут! */}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </DatabaseProvider>
        </Provider>
      </SQLiteProvider>
    </Suspense>
  );
}

function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = drizzle(useSQLiteContext(), { schema: { todosTable } });
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Помилка міграцій: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return <ActivityIndicator size="large" />;
  }

  return children;

}
