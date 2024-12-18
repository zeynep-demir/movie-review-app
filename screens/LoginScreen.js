import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const sanitizedInput = emailOrUsername.trim().toLowerCase();

    if (!sanitizedInput || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Credentials',
        text2: 'Please enter both email/username and password.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        emailOrUsername: sanitizedInput,
        password,
      });

      console.log('API Response:', response.data);

      const { token } = response.data;
      await AsyncStorage.setItem('token', token);

      // Pass a callback to navigate after login
      login(token, () => {
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome to MovieRank!',
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage.includes('Invalid credentials')
          ? 'Incorrect email/username or password.'
          : 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email or Username"
        placeholderTextColor="#aaa"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    marginBottom: 15,
    color: '#fff',
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
