import React from 'react'
import { Text, View, SafeAreaView, Pressable } from 'react-native'


export default function NotificationScreen({friendshipNotifications}){

  console.log(friendshipNotifications);
  /*TODO: 
  - query for userDocs that matches friendship requestorIds
  - load list of follow request notifications with accept/reject
  - update the friendshipDoc.status to users choice (accepted, rejected) 
  - if accept: 
    - send notification to to requestor and let them know that the user has accepted
    - provide user with a button to follow back
  */

  return(
    <View>
      <Text>Notifications</Text>
    </View>
  )
}