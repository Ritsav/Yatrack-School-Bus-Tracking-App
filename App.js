// Define Entry-Point for our Application
import { registerRootComponent } from 'expo';

// Basic Imports
import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// AsyncStorage import for retaining saved user sessions
import AsyncStorage from '@react-native-async-storage/async-storage';

// Our File Imports
import Login from './screens/Login';
import DriverDashboard from './screens/DriverDashboard';
import Dashboard from './screens/Dashboard';
import CallUsers from './screens/CallUsers';

const Stack = createStackNavigator();

// Loading Screen to add a loading buffer until session has been established.
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFC700' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

export default function App(){
  const [initialRoute, setInitialRoute] = useState(null); // For setting route of users & drivers
  const [loading, setLoading] = useState(true); // Loading state initialization as true

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userRole = await AsyncStorage.getItem('userRole'); // Fetch stored user role ("Driver" OR "User")

        // In case of both userToken & userRole already been stored, setInitialRoute from Async Storage otherwise, 
        // direct the user to the Login screen for credentials.
        if (userToken && userRole) {
          setInitialRoute(userRole === 'driver' ? 'DriverDashboard' : 'UserDashboard'); // AsyncStorage Hit
        } else {
          setInitialRoute('Login'); // AsyncStorage Miss
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setInitialRoute('Login');
      } finally {
        setLoading(false); // Loading buffer toggle to false once session has been determined.
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FFC700" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} /> 
          <Stack.Screen name="DriverDashboard" component={DriverDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="CallUsers" component={CallUsers} options={{ headerShown: false }} />
          <Stack.Screen name="UserDashboard" component={Dashboard} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// EntryPoint to our Application from function App()
registerRootComponent(App);