import React from 'react'
import { Text, View, SafeAreaView, Pressable } from 'react-native'
import { useAuth } from '../../providers/authProvider';
import { auth } from '../../firebase/firebaseConfig'; //reference to my apps auth service 
import { signOut } from "firebase/auth"; // User Sign out 


export default function HomeScreen({ navigation }) {
    const { userInfo, setUserInfo, signOutUser } = useAuth();

    if(userInfo){
        console.log(`User Authenticated: Email: ${userInfo.email}, Id: ${userInfo.uid}`);
    }
    
    return (
        <SafeAreaView>
            <Text style={{color: "red"}}>Home Screen</Text>
            <Pressable
                onPress={() => {
                    signOut(auth)
                    .then(() => {
                        signOutUser();
                        // setUserInfo(null)
                    })
                    .catch((error) => {console.log("Error signing out", error)});                
                }}
            >
                <Text>Log Out</Text>
            </Pressable>
        </SafeAreaView>
    )
}