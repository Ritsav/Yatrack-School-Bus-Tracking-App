// Basic Imports
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';

// Map Import 
import MapView, { Marker, AnimatedRegion, PROVIDER_DEFAULT } from 'react-native-maps';

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { auth, firestore, database } from '../../firebase.config';

export default function BusScreen() {
  const [route, setRoute] = useState(''); // Route of the user
  const [initialPosition, setInitialPosition] = useState(null); // Initial Position in the map
  const [coordinate, setCoordinate] = useState(new AnimatedRegion({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })); // Animations to make the movement of bus in the map smoother
  const markerRef = useRef(null); // Bus marker
  const mapRef = useRef(null);

  // Fetching the user's route
  useEffect(() => {
    const fetchUserRoute = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRoute(userData.route);
        } else {
          console.error('User data not found!');
        }
      }
    };

    fetchUserRoute();
  }, []);

  // # Refer to the RDB documentation for more details on the database architecture
  useEffect(() => {
    if (route) {
      // Accessing the realtime database through route info
      const routeRef = ref(database, `routes/${route}/location`);
      
      const unsubscribe = onValue(routeRef, (snapshot) => {
        const location = snapshot.val();
        if (location) {
          const { latitude, longitude } = location;
          const newCoordinate = { latitude, longitude };

          // Update AnimatedRegion with new coordinate
          coordinate.timing({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }).start();

          if (!initialPosition) {
            setInitialPosition(newCoordinate);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [route]);

  // Function to center map on bus when the floating action btn with bus icon is clicked
  const centerMapOnBus = () => {
    if (mapRef.current && coordinate) {
      mapRef.current.animateToRegion({
        latitude: coordinate.latitude._value,
        longitude: coordinate.longitude._value,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  
  return (
    <View style={styles.container}>
      {initialPosition ? (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              ...initialPosition,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker.Animated
              ref={markerRef}
              coordinate={coordinate}
            >
              <Image
                source={require('../../assets/bus.png')}
                style={styles.marker}
                resizeMode="contain"
              />
            </Marker.Animated>
          </MapView>
          <TouchableOpacity style={styles.fab} onPress={centerMapOnBus}>
            <Image source={require('../../assets/findBus.png')} style={styles.findBus} />
          </TouchableOpacity>
        </>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 100,
    height:40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#0A76BE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  findBus: {
    height: 25,
    width: 25,
  },
});