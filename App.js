// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';

// Main Screens
import HomeScreen from './src/screens/main/HomeScreen';
import VotingScreen from './src/screens/main/VotingScreen';
import NotificationsScreen from './src/screens/main/NotificationsScreen';
import DepositScreen from './src/screens/main/DepositScreen';
import WithdrawScreen from './src/screens/main/WithdrawScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Colors
const COLORS = {
  primary: '#001F3F',
  secondary: '#F8F9FA',
  accent: '#4A90E2',
  grey: '#E9ECEF',
  white: '#FFFFFF',
  text: '#212529',
};

// Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.grey,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#666',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="home" size={26} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Votaciones"
      component={VotingScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="vote" size={26} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Avisos"
      component={NotificationsScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="bell" size={26} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: 'Registro' }}
        />
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Deposit"
          component={DepositScreen}
          options={{ title: 'Depositar' }}
        />
        <Stack.Screen
          name="Withdraw"
          component={WithdrawScreen}
          options={{ title: 'Retirar' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;