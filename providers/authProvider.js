import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Password Auth
import { auth, db } from '../firebase/firebaseConfig'; //reference to my apps auth and db services


const AuthContext = createContext();

function AuthProvider({ children }) {
  //-- Capture authenticated user
  const [userInfo, setUserInfo] = useState();

  useEffect(()=>{
    checkLocalStorage();
  }, [])


  //-- Llisten for sign-in/sign-out. Set authenticated user in Async if user is successfully authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserInfo(user); //update state var
        await AsyncStorage.setItem('@userKey', JSON.stringify(user)); //Set userKey in local storage
        console.log("user set in storage");
      } else {
        console.log('not authenticated');
      }
    });
    return () => unsub(); // unmount after sign-in attempt
  }, []);


  //-- Check async storage for user on app load. If present, sign them in
  const checkLocalStorage = async () => {
    console.log("checking local storage...");
    try{
      const userJSON = await AsyncStorage.getItem("@userKey");
      const userData = userJSON ? JSON.parse(userJSON) : null;
      setUserInfo(userData);
    } catch(e){
      console.warn("error accessing local storage", e.message)
    }
  };


  //-- Sign out from App (remove user state and clear async storage)
  const signOutUser = async () => {
    try{
    await AsyncStorage.removeItem("@userKey");
    setUserInfo(null)
    } catch(e){
      console.log("error signing out", e.message)
    }
  }

  return <AuthContext.Provider value={{ userInfo, signOutUser }}>{children}</AuthContext.Provider>;
}


function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Not inside the Provider');
  return context;
}

export { AuthContext, AuthProvider, useAuth };