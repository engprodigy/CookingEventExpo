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
import NotificationFeed from './components/NotificationFeed';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, useTheme, themes } from './components/ThemeContext';
import { API_URL } from './config';

const AppContent = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // New state to track which event is being edited
  const [editingEvent, setEditingEvent] = useState(null);

  const { theme, isDark } = useTheme();
  const currentTheme = themes[theme];

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setMode('date');
    setShow(true);
  };

  const showTimepicker = () => {
    setMode('time');
    setShow(true);
  };

  // Function to handle receiving event data for editing
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(new Date(event.eventTime));
    setActiveTab('events'); // Switch back to events tab if needed
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Error', 'Event title cannot be empty.');
      return;
    }

    // Check if the event time is at least 2 minutes from now
    const now = new Date();
    const twoMinutesFromNow = new Date(now.getTime() - 2 * 60 * 1000);
    
    if (date < twoMinutesFromNow) {
      Alert.alert(
        'Invalid Time',
        'Event cannot be created in the past.'
      );
      return;
    }

    setIsSubmitting(true);
    
    // Determine if we are creating or editing
    const method = editingEvent ? 'PATCH' : 'POST';
    const url = editingEvent ? `${API_URL}/api/events/${editingEvent.id}` : `${API_URL}/api/events`;
    
    // Set the userId based on whether we are editing or creating
    const userId = editingEvent ? editingEvent.userId : "user123";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, eventTime: date.toISOString(), userId }),
      });

      if (!response.ok) {
        // Attempt to parse error response
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Clear the form and editing state after successful submission
      setTitle('');
      setDate(new Date());
      setEditingEvent(null);
      // Trigger events list refresh
      setRefreshTrigger(prev => prev + 1);

      Alert.alert('Success', editingEvent ? 'Event updated successfully!' : 'Event created successfully!');

    } catch (error) {
      console.error('Detailed error:', error);
      Alert.alert(
        'Connection Error',
        `Failed to ${editingEvent ? 'update' : 'create'} event.\n\n` +
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

  const renderEventsTab = () => (
    <View style={[styles.eventsContainer, { backgroundColor: currentTheme.background }]}>
      {/* Fixed Event Form Section */}
      <View style={[styles.formSection, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.header, { color: currentTheme.text }]}>{editingEvent ? 'Edit Event' : 'Create New Event'}</Text>
        
        <View style={[styles.formContainer, { backgroundColor: currentTheme.surface }]}>
          <Text style={[styles.label, { color: currentTheme.text }]}>Event Title</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.surface,
              color: currentTheme.text,
              borderColor: currentTheme.border
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor={currentTheme.textSecondary}
          />

          <Text style={[styles.label, { color: currentTheme.text }]}>Event Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border
              }]} 
              onPress={showDatepicker}
            >
              <Text style={[styles.dateButtonText, { color: currentTheme.text }]}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeButton, { 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border
              }]} 
              onPress={showTimepicker}
            >
              <Text style={[styles.dateButtonText, { color: currentTheme.text }]}>
                {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              { backgroundColor: currentTheme.primary }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? (editingEvent ? 'Updating Event...' : 'Creating Event...') : (editingEvent ? 'Update Event' : 'Create Event')}
            </Text>
          </TouchableOpacity>

          {editingEvent && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: currentTheme.error }
              ]}
              onPress={() => {
                setTitle('');
                setDate(new Date());
                setEditingEvent(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Events List Section */}
      <View style={styles.eventsListContainer}>
        <Text style={[styles.sectionHeader, { color: currentTheme.text }]}>Upcoming Events</Text>
        <EventsList refreshTrigger={refreshTrigger} onEditEvent={handleEditEvent} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { 
        backgroundColor: currentTheme.tabBar,
        borderBottomColor: currentTheme.tabBarBorder
      }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[
            styles.tabText, 
            { color: currentTheme.textSecondary },
            activeTab === 'events' && { color: currentTheme.primary }
          ]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[
            styles.tabText, 
            { color: currentTheme.textSecondary },
            activeTab === 'notifications' && { color: currentTheme.primary }
          ]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      {activeTab === 'events' ? renderEventsTab() : <NotificationFeed />}

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
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 60,
    borderBottomWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
  },
  eventsContainer: {
    flex: 1,
  },
  formSection: {
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
  cancelButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
