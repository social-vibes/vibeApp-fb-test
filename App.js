import React from 'react'
import { LoginScreen, HomeScreen, RegistrationScreen } from './screens'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './providers/authProvider';


const Stack = createNativeStackNavigator();

export default function App() {

  return(
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}

//Conditional app entry point 
function AppContent() {
  const { userInfo } = useAuth();

  return (
      <Stack.Navigator>
        { userInfo ? (
          <Stack.Screen name="Home" component={HomeScreen}/> 
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
  );
}
