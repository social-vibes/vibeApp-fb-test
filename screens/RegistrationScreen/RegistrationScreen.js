import React, { useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import styles from './styles';
import { auth, db } from '../../firebase/firebaseConfig'; 
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { collection, addDoc } from "firebase/firestore"; 


export default function RegistrationScreen({navigation}) {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    

    //-- Initiate REGISTRATION
    const onRegisterPress = async () => {
    //TODO: more password validation
    if (password !== confirmPassword) {
        alert("Passwords don't match.")
        return
    } 
    await registerUser(email, password)
    }


    //-- REGISTER NEW USER with Email/Pass.
    const registerUser = async (email, password) =>{
        createUserWithEmailAndPassword(auth, email, password) //Create a password-based account
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("New user registered:", user.uid);
            addUserToDb(user.uid) //add new user to users collection
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            print(errorCode, errorMessage);
        });
    }


    //-- SAVE NEW USER in Firestore "users" collection
    async function addUserToDb(id) {
    try {
    const docRef = await addDoc(collection(db, "users"), {
        email: email,
        name: fullName,
        id: id
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    }


    const onFooterLinkPress = () => {
        navigation.navigate('LoginScreen')
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, width: '100%' }}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/icon.png')}
                />
                <TextInput
                    style={styles.input}
                    placeholder='Full Name'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setFullName(text)}
                    value={fullName}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder='E-mail'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='Password'
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='Confirm Password'
                    onChangeText={(text) => setConfirmPassword(text)}
                    value={confirmPassword}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onRegisterPress()}>
                    <Text style={styles.buttonTitle}>Create account</Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Already got an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Log in</Text></Text>
                </View>
            </View>
        </View>
    )
}