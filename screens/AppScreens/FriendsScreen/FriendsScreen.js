import React, {useState, useEffect, useCallback} from 'react'
import { Text, View, SafeAreaView, Pressable, TextInput, FlatList, StyleSheet,  } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigation, useFocusEffect } from '@react-navigation/native';

//-- https://firebase.google.com/docs/firestore/query-data/queries
//-- https://reactnative.dev/docs/flatlist?language=javascript 
//-- https://reactnavigation.org/docs/use-focus-effect/ 

export default function FriendsScreen(){
  const [textInput, setTextInput] = useState(''); //-- Capture user's input
  const { userInfo, signOutUser, userDoc } = useAuth(); //-- userDoc -- current user's doc
  const currentUserId = userDoc.docId; //the id of the current user
  const usersRef = collection(db, "users"); //-- Reference to firestore "users" collection
  const [matchingUserDocs, setMatchingUserDocs] = useState([]);
  const [friendsList, setFriendsList] = useState([]); //-- holds the users friends list ids
  const navigation = useNavigation();


  //-- Get friends list when friendsScreen is mounted. Use focusEffect is from reactNavigation - ensures the getfriendslist() always runs when screen is focused.
  useFocusEffect(
    useCallback(() => {
      getFriendsList();
    }, [])
  );

  //-- Query for users as user types in search bar
  useEffect(() => {
    textInput.length > 0 ? queryUsersCollection() : setMatchingUserDocs([]);
  }, [textInput]);

  //-- Query Users collection for matching User Names (when user is searching for someone to add)
  const queryUsersCollection = async () => {
    try {
      console.log('Friends Page -- querying for a doc (searching users)')
      const userInput = textInput.toLowerCase();
      const querySnapshot = await getDocs(query(usersRef, 
        where("name", ">=", userInput), 
        where("name", "<=", userInput + '\uf8ff')
      ));
      const matchingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setMatchingUserDocs(matchingDocuments);
    } catch (e) {
      console.error(e);
    }
  };
  
    //-- Build friendship document and send request;
    const requestFollow = async (user) => {
      try {
        console.log('Friends Page -- adding a doc')
        const docRef = await addDoc(collection(db, "friendships"), {
          requestorId: userDoc.docId,  //-- The user requesting to follow (current phone user) 
          requesteeId: user.docId,    //-- The user receiving the request 
          requestorName: userDoc.name,
          requesteeName: user.name,
          status: 'PENDING',          //-- PENDING || ACCEPTED || REJECTED
          members: [userDoc.docId, user.docId], //-- both members are put in an array. Makes for easier querying when retrieving friends list.
          chatId: null,               //-- Reference to chat document between the two
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

    //-- Render Matching User list item (when searching for users to add)
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





    //-- Fetch the user's friendsIds from friendships collection
    const getFriendsList = async () => {
      try {
        console.log('Friends Page -- querying for a doc 2')
        const querySnapshot = await getDocs(query( collection(db, 'friendships'),
            where('status', '==', 'ACCEPTED'),
            where('members', 'array-contains-any', [userDoc.docId])
          ));
        const friends = querySnapshot.docs.map((doc) => ({
          id: doc.id, //id of the friendship document in firebase
          data: doc.data() //the friendship document itself
        }));
        setFriendsList(friends)
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };


    //-- Map through the friendsList state array (holding all of the user's friend documents)
    const buildFriendsList = () => {
      return friendsList.map((friendshipDoc) => (
        <FriendListItem key={currentUserId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requestorId : friendshipDoc.data.requesteeId} friendshipDoc={friendshipDoc} />
      ));
    };

    //-- Clickable list item for each friend. This will have to be in a flatlist
    const FriendListItem = ({ friendshipDoc }) => {
      return (
        <Pressable style={styles.friendListItem} 
          onPress={() => navigation.navigate('ChatScreen', {
            userId: userDoc.docId, //the current user
            friendshipDoc: friendshipDoc,     // the user's friend document
          })}
        >
          <Text>{currentUserId === friendshipDoc.data.requesteeId ? friendshipDoc.data.requestorName : friendshipDoc.data.requesteeName }</Text>
        </Pressable>
      );
    };

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
        </View>
  
        {/* MATCHING USERS LIST */}
        {textInput.length > 0 && matchingUserDocs.length > 0 && (
          <FlatList
            data={matchingUserDocs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}

        {/*FRIENDS LIST*/}
        <View style={{paddingTop: 100}}>
          <Text>Your friends list</Text>
          {friendsList.length > 0 && buildFriendsList()}
        </View>
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

  //-- list item from searching users
  listItem:{
    padding:20,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  //-- list item from friends list
  friendListItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'cyan',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

