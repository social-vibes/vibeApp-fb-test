import React, { useState, useEffect } from 'react'
import { Text, View, SafeAreaView, Pressable } from 'react-native'
import { useAuth } from '../../../providers/authProvider';
import { auth, db } from '../../../firebase/firebaseConfig'; //reference to my apps auth service and firestore db
import { signOut } from "firebase/auth"; // User Sign out 



export default function HomeScreen() {
    const { userInfo, setUserInfo, signOutUser } = useAuth(); //-- for sign-out purposes;

    return (
        <SafeAreaView>
            <Text style={{color: "red"}}>Home Screen</Text>
            <Text style={{color: "red"}}>Currently Signed in {`: ${userInfo.email}`}</Text>
            <Pressable
                onPress={() => {
                    signOut(auth)
                    .then(() => {
                        signOutUser();
                    })
                    .catch((error) => {console.log("Error signing out", error)});                
                }}
            >
                <Text>Log Out</Text>
            </Pressable>
        </SafeAreaView>
    )
}