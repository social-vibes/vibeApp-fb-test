This repository contains the testing code for implementing various Firebase services in to a React Native Expo app. This includes:
  - Firebase Password Authentication 
  - Firebase FireStore DB

Notes:
  - *This repo does not contain third party authentication services such as Google or Facebook*
  - *This repo is linked to the **vibeApp-fb-test** project in Firebase*
  - *This repo uses the Firebase JS SDK*

Documentation:
  - https://docs.expo.dev/guides/using-firebase/#using-firebase-js-sdk
  - https://firebase.google.com/docs/auth
  - https://firebase.google.com/docs/firestore/quickstart
  - https://reactnavigation.org/docs/getting-started



 **Firebase project setup**
  - Sign in to Firebase using the Pixel Works team credentials (dev.pixelworks@gmail.com) 
  - Select "Add Project"



 **Firebase Authentication Setup**
  - https://firebase.google.com/docs/auth
  - On the Project Overview page, select Build --> Authentication --> Get Started
  - Under Sign-in providers, select Email/Password and enable the feature then save
  - Register a "Web App" for your project and give it a nickname (vibesTest)
  - The Firebase SDK configuration file will be generated

  - Add the Firebase SDK to your RN project using NPM. 
    - npm install firebase

  - Add the React Native Navigation library and its dependencies. This will be used to navigate between the sign in and registration pages.
    - https://reactnavigation.org/docs/getting-started 
    - npm install @react-navigation/native 
    - npx expo install react-native-screens react-native-safe-area-context
    - npm install @react-navigation/native-stack 

  - Create a Firebase folder and a firebaseConfig.js file within.
    - Paste the code from the Firebase SDK configuration file into firebaseConfig.js

 **Firebase Cloud Firestore setup**
  - https://firebase.google.com/docs/firestore/quickstart
  - On the Project Overview page, select Build --> Firestore database --> Create database

 **Initialize the Firestore JS SDK in the app**
  Configure Metro to set up the development environment (fb JS SDK - STEP 3)
    - https://docs.expo.dev/guides/using-firebase/#using-firebase-js-sdk 
    - npx expo customize metro.config.js
    - Replace the content in metro.config.js file with:

        const { getDefaultConfig } = require('@expo/metro-config');
        const defaultConfig = getDefaultConfig(__dirname);
        defaultConfig.resolver.sourceExts.push('cjs');
        module.exports = defaultConfig;

Following these steps, you should now be able to register an account through Firebase password authentication, and write a document container the newly registered user object in Firestore.
______________________________________________________
**ERROR With new Firebase 10.7.2**
@firebase/firestore: Firestore (10.7.2): INTERNAL UNHANDLED ERROR:  TypeError: Cannot read property 'includes' of undefined
    at isSafari 

**FIX:** 
This seems to be a bug introduced with Firebase 10.7.2. The fix involves downgrading to Firebase 10.7.1
https://github.com/firebase/firebase-js-sdk/issues/7962

**STEPS:**
- rm -rf node_modules
- rm package-lock.json
- remove firebase@10.7.2 from your package.json file
- npm install firebase@10.7.1 
- npm install 
______________________________________________________
