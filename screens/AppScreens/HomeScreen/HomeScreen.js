import React, { useState, useEffect } from 'react'
import { Text, View, SafeAreaView, Pressable } from 'react-native'
import { useAuth } from '../../../providers/authProvider';
import { auth, db } from '../../../firebase/firebaseConfig'; //reference to my apps auth service and firestore db
import { signOut } from "firebase/auth"; // User Sign out 
import { doc, getDoc } from "firebase/firestore";



export default function HomeScreen() {
    const { userInfo, setUserInfo, signOutUser } = useAuth(); //-- for sign-out purposes;
    const [userDoc, setUserDoc] = useState(null); //-- User's Doc, retrieved on sign in.

    //-- Get user's document from firebase upon successful authentication and sign in. 
    useEffect(()=>{
        getUser(userInfo.uid)
    }, [userInfo])


    async function getUser(id) {
        const docRef = doc(db, "users", id);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            setUserDoc(docSnap.data())
            } else {
            console.log(`Document with id: ${id} does not exist`);
            }
        } catch (error) {
            console.error("Error getting user document:", error);
        }
    }


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