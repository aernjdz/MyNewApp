import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Switch } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { todosTable, Todo as LocalTodo } from '../../store/shema';
import { useAppDispatch } from '../../hooks/hook';
import { setNotifications } from '../../slices/menuSlice';
import * as Notifications from 'expo-notifications';

type ApiTodo = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

const notifications = {
  async cancel(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  },
};

export default function TaskListScreen() {
  const [todos, setTodos] = useState<(LocalTodo | ApiTodo)[]>([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = drizzle(useSQLiteContext());
  const dispatch = useAppDispatch();

  const loadLocalTodos = useCallback(async () => {
    try {
      const result = await db.select().from(todosTable).all();
      setTodos(result);
      const uncompletedCount = result.filter((todo) => !todo.completed).length;
      dispatch(setNotifications(uncompletedCount));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApiTodos = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('https://dummyjson.com/todos?limit=20');
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setTodos(data.todos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTodos = useCallback(() => {
    setLoading(true);
    if (useAPI) {
      loadApiTodos();
    } else {
      loadLocalTodos();
    }
  }, [useAPI, loadApiTodos, loadLocalTodos]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const toggleCompletion = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || useAPI) return;
    await db.update(todosTable).set({ completed: !todo.completed }).where(eq(todosTable.id, id)).execute();
    loadTodos();
  };

  const deleteTodo = async (id: number, notificationId?: string) => {
    if (useAPI) return;
    if (notificationId) await notifications.cancel(notificationId);
    await db.delete(todosTable).where(eq(todosTable.id, id)).execute();
    loadTodos();
  };

  const renderItem = ({ item }: { item: LocalTodo | ApiTodo }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity style={styles.taskTextContainer} onPress={() => toggleCompletion(item.id)}>
        <Text style={[styles.taskText, item.completed && styles.completedText]}>{item.todo}</Text>

        {'date' in item && <Text style={styles.taskDate}>{new Date(item.date).toLocaleDateString('uk-UA')}</Text>}
        {'priority' in item && <Text style={styles.taskPriority}>Пріоритет: {item.priority}</Text>}
      </TouchableOpacity>

      <View style={styles.taskActions}>
        {item.completed ? (
          <AntDesign name="checkcircle" size={20} color="green" />
        ) : (
          <AntDesign name="clockcircleo" size={20} color="orange" />
        )}
        {!useAPI && 'notificationId' in item && (
          <TouchableOpacity onPress={() => deleteTodo(item.id, item.notificationId || '')}>
            <AntDesign name="delete" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task List</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: '#ccc', marginRight: 10 }}>API</Text>
        <Switch value={useAPI} onValueChange={setUseAPI} />
        <Text style={{ color: '#ccc', marginLeft: 10 }}>Local</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : error ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>Помилка: {error}</Text>
          <TouchableOpacity onPress={loadTodos}>
            <Text style={{ color: '#007BFF', marginTop: 10 }}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Немає завдань! Додайте перше</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1f23',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 20,
  },
  taskItem: {
    backgroundColor: '#2c3136',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#38b000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.2,
    borderColor: '#38b00066',
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskText: {
    fontSize: 16,
    color: '#ffffff',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6C757D',
  },
  taskDate: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 4,
  },
  taskPriority: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 2,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
