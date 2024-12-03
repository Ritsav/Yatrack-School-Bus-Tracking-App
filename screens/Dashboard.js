// Basic imports
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font'
import { View, Text } from 'react-native';

// File Imports
import ProfileScreen from './DashboardScreens/Profile';
import HomeScreen from './DashboardScreens/HomeScreen';
import BusScreen from './DashboardScreens/BusScreen';


const Tab = createBottomTabNavigator();

export default function Dashboard() {
  const [fontsLoaded, setFontsLoaded] = useState(false); // FontLoaded State to check and wait for fonts to be loaded properly

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

  // Check if fonts are loaded
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Bus') {
            iconName = 'bus';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#606060',
        tabBarStyle: {
          backgroundColor: '#fff', // Set background color of the tab bar
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, // Hide header for HomeScreen
        }}
      />
      <Tab.Screen name="Bus" component={BusScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = {
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