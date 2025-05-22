import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

interface Event {
  id: string;
  name: string;
  dateTime: Date;
}

// Sample data
const sampleEvents: Event[] = Array.from({ length: 20 }, (_, index) => ({
  id: `event-${index + 1}`,
  name: `Event ${index + 1}`,
  dateTime: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000), // Each event is 1 day apart
}));

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteEvent(id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const showEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Event }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => showEventDetails(item)}
      >
        <View style={styles.eventContent}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text style={styles.eventDateTime}>
            {item.dateTime.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        data={events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                <Text style={styles.modalDateTime}>
                  {selectedEvent.dateTime.toLocaleString()}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventContent: {
    flexDirection: 'column',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalDateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventsList; 