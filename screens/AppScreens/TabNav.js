import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from '../../providers/authProvider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { onSnapshot, query, collection, where, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import FriendsScreen from './FriendsScreen/FriendsScreen';
import ChatScreen from './ChatScreen/ChatScreen';
import HomeScreen from './HomeScreen/HomeScreen';
import NotificationScreen from './NotificationsScreen/NotificationScreen';

//pass props in bottom nav https://stackoverflow.com/questions/60439210/how-to-pass-props-to-screen-component-with-a-tab-navigator 


const Tab = createBottomTabNavigator();

export default function TabNav() {
  const { userInfo } = useAuth();
  const [friendshipNotifications, setFriendshipNotifications] = useState([]); //-- Holds notifications
  // const [chatNotifications, setChatNotifications] = useState([]);

  useEffect(() => {
    //-- Listen for updates in friendships collection
    const unsubscribe = onSnapshot(                     
      query(
        collection(db, 'friendships'), 
        where('requesteeId', '==', `${userInfo.uid}`)), //-- where the current user is the requestee
        where('status', '==', 'PENDING'),               //-- and the status is pending
      (snapshot) => {
        const newNotifications = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newNotifications.push({ id: doc.id, data });
        });
        setFriendshipNotifications(newNotifications);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'map' : 'map-o';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'user' : 'user';
          }else if (route.name === 'Chats'){
            iconName = focused ? 'comments' : 'comments-o';
          }else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell-o';
          } 
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Chats" component={ChatScreen} />
      <Tab.Screen name="Notifications" 
        children={() => <NotificationScreen friendshipNotifications={friendshipNotifications} setFriendshipNotifications={setFriendshipNotifications} />}
        options={{ tabBarBadge: friendshipNotifications.length > 0 ? friendshipNotifications.length : null }}
      />
    </Tab.Navigator>
  );
};

