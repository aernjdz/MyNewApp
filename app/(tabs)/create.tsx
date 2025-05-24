import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Todo, todosTable } from '../../store/shema';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../../hooks/hook';
import { incrementNotifications } from '../../slices/menuSlice';
import { eq } from 'drizzle-orm';
import useNotifications from '../../hooks/useNotifications';
import * as Notifications from 'expo-notifications';

export default function CreateTaskScreen() {
  const db = drizzle(useSQLiteContext());
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const { control, handleSubmit, setValue, reset } = useForm<Pick<Todo, 'todo' | 'date' | 'time' | 'priority'>>({
    defaultValues: {
      todo: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      priority: 'low',
    }
  });

  const { scheduleNotification } = useNotifications({
    onDelete: async (taskId: string) => {
      try {
        await db.delete(todosTable)
          .where(eq(todosTable.id, parseInt(taskId)))
          .execute();

        const notificationIdResult = await db.select({ notificationId: todosTable.notificationId })
          .from(todosTable)
          .where(eq(todosTable.id, parseInt(taskId)))
          .execute();

        if (notificationIdResult[0]?.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(
            notificationIdResult[0].notificationId
          );
        }

        dispatch(incrementNotifications());
        router.push({
          pathname: '/list',
          params: { refresh: Date.now() }
        });
      } catch (error) {
        Alert.alert('Помилка', 'Не вдалося видалити завдання');
      }
    },
    onShow: () => router.push('/list')
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setValue('date', formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      setValue('time', formattedTime);
    }
  };

  const onSubmit = async (data: Pick<Todo, 'todo' | 'date' | 'time' | 'priority'>) => {
    if (!data.todo.trim()) {
      Alert.alert('Помилка', 'Введіть назву завдання');
      return;
    }

    try {
      const result = await db.insert(todosTable).values({
        todo: data.todo,
        completed: false,
        date: data.date,
        time: data.time,
        priority: data.priority
      }).returning({ id: todosTable.id }).execute();

      const newTaskId = result[0].id.toString();
      const notificationDate = new Date(`${data.date}T${data.time}`);
      
      const notificationId = await scheduleNotification(
        newTaskId,
        data.todo,
        notificationDate
      );

      await db.update(todosTable)
        .set({ notificationId })
        .where(eq(todosTable.id, parseInt(newTaskId)))
        .execute();

      dispatch(incrementNotifications());
      reset();
      router.replace({
        pathname: '/list',
        params: { refresh: Date.now() }
      });

    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти завдання');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Нове завдання</Text>

      <Controller
        control={control}
        name="todo"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Введіть назву завдання"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

     <View style={styles.buttonStack}>
  <TouchableOpacity 
    style={styles.fancyButton}
    onPress={() => setShowDatePicker(true)}
  >
    <Text style={styles.fancyButtonText}>🗓️ Обрати дату</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.fancyButton}
    onPress={() => setShowTimePicker(true)}
  >
    <Text style={styles.fancyButtonText}>⏰ Обрати час</Text>
  </TouchableOpacity>
</View>


      <View style={styles.selectedDateTimeContainer}>
        <Text style={styles.selectedDateTimeText}>
          Обрано: {control._formValues.date} {control._formValues.time}
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}

      <Text style={styles.priorityLabel}>Оберіть пріоритет:</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.picker}>
            <Picker.Item label="Низький" value="low" />
            <Picker.Item label="Середній" value="medium" />
            <Picker.Item label="Високий" value="high" />
          </Picker>
        )}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.submitButtonText}>Створити завдання</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1b1f23',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2c3136',
    color: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#38b000',
    width: '100%',
  },
  buttonStack: {
  width: '100%',
  marginBottom: 16,
},

fancyButton: {
  backgroundColor: '#2c3136',
  borderWidth: 2,
  borderColor: '#38b000',
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginVertical: 8,
  width: '100%',
  alignItems: 'center',
  shadowColor: '#38b000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
},

fancyButtonText: {
  color: '#ffffff',
  fontSize: 17,
  fontWeight: '600',
  letterSpacing: 0.5,
},

  picker: {
    backgroundColor: '#2c3136',
    color: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#38b000',
    width: '100%',
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#2c3136',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#38b000',
  },
  dateTimeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
  },
  selectedDateTimeContainer: {
    backgroundColor: '#2c3136',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38b000',
    width: '100%',
  },
  selectedDateTimeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#38b000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  submitButtonText: {
    color: '#1b1f23',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
