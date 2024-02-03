import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import HomeScreen  from './HomeScreen/HomeScreen';
import MessagesScreen from './ChatsScreen/MessagesScreen';
import NotificationScreen from './NotificationsScreen/NotificationScreen';





const Tab = createBottomTabNavigator();

export default function TabNav() {
  return (
      <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  if (route.name === 'Home') {
                    iconName = focused
                      ? 'map'
                      : 'map-o';
                  } else if (route.name === 'Chat') {
                    iconName = focused ? 'wechat' : 'wechat';
                  } else if (route.name === 'Notifications'){
                    iconName = focused ? 'bell' : 'bell-o';
                  }
                  return <FontAwesome name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
              })}
            >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Chat" component={MessagesScreen} />
        <Tab.Screen name="Notifications" component={NotificationScreen} />
      </Tab.Navigator>
  );
}