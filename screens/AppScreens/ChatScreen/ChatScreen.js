import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView } from 'react-native';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, query, where, collection } from "firebase/firestore";

export default function ChatScreen() {
  const { userInfo } = useAuth(); 
  const [friendsList, setFriendsList] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'friendships'),
        where('members', 'array-contains', userInfo.uid),
        where('status', '==', 'ACCEPTED')
      ),
      (querySnapshot) => {
        querySnapshot.docChanges().forEach(async (change) => {
          if ((change.type === 'added' || change.type === 'modified') && !change.doc.metadata.hasPendingWrites) {
            const friendshipData = change.doc.data();
            const friendId = friendshipData.requestorId === userInfo.uid ? friendshipData.requesteeId : friendshipData.requestorId;
            const friendDoc = await getDoc(doc(db, 'users', friendId));

            if (friendDoc.exists()) {
              setFriendsList((prevFriendsList) => [...prevFriendsList, friendDoc.data().name]);
            }
          }
        });
      }
    );

    return () => unsubscribe();
  }, [userInfo.uid]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {friendsList.length > 0 ? (
        friendsList.map((name, index) => (
          <View key={index} style={{ padding: 10 }}>
            <Text style={{ fontSize: 20 }}>{name}</Text>
          </View>
        ))
      ) : (
        <Text>No friends added yet.</Text>
      )}
    </SafeAreaView>
  );
}

