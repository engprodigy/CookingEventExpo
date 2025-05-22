import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import EventsList from './components/EventsList';
import { API_URL } from './config';

export default function App() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('date');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setMode('date');
    setShow(true);
  };

  const showTimepicker = () => {
    setMode('time');
    setShow(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        title: title.trim(),
        eventTime: date.toISOString(),
        userId: "user123"
      };

      console.log('Attempting to connect to:', `${API_URL}/api/events`);
      console.log('Request data:', JSON.stringify(eventData, null, 2));

      // First, try to check if the server is reachable
      try {
        const testResponse = await fetch(`${API_URL}/api/events`, {
          method: 'OPTIONS',
        });
        console.log('Server connection test:', testResponse.status);
      } catch (testError) {
        console.error('Server connection test failed:', testError);
        throw new Error('Cannot connect to server. Please make sure the API server is running.');
      }

      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server success response:', result);
      Alert.alert('Success', 'Event created successfully!');
      
      // Reset form
      setTitle('');
      setDate(new Date());
      
    } catch (error) {
      console.error('Detailed error:', error);
      Alert.alert(
        'Connection Error',
        `Failed to connect to server at ${API_URL}\n\n` +
        'Please check:\n' +
        '1. The API server is running\n' +
        '2. The server is listening on port 3000\n' +
        '3. CORS is enabled on the server\n\n' +
        `Error details: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Event Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.header}>Create New Event</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Event Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} onPress={showTimepicker}>
              <Text style={styles.dateButtonText}>
                {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Events List Section */}
      <View style={styles.eventsListContainer}>
        <Text style={styles.sectionHeader}>Upcoming Events</Text>
        <EventsList />
      </View>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formSection: {
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  timeButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsListContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 10,
  },
});
