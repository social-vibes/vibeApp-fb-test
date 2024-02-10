import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView,StyleSheet } from 'react-native';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, query, where, collection, setDoc, addDoc} from "firebase/firestore";
import { GiftedChat, Send} from 'react-native-gifted-chat'; 
import Icon from 'react-native-vector-icons/MaterialIcons'; // install react-native-vector-icons for send icpn

/* It is only possible to get on this page if both users are friends; TODO:
  - Create the chat document; and ensure that a unique chat document exists between the 2 users.
  - Create chat collection; 
*/

export default function ChatScreen({route}) {
  const { userId, friendshipDoc } = route.params; //passed the current user's ID and the friend's Doc through route params from FriendScreen 
  const friendName = userId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requestorName : friendshipDoc.data.requesteeName; //name of the friend

  const [messages, setMessages] = useState([]);

  // This is just a logic for the initial frontend setup
  const onSend = (newMessages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  
  //send Button and logic
  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Icon name="send" size={24} color="#007AFF" />
      </View>
    </Send>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.friendName}>{friendName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: userId,
        }}
        renderSend={renderSend}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    header: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    friendName: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    sendButton: {
      marginRight: 10,
      marginBottom: 5,
    },
  });


