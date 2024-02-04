import React, {useState, useEffect} from 'react'
import { Text, View, SafeAreaView, Pressable, TextInput, FlatList, StyleSheet,  } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, addDoc, } from "firebase/firestore";
//-- https://firebase.google.com/docs/firestore/query-data/queries
//-- https://reactnative.dev/docs/flatlist?language=javascript 

export default function FriendsScreen(){
  const [textInput, setTextInput] = useState(''); //-- Capture user's input
  const { userInfo, setUserInfo, signOutUser } = useAuth(); //-- for sign-out purposes;
  const usersRef = collection(db, "users"); //-- Reference to firestore "users" collection
  const [matchingUserDocs, setMatchingUserDocs] = useState([]);
  const [selectedUserDocId, setSelectedUserDocId] = useState(); //-- On user list item press 



  //-- Query Users collection for matching User Names
    const queryUsersCollection = async () => {
      const searchTerms = textInput.split(" "); //-- split the search term to query by all sub terms (User One --> User, One)
      const queries = searchTerms.map((term) => query(usersRef, where("name", ">=", term)));

      try {
        const matchingDocuments = []; //build an array of matches
        const querySnapshot = await Promise.all(queries.map((q) => getDocs(q)));
        querySnapshot.forEach((snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (!matchingDocuments.some((d) => d.id === doc.id)) {
              matchingDocuments.push({ id: doc.id, data });
            }
          });
        });
        setMatchingUserDocs(matchingDocuments);
      } catch (e) {
        console.error(e);
      }
    };


    //-- Build friendship document and send request;
    const requestFollow = async (user) => {
      console.log(`sending friend request to: ${user.name}`)
      try {
        const docRef = await addDoc(collection(db, "friendships"), {
          requestorId: userInfo.uid,  //-- The user requesting to follow (current phone user) 
          requesteeId: user.docId,    //-- The user receiving the request 
          status: 'PENDING',          //-- PENDING || ACCEPTED || REJECTED
          chatId: null,               //-- Reference to chat document between the two
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    

    //-- Render Matching User list item
    // For real app -- This should be a + on top toolbar that renders a slide up sheet. With a separate search bar for searching for friends
    const renderItem = ({ item }) => {
      return(
      <Pressable 
        onPress={() => console.log(item.data.docId)}>
        <View style={styles.listItem}>
            <Text>{item.data.name}</Text>
            <Pressable 
              onPress={() => requestFollow(item.data)}>
              <Text>Follow</Text>
            </Pressable>
        </View>
      </Pressable>
      );
    }



    return (
      <SafeAreaView style={styles.container}>
        {/* SEARCH BAR VIEW */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search for a user"
            multiline={false}
            onChangeText={setTextInput}
            value={textInput}
          />
          <Pressable onPress={() => queryUsersCollection()}>
            <FontAwesome name={'search'} size={20} color={'black'} />
          </Pressable>
        </View>
  
        {/* MATCHING USERS LIST */}
        {matchingUserDocs && (
          <FlatList
            data={matchingUserDocs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
    margin:24
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1, 
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },

  listItem:{
    padding:20,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
