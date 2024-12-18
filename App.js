import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, AuthContext } from './AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast

import HomeScreen from './screens/HomeScreen';
import MovieDetailsScreen from './screens/MovieDetailsScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import ReviewScreen from './screens/ReviewScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import GuestHomeScreen from './screens/GuestHomeScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
const isMobile = width <= 768;

// Inject web-specific global styles
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    body, html {
      margin: 0;
      padding: 0;
      -webkit-overflow-scrolling: touch;
      overflow-y: auto;
      height: 100%;
    }
    #root {
      height: 100%;
      overflow: auto;
    }
  `;
  document.head.appendChild(style);
}

function AppNavigator() {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          login(token);
        }
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, [login]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, overflow: Platform.OS === 'web' ? 'auto' : 'hidden' }}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#FFFFFF',
          headerTitleAlign: 'center',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="GuestHome"
            component={GuestHomeScreen}
            options={({ navigation }) => ({
              headerLeft: () => (
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTitle}>MovieRank</Text>
                </View>
              ),
              headerRight: () => (
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    style={[styles.authButton, isMobile && styles.mobileButton]}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.buttonText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.authButton, isMobile && styles.mobileButton]}
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.buttonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              ),
              headerTitle: '',
            })}
          />
        ) : (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerLeft: () => (
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTitle}>MovieRank</Text>
                </View>
              ),
              headerRight: () => (
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    style={[styles.authButton, isMobile && styles.mobileButton]}
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Text style={styles.buttonText}>Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.authButton, styles.logoutButton]}
                    onPress={async () => {
                      await AsyncStorage.removeItem('token');
                      logout();
                      Toast.show({
                        type: 'success',
                        text1: 'Logged Out',
                        text2: 'You have been successfully logged out.',
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              ),
              headerTitle: '',
            })}
          />
        )}

        {/* Other Screens */}
        <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ title: 'Movie Details' }} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Add Review' }} />
        <Stack.Screen name="Reviews" component={ReviewScreen} options={{ title: 'Reviews' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
    fontFamily: 'Roboto',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isMobile ? 5 : 15,
  },
  authButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: isMobile ? 5 : 8,
    paddingHorizontal: isMobile ? 10 : 14,
    borderRadius: 16,
    marginLeft: isMobile ? 5 : 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: isMobile ? 12 : 14,
    textTransform: 'capitalize',
  },
  mobileButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
