import React, {  useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { todosTable, Todo } from '../../store/shema';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppDispatch } from '../../hooks/hook';
import { setNotifications } from '../../slices/menuSlice';
import * as Notifications from 'expo-notifications';

const notifications = {
    async cancel(id: string) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
};

export default function TaskListScreen() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const db = drizzle(useSQLiteContext());
    const dispatch = useAppDispatch();
    const { refresh } = useLocalSearchParams();

    

    const loadTodos = useCallback(async () => {
        try {
            const result = await db.select().from(todosTable).all();
            setTodos(result);
            
            const uncompletedCount = result.filter(todo => !todo.completed).length;
            dispatch(setNotifications(uncompletedCount));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTodos();
        }, [loadTodos, refresh])
    );

    const toggleCompletion = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await db.update(todosTable)
                .set({ completed: !todo.completed })
                .where(eq(todosTable.id, id))
                .execute();
            loadTodos(); 
        }
    };

    const deleteTodo = async (id: number, notificationId: string) => {
        await notifications.cancel(notificationId);
        await db.delete(todosTable)
            .where(eq(todosTable.id, id))
            .execute();
        loadTodos(); 
    };

    const renderItem = ({ item }: { item: Todo }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity 
                onPress={() => toggleCompletion(item.id)} 
                style={styles.taskTextContainer}
            >
                <Text style={[styles.taskText, item.completed && styles.completedText]}>
                    {item.todo}
                </Text>
                <Text style={styles.taskDate}>
                    {new Date(item.date).toLocaleDateString('uk-UA')}
                </Text>
                <Text style={styles.taskPriority}>Пріоритет: {item.priority}</Text>
            </TouchableOpacity>
            <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => item.notificationId && deleteTodo(item.id, item.notificationId)}
                    accessibilityRole="button"
                    accessibilityLabel="delete button">
                    <AntDesign name="delete" size={20} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>List</Text>
            
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    data={todos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Немає завдань! Додайте перше</Text>
                    }
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
    marginBottom: 25,
    marginTop: 15,
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
