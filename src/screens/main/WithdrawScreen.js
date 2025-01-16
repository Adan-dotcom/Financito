// src/screens/main/WithdrawScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WithdrawScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleWithdraw = async () => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Por favor ingresa una cantidad válida');
        return;
      }

      // Obtener usuario actual
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);

      // Verificar fondos suficientes
      if ((user.balance || 0) < parsedAmount) {
        Alert.alert('Error', 'Fondos insuficientes');
        return;
      }

      // Actualizar balance
      const newBalance = user.balance - parsedAmount;
      user.balance = newBalance;

      // Guardar usuario actualizado
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      // Guardar la transacción
      const transactions = JSON.parse(await AsyncStorage.getItem('transactions') || '[]');
      transactions.push({
        userId: user.id,
        type: 'withdraw',
        amount: -parsedAmount,
        date: new Date().toISOString(),
        accountNumber: accountNumber
      });
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));

      Alert.alert(
        'Éxito',
        'Retiro procesado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el retiro');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.balanceTitle}>Retiro de Fondos</Text>

      <TextInput
        style={styles.input}
        placeholder="Cantidad a retirar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Número de cuenta CLABE"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="numeric"
        maxLength={18}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleWithdraw}
      >
        <Text style={styles.buttonText}>Procesar Retiro</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        * Los retiros se procesarán en las próximas 24-48 horas hábiles
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  balanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#001F3F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#001F3F',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WithdrawScreen;