// Basic Imports
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// Firebase Imports
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../firebase.config';

export default function CallUsers({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false); // State to check if fonts are loaded or not
  const [users, setUsers] = useState([]); // State to give the list of users corresponding to that route
  const [driverRoute, setDriverRoute] = useState(''); // State to set driver's route.

  useEffect(() => {
    // Fetch Driver's Info
    const fetchDriverData = async () => {
      const user = auth.currentUser;
      if (user) {
        const driverDoc = await getDoc(doc(firestore, 'drivers', user.uid));
        if (driverDoc.exists()) {
          const driverData = driverDoc.data();
          setDriverRoute(driverData.route);
        } else {
          console.error('Driver data not found!');
        }
      }
    };

    fetchDriverData();
  }, []);

  // Fetch user's list
  useEffect(() => {
    const fetchUsers = async () => {
      if (driverRoute) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('route', '==', driverRoute));
        const querySnapshot = await getDocs(q);

        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });

        setUsers(usersList);
      }
    };

    fetchUsers();
  }, [driverRoute]);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'sans-bold': require('../assets/fonts/MiSansLatin-Bold.ttf'),
        'sans-mdm': require('../assets/fonts/MiSansLatin-Medium.ttf'),
        'sans-light': require('../assets/fonts/MiSansLatin-Light.ttf'),
        'demi-bold': require('../assets/fonts/MiSansLatin-Demibold.ttf'),
        'semi-bold': require('../assets/fonts/MiSansLatin-Semibold.ttf'),
        'sans-regular': require('../assets/fonts/MiSansLatin-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);
  
  if (!fontsLoaded) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Direct to make a phone call to the parent after clicking the phone icon associated with user's name
  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.userName}>{`${item.firstName} ${item.lastName}`}</Text>
      <TouchableOpacity style={styles.callButton} onPress={() => makeCall(item.number)}>
        <Ionicons name="call" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Call Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

// Styling for loading buffer
const loadingStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFC700',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'sans-bold',
  },
}

// Styling for screen elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC700',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white',
    fontFamily: 'sans-mdm',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'sans-mdm',
    color: '#fff',
  },
  list: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  userName: {
    fontSize: 19,
    color: '#333',
    fontFamily: 'semi-bold',
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});