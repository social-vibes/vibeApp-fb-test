import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, setDoc, arrayUnion, updateDoc, onSnapshot } from "firebase/firestore";
import { GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons'; // install react-native-vector-icons for send icon

/* quick ref
  https://cloud.google.com/firestore/docs/manage-data/add-data 
  https://github.com/FaridSafi/react-native-gifted-chat/blob/master/README.md
*/

export default function ChatScreen({navigation, route}) {
  const { userId, friendshipDoc } = route.params; //passed the current user's ID and the friend's Doc through route params from FriendScreen 
  const chatId = friendshipDoc.data.chatId; //chat ID for 1-1 DM chats
  const userName = userId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requesteeName : friendshipDoc.data.requestorName; //name of the current user
  const friendName = userId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requestorName : friendshipDoc.data.requesteeName; //name of the friend
  const [messages, setMessages] = useState([]);
  const chatRef = doc(db, 'chats', chatId); //reference to chats doc  

  useEffect(() => {
    // Load initial messages from Firebase
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const chatData = snapshot.data();
      if (chatData) {
        setMessages(chatData.messages || []);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [chatId]);


//-- Whenever the user sends a message, create the corresponding chat document, using the chatId from their friendships document;
const createChatDoc = async () => {
      const chatDoc = await getDoc(chatRef); //-- Check if the chat document exists
      if (!chatDoc.exists()) {  //-- Create the chat document if it does not exist
        try {
          console.log('Creating new chats document...')
          await setDoc(chatRef, {
            chatId: friendshipDoc.data.chatId,
            users: friendshipDoc.data.members,
            messages: messages,
          });
        } catch (error) {
          console.error('Error creating chat document:', error);
        }
      }
};


  const onSend = useCallback(
    async newMessages => {
      //-- Update local messages array state
      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));  
      
      //-- Create chat document if it doesn't exist
      await createChatDoc();
      
      //-- Update messages in Firebase
      const messagesPayload = newMessages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      }));
      const chatDocRef = doc(db, 'chats', chatId);
      console.log('updating chats document...')
      await updateDoc(chatDocRef, {
        messages: arrayUnion(...messagesPayload),
      });
    },
    [chatId]
  );
  

  //send Button
  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Icon name="send" size={24} color="#007AFF" />
      </View>
    </Send>
  )


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.friendName}>{friendName}</Text>
      </View>
      <GiftedChat
        messages={messages.reverse()} //reversing the array so that they appear in reverse chronological order
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
            _id: userId,
            name: userName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=100&rounded=true&bold=true`,
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