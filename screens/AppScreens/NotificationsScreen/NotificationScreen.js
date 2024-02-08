import React, { useEffect, useState } from 'react'
import { Text, View, SafeAreaView, Pressable, SectionList, StyleSheet } from 'react-native'
import { collection, query, where, getDocs, doc, updateDoc, setDoc, serverTimestamp} from "firebase/firestore";
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

    //-- Respond to a friend Request (APPROVE OR REJECT) -- friendshipNotifications is the array of all current notifications
      const handleFollowRequest = async (friendshipNotifications, requestorId, response) =>{
        const notificationToHandle = friendshipNotifications.find((notif) => notif.data.requestorId === requestorId); //find the notification currently being accepted/rejected
        try{
          //updating a doc: https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
          const friendshipDocRef = doc(db, "friendships", notificationToHandle.id); //reference to the friendship doc to update
          console.log('Notifications Page -- updating a doc')
          await updateDoc(friendshipDocRef, {
            status: response
          });
          const updatedNotifications = friendshipNotifications.filter((notif) => notif.data.requestorId !== requestorId); //remove the notification that was just handled by user
          setFriendshipNotifications(updatedNotifications) //update state var
        } catch(e){
          console.error(e);
        }
        //TODO: We will need to manage all things firebase through context in the actual app.
      }
  


    //-- Build the appropriate notification lists in a sectionList (follow requests vs chats);
    const buildNotificationList = () => {
      const chatNotifications = []; //will be replaced by state var in tabNav.js;
      return (
        <View>
          <SectionList sections={[
              { title: 'Follow Requests', data: friendshipNotifications },
              { title: 'New Messages', data: chatNotifications }, 
            ]}
            renderItem={({ item }) => friendshipNotifications ? followReqListItem(item) : null}
            renderSectionHeader={({ section }) => (
              <Text style={{ padding: 10, fontSize: 14, fontWeight: 'bold', backgroundColor: 'rgba(247,247,247,1.0)' }}>
                {section.title}
              </Text>            )}
            keyExtractor={item => item.data.requestorId}
        />
        </View>
      );
    }

    //-- List Item for Follow request notifications
    const followReqListItem = (item) => {  
      return(
        <Pressable onPress={() => console.log('SHOW USER PROFILE MODAL')}>
          <View style={styles.liContainer}>
            <Text>{item.data.requestorName} has requested to follow you.</Text>
            <View>
              <Pressable onPress={() => handleFollowRequest(friendshipNotifications, item.data.requestorId, "ACCEPTED")}> 
                <Text>Accept</Text> 
              </Pressable>
              <Pressable onPress={() => handleFollowRequest(friendshipNotifications, item.data.requestorId, "REJECTED")}> 
                <Text>Reject</Text> 
              </Pressable>
            </View>
          </View>
        </Pressable>
      );
    }


  return (
    <View>
      {friendshipNotifications.length > 0 ? buildNotificationList() : null}
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
