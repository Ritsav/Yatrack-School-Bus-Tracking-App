// Basic Imports
import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase.config';

// AsyncStorage use to retain user data to show in their profile tab 
// -- Refer to (./Login.js) & (../App.js) for more info in detail about the use of AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null); // UserData state to check if userdata is retrieved yet or not 
  const [loading, setLoading] = useState(true); // Loading for buffer in case of userdata not retrieved
  
  // Hook to fetch the user's data.
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid)); // Use firebase's getDoc method to get user's data from 'users' collection
        if (userDoc.exists()) {
          setUserData(userDoc.data()); // Set user data once retrived
        } else {
          console.error('User data not found!');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Function to handle signout called if signout btn is pressed
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('userToken'); // Clear any session tokens or user data
      await AsyncStorage.removeItem('userRole'); // Clear any user role data
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'There was an error signing out. Please try again.');
    }
  };

  // For loading buffer
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userIconContainer}>
        <View style={styles.userIcon}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Name:</Text>
        <Text style={styles.infoText}>{userData?.firstName} {userData?.lastName}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Route:</Text>
        <Text style={styles.infoText}>{userData?.route}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Contact Info:</Text>
        <Text style={styles.infoText}>{userData?.number}</Text>
      </View>
      <TouchableOpacity style={styles.signOutBox} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the above code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC700',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userIconContainer: {
    marginBottom: 35,
  },
  userIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFC700',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 3,
  },
  infoBox: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'demi-bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    fontFamily: 'sans-regular',
  },
  signOutBox: {
    width: '100%',
    maxWidth: 400,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'demi-bold',
  },
});
