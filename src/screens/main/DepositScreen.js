// src/screens/main/DepositScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DepositScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [showBarcode, setShowBarcode] = useState(false);
  const [reference, setReference] = useState('');

  const generateReference = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const handleDeposit = async () => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Por favor ingresa una cantidad válida');
        return;
      }

      // Obtener usuario actual
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);

      // Actualizar balance
      const newBalance = (user.balance || 0) + parsedAmount;
      user.balance = newBalance;

      // Guardar usuario actualizado
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      // Guardar la transacción
      const transactions = JSON.parse(await AsyncStorage.getItem('transactions') || '[]');
      transactions.push({
        userId: user.id,
        type: 'deposit',
        amount: parsedAmount,
        date: new Date().toISOString(),
        reference: reference || generateReference()
      });
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));

      Alert.alert(
        'Éxito',
        'Depósito realizado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el depósito');
    }
  };

  const handleOxxoDeposit = () => {
    const newReference = generateReference();
    setReference(newReference);
    setShowBarcode(true);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Cantidad a depositar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Elige un método de depósito:</Text>

        <View style={styles.cardSection}>
          <TextInput
            style={styles.input}
            placeholder="Número de tarjeta"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={16}
          />
          <TouchableOpacity
            style={[styles.button, styles.cardButton]}
            onPress={handleDeposit}
          >
            <Text style={styles.buttonText}>Depositar con Tarjeta</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.oxxoButton]}
          onPress={handleOxxoDeposit}
        >
          <Text style={styles.buttonText}>Generar Código para OXXO</Text>
        </TouchableOpacity>

        {showBarcode && (
          <View style={styles.barcodeContainer}>
            <Image
              source={{ uri: '/api/placeholder/300/100' }}
              style={styles.barcode}
            />
            <Text style={styles.referenceText}>
              Referencia: {reference}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#001F3F',
  },
  cardSection: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  cardButton: {
    backgroundColor: '#001F3F',
  },
  oxxoButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  barcodeContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  barcode: {
    width: 300,
    height: 100,
    marginBottom: 10,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
  },
});

export default DepositScreen;