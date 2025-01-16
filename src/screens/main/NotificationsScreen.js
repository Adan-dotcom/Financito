// src/screens/main/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);

      // Simular notificaciones basadas en el balance del usuario
      const newNotifications = [];

      // Notificación de recompensa
      const rewardProgress = (user.balance || 0) / 5000;
      if (rewardProgress < 1) {
        const remaining = (5000 - (user.balance || 0)).toFixed(2);
        newNotifications.push({
          id: 'reward',
          type: 'reward',
          message: `¡Estás a $${remaining} de alcanzar tu próxima recompensa!`,
          date: new Date(),
        });
      }

      // Simular fechas de pago (ejemplo: cada mes)
      const nextPayment = new Date();
      nextPayment.setDate(nextPayment.getDate() + 3);
      newNotifications.push({
        id: 'payment',
        type: 'payment',
        message: `Tu próximo pago está programado para el ${nextPayment.toLocaleDateString()}`,
        date: new Date(),
      });

      // Notificaciones de votación
      const projects = await AsyncStorage.getItem('projects');
      if (projects) {
        const parsedProjects = JSON.parse(projects);
        parsedProjects.forEach(project => {
          if (!project.notified) {
            newNotifications.push({
              id: `vote_${project.id}`,
              type: 'vote',
              message: `¡Nuevo proyecto para votar: ${project.name}!`,
              date: new Date(),
            });
          }
        });
      }

      setNotifications(newNotifications.sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadNotifications().then(() => setRefreshing(false));
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reward':
        return '🎁';
      case 'payment':
        return '📅';
      case 'vote':
        return '🗳️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reward':
        return '#28a745';
      case 'payment':
        return '#dc3545';
      case 'vote':
        return '#4A90E2';
      default:
        return '#001F3F';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No hay notificaciones nuevas</Text>
      ) : (
        notifications.map(notification => (
          <View
            key={notification.id}
            style={[
              styles.notificationCard,
              { borderLeftColor: getNotificationColor(notification.type) }
            ]}
          >
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </Text>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationDate}>
                {new Date(notification.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
    fontSize: 16,
  },
});

export default NotificationsScreen;