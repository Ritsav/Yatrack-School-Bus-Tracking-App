// Basic Imports
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Animated, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { auth, firestore, database } from '../../firebase.config';


const { height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {

  // Refer to the Realtime Database's documentation to know about the states below and how they are being used and updated
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false); // Bus status (Active if driver toggles to start tracking and inactive if driver togglse to stop tracking)
  const [loadingEffect, setLoadingEffect] = useState(0); // Bus Status Effect
  const [tip, setTip] = useState(''); // Daily tip of the day
  const [scaleValue] = useState(new Animated.Value(1)); // Animation for Bus Effect
  const [driverInfo, setDriverInfo] = useState(null);

  // This hook does a lot of things and each DB operation is separated for readability.
  useEffect(() => {
    // Async function to fetch user data
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.firstName);
          return userData.route;
        } else {
          console.error('User data not found!');
        }
      }
      setLoading(false);
      return null;
    };

    // Async function to fetch Driver's or Bus's status (Toggle Stack/Stop Tracking)
    const fetchDriverStatus = async (route) => {
      if (route) {
        const routeRef = ref(database, `routes/${route}/status`);
        onValue(routeRef, (snapshot) => {
          const statusData = snapshot.val();
          setIsActive(statusData.isActive);
        });
      }
    };

    // Async Function to Fetch Daily Tips/Reminders
    const fetchTips = async (route) => {
      if (route) {
        const tipsRef = ref(database, `routes/${route}/tip`);
        onValue(tipsRef, (snapshot) => {
          const tipsData = snapshot.val();
          setTip(tipsData);
        });
      }
    };

    // Async Function to Fetch Driver's Information
    const fetchDriverInfo = async (route) => {
      if (route) {
        const driverQuery = query(collection(firestore, "drivers"), where("route", "==", route));
        const driverSnapshot = await getDocs(driverQuery);
        if (!driverSnapshot.empty) {
          driverSnapshot.forEach((doc) => {
            setDriverInfo(doc.data());
          });
        } else {
          console.error('Driver data not found!');
        }
      }
    };

    // Async Function to fetch and setup the route info of the user
    const fetchUserAndDriverData = async () => {
      const route = await fetchUserData();
      if (route) {
        await fetchDriverStatus(route);
        await fetchTips(route);
        await fetchDriverInfo(route);
      }
      setLoading(false);
    };

    fetchUserAndDriverData();
  }, []);

  
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingEffect((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(loadingInterval);
  }, []);

  // Bus Effect Animation when Bus is Active
  const getLoadingText = () => {
    const dots = '.'.repeat(loadingEffect + 1);
    return `Bus is Active${dots}`;
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => navigation.navigate('Bus'));
  };

  // Function to direct to Phone app with the driver's number
  const callDriver = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  // Loading buffer
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchableContainer}
      > 
        <Animated.View
          style={[styles.box, { transform: [{ scale: scaleValue }] }]}
        >
          {isActive ? (
            <>
              <Image source={require('../../assets/animatedBus.gif')} style={styles.animatedBusImage} />
              <Text style={styles.activeText}>{getLoadingText()}</Text>
              <Text style={styles.message}>
                {userName} is on their way to make dreams come true 😊✨🚀
              </Text>
            </>
          ) : (
            <>
              <Image source={require('../../assets/busLogin.png')} style={styles.busImage} />
              <Text style={styles.inactiveMessage}>
                The bus is currently inactive.
              </Text>
              <Text style={styles.inactiveMessage2}>
                Please check back later.
              </Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {driverInfo && (
        <View style={styles.driverInfoBox}>
          <View style={styles.driverIconContainer}>
            <Image source={require('../../assets/driverIcon.png')} style={styles.driverIcon} />
          </View>
          <Text style={styles.driverInfoText}>
            {driverInfo.firstName} {driverInfo.lastName}
          </Text>
          <Text style={styles.driverInfoSubText}>
            {driverInfo.busNo}
          </Text>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => callDriver(driverInfo.number)}
          >
            <Ionicons name="call" size={24} color="white" />
            <Text style={styles.callButtonText}>Call Driver</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          Tip: {tip}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  box: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
  },
  busImage: {
    width: '100%',
    height: height * 0.15,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  animatedBusImage: {
    width: '100%',
    height: height * 0.18,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  message: {
    fontSize: 15,
    fontFamily: 'semi-bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  activeText: {
    fontSize: 28,
    color: 'green',
    textAlign: 'center',
    fontFamily: 'sans-bold',
    marginBottom: 25,
  },
  inactiveMessage: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'semi-bold',
  },
  inactiveMessage2: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'demi-bold',
  },
  driverInfoBox: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  driverIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverIcon: {
    width: 50,
    height: 58,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  driverInfoText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'demi-bold',
    marginBottom: 10,
  },
  driverInfoSubText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'sans-mdm',
    marginBottom: 20,
    textAlign: 'center',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  callButtonText: {
    color: 'white',
    marginLeft: 10,
    fontFamily: 'sans-mdm',
  },
  tipBox: {
    width: '80%',
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
    marginTop: 20,
  },
  tipText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'demi-bold',
  },
});