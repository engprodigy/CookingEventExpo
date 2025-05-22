import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme, themes } from './ThemeContext';

interface Notification {
  id: string;
  type: 'event' | 'reminder' | 'update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'New Event Created',
    message: 'Your cooking event "Italian Pasta Night" has been created successfully!',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Your cooking event "Sushi Making Workshop" starts in 1 hour!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
  },
  {
    id: '3',
    type: 'update',
    title: 'Event Updated',
    message: 'The location for "Baking Masterclass" has been changed to Room 302',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    message: 'New features are available! Check out the latest updates.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
];

const NotificationFeed: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update unread count whenever notifications change
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return '🎉';
      case 'reminder':
        return '⏰';
      case 'update':
        return '📝';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem, 
        { backgroundColor: currentTheme.surface },
        !item.read && { backgroundColor: currentTheme.background }
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
        <Text style={[styles.notificationTitle, { color: currentTheme.text }]}>{item.title}</Text>
        <Text style={[styles.timestamp, { color: currentTheme.textSecondary }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      <Text style={[styles.notificationMessage, { color: currentTheme.textSecondary }]}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { 
        backgroundColor: currentTheme.surface,
        borderBottomColor: currentTheme.border
      }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markAllRead, { color: currentTheme.primary }]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllRead: {
    color: '#007AFF',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginLeft: 30,
  },
});

export default NotificationFeed; 