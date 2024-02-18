//FriendsScreen.js
import React, {useState, useEffect, useCallback} from 'react'
import { Text, View, SafeAreaView, Pressable, TextInput, FlatList, StyleSheet, Modal  } from 'react-native'
import * as Crypto from 'expo-crypto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../../providers/authProvider';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs,getDoc,setDoc, addDoc, onSnapshot,doc } from "firebase/firestore";
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
  const [isModalVisible, setIsModalVisible] = useState(false); //-- Modal to create group chat
  const [selectedFriends, setSelectedFriends] = useState([]); //-- state for selectedFriends to be in a group chat
  const [groupList, setGroupList] = useState([]); 
  const [groupName, setGroupName] = useState(''); //-- field to set group name
  const navigation = useNavigation();


  //-- Get friends list when friendsScreen is mounted. Use focusEffect is from reactNavigation - ensures the getfriendslist() always runs when screen is focused.
  useFocusEffect(
    useCallback(() => {
      getFriendsList();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      getGroupsList();
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
          chatId: Crypto.randomUUID(),               //-- Reference to chat document between the two
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
  
//Modal for friends selection
    const toggleModal = () => {
      setIsModalVisible(!isModalVisible);
      if (isModalVisible) {
        setSelectedFriends([]);
      }
    };
    
    const handleSelectFriend = (friendId) => {
      setSelectedFriends((currentSelected) => {
        if (currentSelected.includes(friendId)) {
          // If already selected, remove from the selection
          return currentSelected.filter((id) => id !== friendId);
        } else {
          // If not selected, add to the selection
          return [...currentSelected, friendId];
        }
      });
    };
    //function to create group chat, Initialized through create button
    const createGroupChat = async () => {
      try {
        if (selectedFriends.length > 1 && groupName) { // Ensure there are at least 2 friends selected and a group name is provided
          // Fetch user names for the selected friends using their docId
          const memberNames = await Promise.all(selectedFriends.map(async (friendDocId) => {
            const userDocSnapshot = await getDoc(doc(db, "users", friendDocId));
            return userDocSnapshot.exists() ? userDocSnapshot.data().name : "Unknown User";
          }));

          const newChatDocRef = doc(collection(db, "chats"));
          
          await setDoc(newChatDocRef, {
            chatId: newChatDocRef.id,
            users: [...selectedFriends, userDoc.docId], // Include the current user's ID along with selected friends
            memberNames: memberNames,
            groupName: groupName,
            groupChat: true,
          });
    
          console.log('New group chat created');
          toggleModal(); // Close the modal
          setGroupName(''); // Reset the group name
          setSelectedFriends([]); // Reset selected friends
          getGroupsList(); // Refresh the list of group chats
        } else {
          // Handle error: Not enough friends selected or no group name provided
          console.error("Error: Not enough friends selected or no group name provided.");
        }
      } catch (error) {
        console.error('Error creating group chat:', error);
      }
    };
  
    const getGroupsList = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'chats'),
          where('groupChat', '==', true),
          where('users', 'array-contains', userDoc.docId)
        ));
    
        const groupChats = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data()
        }));
        setGroupList(groupChats);
      } catch (error) {
        console.error("Error fetching group chats:", error);
      }
    };
    const buildGroupsList = () => {
      return (
        <FlatList
          data={groupList}
          keyExtractor={item => item.id}
          renderItem={({ item: chatDoc }) => (
            <Pressable 
              style={styles.groupListItem}
              onPress={() => navigation.navigate('GroupChatScreen', {
                chatId: chatDoc.id,
                groupName: chatDoc.groupName,
                memberNames: chatDoc.memberNames,
                userId: userDoc.docId, 
                // Pass any other relevant data needed for the GroupChatScreen
              })}
            >
              <Text>{chatDoc.groupName}</Text>
            </Pressable>
          )}
        />
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

        {/*CREATE GROUP CHAT BUTTON*/}
        <Pressable onPress={toggleModal} style={styles.createGroupButton}>
          <Text>Create Group Chat</Text>
        </Pressable>

        {/* MODAL FOR SELECTING FRIENDS TO ADD TO GROUP CHAT */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Friends</Text>
          <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const friendId = item.data.requesteeId === currentUserId ? item.data.requestorId : item.data.requesteeId;
            const isSelected = selectedFriends.includes(friendId);
            return (
            <Pressable style={styles.modalFriendItem} onPress={() => handleSelectFriend(friendId)}>
            <Text>{item.data.requesteeId === currentUserId ? item.data.requestorName : item.data.requesteeName}</Text>
            {isSelected && (
            <FontAwesome name="check" size={24} color="green" /> // Make sure FontAwesome is correctly imported and used
            )}
            </Pressable>
            );
          }}
        />
        <View>
        <Text>Name your group: </Text>
        <TextInput
            style={{
              marginTop:15,
              borderWidth: 1,
              backgroundColor: '#fff',
              padding: 5,
              borderRadius: 5,
            }}
            placeholder=""
            multiline={false}
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        <View style={{ display: 'flex',flexDirection: 'row', justifyContent: 'space-between',padding:20,}}>
          <Pressable onPress={toggleModal} style={styles.modalButton}>
          <Text>Close</Text>
          </Pressable>
          <View style={{ width: 20 }} /> 
          <Pressable onPress={createGroupChat}  style={styles.modalButton}>
          <Text>Create</Text>
          </Pressable>
        </View>
          </View>
        </SafeAreaView>
        </Modal>

        {/*GROUP CHATS LIST*/}
        <View style={{ paddingTop: 20 }}>
        <Text style={{ marginBottom: 10 }}>Your Group Chats</Text>
        {buildGroupsList()}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    width: '80%',
    maxHeight: '60%', 
    backgroundColor: 'white', 
    borderRadius: 20,
    padding: 20, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  modalFriendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  
  modalButton: {
    marginTop: 20,
    backgroundColor: 'cyan',
    padding: 10,
    borderRadius: 5,
  },
  createGroupButton: {
    backgroundColor: 'cyan',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  groupListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

