import React, { useEffect, useState } from 'react'
import { Text, View, SafeAreaView, Pressable, SectionList, StyleSheet } from 'react-native'
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '../../../firebase/firebaseConfig';

  /*TODO: 
  - update the friendshipDoc.status to users choice (accepted, rejected) 
  - if accept: 
    - send notification to to requestor and let them know that the user has accepted
    - provide user with a button to follow back
  -When adding notifications for messages as well, use sectionList to create a notification 
    list with sections (follow requests, chat notifications - I SET THIS UP) https://reactnative.dev/docs/using-a-listview 
  */


export default function NotificationScreen({ friendshipNotifications, setFriendshipNotifications}){
  //--Array to store notifications. 
  const [notifications, setNotifications] = useState([]);

  useEffect(()=>{
    friendshipNotifications.length > 0 ? getRequestorNames() : null; //-- only query if there are new follow requests.
  },[friendshipNotifications])

    
  //-- If friendshipNotifications.length > 0, retrieve user document(s) of friend REQUESTORS.
  const getRequestorNames = async () => {
    try {
      let requestorIds = [];
      friendshipNotifications.forEach((req) => requestorIds.push(req.data.requestorId));
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("docId", "in", requestorIds));
      const querySnapshot = await getDocs(q);
      setNotifications(() => {
        const newNotifications = [];
        querySnapshot.forEach((doc) => {
          newNotifications.push({
            type: "followReq", // Notification type (follow request vs new message)
            notificationDoc: doc.data(), // Will hold the document with the notification
          });
        });
        return newNotifications;
      });
    } catch (e) {
      console.log(e);
    }
  }


    //-- Respond to a friend Request (APPROVE OR REJECT)
      //friendshipNotifications is the array of all current notifications
      //requestor is the requestor's user doc
      //response is the requestee's response
    const handleFollowRequest = async (friendshipNotifications, requestorId, response) =>{
      const notificationToHandle = friendshipNotifications.filter((notif) => notif.data.requestorId === requestorId); //filter through the array of notifications and retrieve the one being handled atm      
      try{
        //updating a doc: https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
        const friendshipDocRef = doc(db, "friendships", notificationToHandle[0].id); //reference to the friendship doc to update
        await updateDoc(friendshipDocRef, {
          status: response
        });
        setFriendshipNotifications((prevNotif) => {
          const updatedNotifications = [...prevNotif];
          updatedNotifications.splice(updatedNotifications.indexOf(notificationToHandle[0]), 1);  //remove the notif. from notification array
          return updatedNotifications;
        });
        console.log("friendships document updated in firebase, and removed from friendshipNotifications arr");
      } catch(e){
        console.error(e);
      }
      //TODO: We will need to manage all things firebase through context in the actual app.
    }



    //-- Build the appropriate notification lists in a sectionList (follow requests vs chats);
    const buildNotificationList = () => {
      const followNotifications = [];
      const chatNotifications = [];
      notifications.forEach((notif)=>{
        notif.type === "followReq" ? followNotifications.push(notif.notificationDoc) : chatNotifications.push(notif.notificationDoc);
      })
      return (
        <View>
          <SectionList sections={[
              { title: 'Follow Requests', data: followNotifications },
              { title: 'New Messages', data: chatNotifications },
            ]}
            renderItem={({ item }) => data = followNotifications ? followReqListItem(item) : null}
            renderSectionHeader={({ section }) => (
              <Text style={{ padding: 10, fontSize: 14, fontWeight: 'bold', backgroundColor: 'rgba(247,247,247,1.0)' }}>
                {section.title}
              </Text>            )}
            keyExtractor={item => item.docId}
          />
        </View>
      );
    }

    //-- List Item for Follow request notifications
    const followReqListItem = (item) => {      
      return(
        <Pressable onPress={() => console.log('SHOW USER PROFILE MODAL')}>
          <View style={styles.liContainer}>
            <Text>{item.name} has requested to follow you.</Text>
            <View>
              <Pressable onPress={() => handleFollowRequest(friendshipNotifications, item.docId, "ACCEPTED")}> 
                <Text>Accept</Text> 
              </Pressable>
              <Pressable onPress={() => handleFollowRequest(friendshipNotifications, item.docId, "REJECTED")}> 
                <Text>Reject</Text> 
              </Pressable>
            </View>
          </View>
        </Pressable>
      );
    }


  return (
    <View>
      {notifications.length > 0 && buildNotificationList()}
    </View>
  );
}




const styles = StyleSheet.create({
  liContainer: {
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    borderBottomWidth: .5,
    borderBottomColor: '#d3d3d3',
    paddingHorizontal: 10
  },
});
