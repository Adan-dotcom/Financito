// src/screens/main/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const parsedUser = JSON.parse(userData);
      setBalance(parsedUser.balance || 0);
      
      // Simulación de progreso hacia recompensa (ejemplo: recompensa a los 5000)
      setProgress(Math.min((parsedUser.balance || 0) / 5000, 1));
      
      // Cargar transacciones
      const txData = await AsyncStorage.getItem('transactions');
      const parsedTx = JSON.parse(txData) || [];
      setTransactions(parsedTx.filter(tx => tx.userId === parsedUser.id));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData().then(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance Actual</Text>
        <Text style={styles.balanceAmount}>
          ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.rewardContainer}>
        <Text style={styles.rewardLabel}>Progreso hacia recompensa</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.rewardText}>
          ${((1 - progress) * 5000).toFixed(2)} para tu próxima recompensa
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.depositButton]}
          onPress={() => navigation.navigate('Deposit')}
        >
          <Text style={styles.buttonText}>Depositar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.withdrawButton]}
          onPress={() => navigation.navigate('Withdraw')}
        >
          <Text style={styles.buttonText}>Retirar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Historial de Movimientos</Text>
        {transactions.map((tx, index) => (
          <View key={index} style={styles.transaction}>
            <Text style={styles.transactionType}>
              {tx.type === 'deposit' ? '↑ Depósito' : '↓ Retiro'}
            </Text>
            <Text style={styles.transactionAmount}>
              ${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(tx.date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  balanceContainer: {
    padding: 20,
    backgroundColor: '#001F3F',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  rewardContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  rewardLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#001F3F',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#001F3F',
  },
  rewardText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  depositButton: {
    backgroundColor: '#001F3F',
  },
  withdrawButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  transactionsContainer: {
    padding: 20,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#001F3F',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  transactionType: {
    flex: 1,
    color: '#212529',
  },
  transactionAmount: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#212529',
  },
  transactionDate: {
    flex: 1,
    textAlign: 'right',
    color: '#666',
  },
});

export default HomeScreen;