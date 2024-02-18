import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, setDoc, arrayUnion, updateDoc, onSnapshot } from "firebase/firestore";
import { GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function GroupChatScreen({ route }) {
  const { chatId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const chatRef = doc(db, 'chats', chatId); //reference to chats doc

  useEffect(() => {
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
        const chatData = snapshot.data();
        if (chatData && chatData.messages) {
            const formattedMessages = chatData.messages.map(msg => ({
                ...msg,
                createdAt: new Date(msg.createdAt) // Convert ISO string back to Date object
            }));
            setMessages(formattedMessages);
        }
    });

    return () => {
        unsubscribe();
      };
}, [chatId]);

useEffect(() => {
    const fetchUserName = async () => {
      const userRef = doc(db, 'users', route.params.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setCurrentUserName(userSnap.data().name); // Set the current user's name
      }
    };
  
    fetchUserName();
  }, [route.params.userId]);

  
  const onSend = useCallback(async (newMessages = []) => {
    const messagesPayload = newMessages.map(msg => ({
        ...msg,
        createdAt: new Date().toISOString(), 
    }));
    // Get the current state of the chat document
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists() || !chatDoc.data().messages) {
        // If the chat document doesn't exist or doesn't have a 'messages' field, create it with the new messages
        await setDoc(chatRef, {
            messages: messagesPayload,
        }, { merge: true }); // Use merge option to avoid overwriting the entire document
    } else {
        // If the chat document exists and already has messages, append the new messages
        await updateDoc(chatRef, {
            messages: arrayUnion(...messagesPayload),
        });
    }
}, [chatId, currentUserName]);


  // Render the send button 
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
        <Text style={styles.groupName}>{groupName}</Text>
      </View>
      <GiftedChat
       messages={[...messages].reverse()} // messages.reverse() converts the original messages
        onSend={messages => onSend(messages)}
        user={{
            _id: route.params.userId, // Sender's user ID
            name: currentUserName,// Sender's name
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random&rounded=true`
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
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sendButton: {
    marginRight: 10,
    marginBottom: 5,
  },
});
