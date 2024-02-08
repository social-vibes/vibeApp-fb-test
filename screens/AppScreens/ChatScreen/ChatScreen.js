import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView } from 'react-native';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, query, where, collection } from "firebase/firestore";

/* It is only possible to get on this page if both users are friends; TODO:
  - Create the chat document; and ensure that a unique chat document exists between the 2 users.
  - Create chat collection; 
*/

export default function ChatScreen({route}) {
  const { userId, friendshipDoc } = route.params; //passed the current user's ID and the friend's Doc through route params from FriendScreen 
  const friendName = userId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requestorName : friendshipDoc.data.requesteeName; //name of the friend

  return (
    <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 20 }}>{friendName}</Text>
          </View>
    </SafeAreaView>
  );
}

