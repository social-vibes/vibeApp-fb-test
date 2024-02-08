import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Password Auth
import { auth, db } from '../firebase/firebaseConfig'; //reference to my apps auth and db services
import { doc, getDoc } from "firebase/firestore";


const AuthContext = createContext();

function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(); //user's aut info
  const [userDoc, setUserDoc] = useState(null); //-- User's Doc, retrieved on sign in.

  useEffect(()=>{
    checkLocalStorage();
  }, [])


  //-- Listen for sign-in/sign-out. Set authenticated user in Async if user is successfully authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserInfo(user);
        await AsyncStorage.setItem('@userKey', JSON.stringify(user)); //Set userKey in local storage
        getUser(user.uid);
      } else {
        console.log('not authenticated');
      }
    });
    return () => unsub();
  }, []);


  //-- Check async storage for user on app load. If present, sign them in
  const checkLocalStorage = async () => {
    console.log("checking local storage...");
    try {
      const userJSON = await AsyncStorage.getItem("@userKey");
      const userData = userJSON ? JSON.parse(userJSON) : null; //-- userData == user's auth data, not user's doc
      setUserInfo(userData);
      if (userData) {
        getUser(userData.uid);
      }
    } catch (e) {
      console.warn("error accessing local storage", e.message);
    }
  };


  //-- Get user's document from firebase upon successful authentication and sign in. 
  async function getUser(id) {
    const docRef = doc(db, "users", id);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDoc(docSnap.data());
      } else {
        console.log(`Document with id: ${id} does not exist`);
      }
    } catch (error) {
      console.error("Error getting user document:", error);
    }
  }


  //-- Sign out from App (remove user state and clear async storage)
  const signOutUser = async () => {
    try{
      await AsyncStorage.removeItem("@userKey");
      setUserInfo(null)
      setUserDoc(null); 
    } catch(e){
      console.log("error signing out", e.message)
    }
  }

  return <AuthContext.Provider value={{ userInfo, signOutUser, userDoc }}>{children}</AuthContext.Provider>;
}


function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Not inside the Provider');
  return context;
}

export { AuthContext, AuthProvider, useAuth };