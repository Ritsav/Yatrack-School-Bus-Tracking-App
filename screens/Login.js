// Basic Imports
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';

// Firebase Imports
import { auth, signInWithEmailAndPassword, firestore, doc, getDoc } from '../firebase.config';

// Used Icons & Font Imports
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// AsyncStorage import to save user session from login
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle between show and hide password field
  const [fontsLoaded, setFontsLoaded] = useState(false); // FontLoaded State to check and wait for fonts to be loaded properly

  // Load Application Fonts
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'sans-bold': require('../assets/fonts/MiSansLatin-Bold.ttf'),
        'sans-mdm': require('../assets/fonts/MiSansLatin-Medium.ttf'),
        'sans-light': require('../assets/fonts/MiSansLatin-Light.ttf'),
      });
      setFontsLoaded(true); // Toggle fontsLoaded to true to continue
    }
    loadFonts();
  }, []);

  // Check User session
  // Similar Application to that in App.js --- Refer to line 34(./App.js) for clarity if needed
  useEffect(() => {
    async function checkUserSession() {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userRole = await AsyncStorage.getItem('userRole'); // Fetch stored user role

        if (userToken && userRole) {
          navigation.navigate(userRole === 'driver' ? 'DriverDashboard' : 'UserDashboard');
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    }
    checkUserSession();
  }, [navigation]);


  // Login Handler Function using firebase auth methods 
  // called when Login btn is pressed

  const handleLogin = async () => {
    // For case when user submits without any email and password
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Call firebase's signInWithEmailAndPassword method for auth
      const user = userCredential.user;

      // Store user token in AsyncStorage
      await AsyncStorage.setItem('userToken', user.accessToken);

      // # Refer to our database's documentation for understanding the database structure.
      // Check if user belongs to the drivers collection
      const driverDoc = await getDoc(doc(firestore, 'drivers', user.uid)); // Fetching from the 'drivers' collection with the user's uid using firebase's getDoc method

      // If driverDoc is found successfully,
      // set Role as 'driver' & direct to the driver's dashboard otherwise,
      // set Role as 'user' direct to the user's dashboard
      if (driverDoc.exists()) {
        await AsyncStorage.setItem('userRole', 'driver');
        navigation.navigate('DriverDashboard');
      } else {
        await AsyncStorage.setItem('userRole', 'user');
        navigation.navigate('UserDashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    }
  };

  // Check if fonts are loaded
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.header}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
        </View>

        <View style={styles.loginBox}>
          <Text style={styles.title}>Sign In</Text>
          <TextInput 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input} 
            keyboardType="email-address" 
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput 
              placeholder="Password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
              style={styles.inputWithIcon} 
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={1}
            >
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Keeping you tuned to your child's journey.
          </Text>

          <Image source={require('../assets/busLogin.png')} style={styles.busLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles as used in our Login Screen accessed in the code above.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC700',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFC700',
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'sans-bold',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  loginBox: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F6F7FB',
    marginBottom: 16,
    fontFamily: 'sans-mdm',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIcon: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F6F7FB',
    fontFamily: 'sans-mdm',
    borderWidth: 1,
    borderColor: '#DDD',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  loginButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFC700',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'sans-bold',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 10,
    fontFamily: 'sans-mdm',
  },
  busLogin: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 20,
  },
});
