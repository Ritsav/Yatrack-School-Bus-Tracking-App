// Basic Imports
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert, AppState } from 'react-native';
import * as Font from 'expo-font';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore, database } from '../firebase.config';
import { ref, set, update } from 'firebase/database';

// AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverDashboard() {
  const [route, setRoute] = useState('');
  const [intervalId, setIntervalId] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('Inactive');

  const navigation = useNavigation(); // Allows for navigation

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'sans-bold': require('../assets/fonts/MiSansLatin-Bold.ttf'),
        'sans-mdm': require('../assets/fonts/MiSansLatin-Medium.ttf'),
        'sans-light': require('../assets/fonts/MiSansLatin-Light.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Fetch Driver's Route
  useEffect(() => {
    const fetchDriverRoute = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const driverDoc = await getDoc(doc(firestore, "drivers", user.uid));
          if (driverDoc.exists()) {
            const driverData = driverDoc.data();
            setRoute(driverData.route);

            // Save route and pickPoint to AsyncStorage
            await AsyncStorage.setItem('route', driverData.route);
          } else {
            console.error('Driver data not found!');
          }
        }
      } catch (error) {
        console.error('Error fetching driver route:', error);
      }
    };

    // Async Function to fetch Driver's route from AsyncStorage
    const loadDriverRouteFromStorage = async () => {
      try {
        const storedRoute = await AsyncStorage.getItem('route');

        if (storedRoute) {
          setRoute(storedRoute);
        } else {
          fetchDriverRoute();
        }
      } catch (error) {
        console.error('Error loading driver route from storage:', error);
      }
    };

    loadDriverRouteFromStorage();
  }, []);

  // Request Location Permission from Driver
  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
      } else {
        setPermissionGranted(true);
      }
    };

    requestLocationPermission();
  }, []);

  // Stop sharing location if app goes to background
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      try {
        if (nextAppState.match(/inactive|background/)) {
          if (intervalId) {
            await stopSendingLocation();
          }
        }
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [intervalId]);

  // Function to start sending location
  const startSendingLocation = async () => {
    if (!permissionGranted) {
      Alert.alert('Location permission is required to start sending location.');
      return;
    }

    if (route) {
      // Set the active status in RDB
      const user = auth.currentUser;
      const routeRef = ref(database, `routes/${route}/status`);
      await update(routeRef, {
        isActive: true,
      });

      // Set the start time in Firestore
      await setDoc(doc(firestore, 'drivers', user.uid), {
        startTime: serverTimestamp(), // Tracking start time saved in DB
      }, { merge: true });

      const id = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const locationRef = ref(database, `routes/${route}/location`);
        set(locationRef, { latitude, longitude });
        console.log(`Current location: ${latitude}, ${longitude}`);
      }, 1000);

      setIntervalId(id);
      setTrackingStatus('Active');
    } else {
      Alert.alert('Route not found!');
    }
  };

  // Function to stop sending location
  const stopSendingLocation = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setTrackingStatus('Inactive');
    }

    // Set the inactive status in RDB
    const user = auth.currentUser;
    const routeRef = ref(database, `routes/${route}/status`);
    await update(routeRef, {
      isActive: false,
    });

    // Set the stop time in Firestore
    await updateDoc(doc(firestore, 'drivers', user.uid), {
      stopTime: serverTimestamp(),
    });
  };

  // Function to toggle tracking called when the Start/Stop tracking btn is toggled
  const toggleTracking = () => {
    if (intervalId) {
      stopSendingLocation();
    } else {
      startSendingLocation();
    }
  };

  // Async Function to Handle Logout
  const handleLogout = async () => {
    await AsyncStorage.clear();
    auth.signOut().then(() => {
      navigation.navigate("Login");
      
    }).catch((error) => {
      Alert.alert('Error logging out:', error.message);
    });
  };

  // Font Load Status
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Minimalist Driver's End for no distraction and less battery usage
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutIcon}
        onPress={handleLogout}
      >
        <Image source={require('../assets/logout-icon.png')} style={styles.logoutImage} />
      </TouchableOpacity>
      <Text style={styles.statusText}>Tracking Status: {trackingStatus}</Text>
      <TouchableOpacity
        style={[styles.button, intervalId ? styles.buttonStop : styles.buttonStart]}
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>
          {intervalId ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.callUserButton}
        onPress={() => navigation.navigate('CallUsers')}
      >
        <Text style={styles.buttonText}>Call User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC700', // Updated background color
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    margin: 10,
  },
  buttonStart: {
    backgroundColor: '#4CAF50', // Green
  },
  buttonStop: {
    backgroundColor: '#f44336', // Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily:"sans-bold"
  },
  statusText: {
    fontSize: 18,
   fontFamily:"sans-bold",
    marginBottom: 20,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#2196F3', // Blue
  },
  callUserButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
    backgroundColor: '#00BFFF', // Light Blue
  },
  logoutIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  logoutImage: {
    width: 30,
    height: 30,
  },
});
