import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, View} from 'react-native';

import {useAuthStore} from '@store/authStore';
import {LoginScreen} from '@screens/Auth/LoginScreen';
import {RegisterScreen} from '@screens/Auth/RegisterScreen';
import {HomeScreen} from '@screens/Home/HomeScreen';
import {MatchDetailScreen} from '@screens/Match/MatchDetailScreen';
import {ProfileScreen} from '@screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
    }}>
    <Tab.Screen
      name="Partidos"
      component={HomeScreen}
      options={{
        tabBarIcon: ({color}) => <View style={{width: 24, height: 24}} />,
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({color}) => <View style={{width: 24, height: 24}} />,
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeTabs}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MatchDetail"
      component={MatchDetailScreen}
      options={{
        title: 'Detalle del Partido',
        headerBackTitle: 'Volver',
      }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const {isAuthenticated, loadUser} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
