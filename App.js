//import 'react-native-gesture-handler'; /** user for navigation **/

import React, { Component } from 'react';
import { Text, View, StyleSheet, Platform, BackHandler, Alert, ToastAndroid, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

// import { NotifyService } from './AdminScreen/NotifyService';
// import CheckAppUpdate from './components/CheckAppUpdate';
import { AuthContext } from './AuthScreens/context';
import ActivityLoader from './components/ActivityIndicator';
import NetworkConnectionStatus from './components/NetworkConnectionStatus';
import { Colors } from './styles';
import { Options } from './config';


/************ Authentication Section ****************/
//import SplashScreen from 'react-native-splash-screen';
import { StartUp } from './AuthScreens/StartUp';
import SignUpMobileScreen from './AuthScreens/SignUpMobile';
import { SignUpForm } from './AuthScreens/SignUpForm';
import LoginMobileScreen from './AuthScreens/LoginMobile';
import { OTPVerification } from './AuthScreens/OTPVerification';
import TermsAndConditionsModal from './AuthScreens/TermsAndConditionsModal';
import PrivacyPolicyModal from './AuthScreens/PrivacyPolicyModal';


/************ Home Section ****************/
import HomeScreen from './AdminScreen/Home';
import MapScreen from './GoogleMaps/MapScreen';
import FareBreakdown from './GoogleMaps/FareBreakdown';
import locationPickerScreen from './GoogleMaps/locationPickerScreen';
import locationPickerSavedForm from './GoogleMaps/locationPickerSavedForm';
// import { SignIn, CreateAccount, Profile, isSignedIn } from './AuthScreens/Screens';
import PaymentMethodsModal from './AdminScreen/PaymentMethods/PaymentMethodsModal';
import AddNewCard from './AdminScreen/PaymentMethods/AddNewCard';
import savedPlaceModal from './AdminScreen/MenuScreens/savedPlaceScreenModal';
import riderChatMessage from './GoogleMaps/riderChatMessage';
import PaymentInvoice from './GoogleMaps/PaymentInvoice';
import InviteFriends from './AdminScreen/MenuScreens/InviteFriends';
import InviteFriendsSelectContacts from './AdminScreen/MenuScreens/InviteFriendsSelectContacts';


const instructions = Platform.select({
  android: 'Double tap R on your keyboard to reload, \n' + 'Shake or Press menu button for dev menu.',
  ios: 'Press Cmd+R to reload, \n' + 'Cmd+D or Shake for dev menu.'
});
// {instructions}


const AuthStack = createNativeStackNavigator();
function AuthStackScreen(){
  return(
    <AuthStack.Navigator initialRouteName="SignUpMobile" screenOptions={{ gestureEnabled: true, headerTransparent:true, headerStyle: { backgroundColor: Colors.HEADER_NAV_COLOR, height: 50 }, headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' }, headerTintColor: '#fff', headerBackTitleVisible: true }} headerMode='float'>
      <AuthStack.Screen name="StartUp" component={StartUp} options={{ title:"", headerTransparent:false, headerShown: false }} />
      <AuthStack.Screen name="SignUpMobile" component={SignUpMobileScreen} options={{ title: 'Sign Up Mobile', headerTransparent:false }} />
      <AuthStack.Screen name="SignUpForm" component={SignUpForm} options={{ title: 'Sign Up Form', headerTransparent:false }} />
      <AuthStack.Screen name="LoginMobile" component={LoginMobileScreen} options={{ title: 'Login By Mobile', headerTransparent:true }} />
      <AuthStack.Screen name="OTPVerification" component={OTPVerification} options={{ title: 'OTP Verification', headerTransparent:false }} />
      {/* <AuthStack.Screen name="SignIn" component={SignIn} options={{ title:"", headerMode: false }} /> */}
      <AuthStack.Screen name="TermsAndConditionsModal" component={TermsAndConditionsModal} options={{ title: '', headerBackTitleVisible: false, headerTintColor: '#333' }} />
      <AuthStack.Screen name="PrivacyPolicyModal" component={PrivacyPolicyModal} options={{ title: '', headerBackTitleVisible: false, headerTintColor: '#333' }} />
    </AuthStack.Navigator>
  )
}


const AppStack = createNativeStackNavigator();
const AppStackScreen = () => (
  <AppStack.Navigator initialRouteName="Home" screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS} headerMode='float'>
    <AppStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <AppStack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
    <AppStack.Screen name="locationPickerScreen" component={locationPickerScreen} options={{ headerShown: false }} />
    <AppStack.Screen name="locationPickerSavedForm" component={locationPickerSavedForm} options={{ title: 'Save Location', headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="FareBreakdown" component={FareBreakdown} options={{ title: 'Fare Breakdown', headerTransparent: false }} />
    <AppStack.Screen name="PaymentMethodsModal" component={PaymentMethodsModal} options={{ title: 'Payment Methods', headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="AddNewCard" component={AddNewCard} options={{ title: 'Add New Card', headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="savedPlaceModal" component={savedPlaceModal} options={{ headerShown: false }} />
    <AppStack.Screen name="chatMessage" component={riderChatMessage} options={{ headerShown: false }} />
    <AppStack.Screen name="PaymentInvoice" component={PaymentInvoice} options={{ title:"Payment Invoice", headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="InviteFriends" component={InviteFriends} options={{ title: "Invite Friends", headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="InviteFriendsSelectContacts" component={InviteFriendsSelectContacts} options={{ headerShown: false }} />
    <AppStack.Screen name="NetworkConnectionStatus" component={NetworkConnectionStatus} options={{ headerShown: false }} />
  </AppStack.Navigator>
);


const RootStack = createNativeStackNavigator();
export default function App(props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  const [language, setLanguage] = React.useState(null);
  const [mobile, setMobile] = React.useState();
  const { navigation } = props;

  React.useEffect(() => {
    //SplashScreen.hide();
    setTimeout(() => { setIsLoading(false); }, 1000);
  }, []);

  //Push Notification Init
  // const appState = React.useRef(AppState.currentState);
  // const [appStateVisible, setAppStateVisible] = React.useState(appState.current);
  // const onNotificationOpenedApp = () => {}
  // React.useEffect(() => {
  //   NotifyService.configure(onNotificationOpenedApp);

  //   AppState.addEventListener('change', handleAppStateChange);
  //   //AppState.addEventListener('focus', handleAppStateChange);
  //   //AppState.addEventListener('blur', handleAppStateChange);

  //   return () => AppState.removeEventListener('change', handleAppStateChange);
  // }, []);

  // const handleAppStateChange = (nextAppState) => {
  //   if (nextAppState === "active") {
  //     //console.log("AppState: ", nextAppState);
  //   }

  //   if (nextAppState === 'background') {
  //     setAppStateVisible(nextAppState);
  //     //console.log("AppState: ", nextAppState);
  //   }
  // }

  const authContext = React.useMemo(() => {
    return {
      signInToken: async () => { setIsLoading(false); setUserToken('1') },
      signUp: () => { setIsLoading(false); setUserToken('1') },
      signOut: async () => {
          try {
            setIsLoading(false);
            setUserToken(null);
            await AsyncStorage.removeItem('userToken');
          }
          catch (error) { console.error(error); }
      },
    }
  }, []);


  const getUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken')
      const mobile = await AsyncStorage.getItem('mobile')
      const langStorage = await AsyncStorage.getItem('langStorage');
      
      if(userToken !== null) { setUserToken( userToken ); }
      if(mobile !== null) { setMobile( mobile ); }
      if(langStorage !== null) { setLanguage( langStorage ); }
    } catch (error) { console.error(error); }
  }
  React.useEffect(() => { getUserData(); }, []);


  //For check network connection
  const netinfo = useNetInfo();
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {});
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
  }, [netinfo.isConnected]);
   

  //For back button
  const [backPressed, setBackPressed] = React.useState(0);
  React.useEffect(() => {
    const backAction = () => {
      // 2 seconds to tap second-time
      setTimeout(() => { setBackPressed(0); }, 2000);

      if (backPressed < 1) { setBackPressed(backPressed + 1); ToastAndroid.show("Double Tap to exit the App", ToastAndroid.SHORT); }
      else { BackHandler.exitApp() }

      //Alert.alert('Confirm Exit', 'Do you want to Exit from App?', [ {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}, {text: 'Exit', onPress: () => BackHandler.exitApp()} ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [backPressed]);


  if (isLoading) { return <ActivityLoader /> }
  if (netinfo.isConnected !== true) { return <NetworkConnectionStatus /> }

  return (
    <AuthContext.Provider value={authContext}>
      {/* <CheckAppUpdate />  */}
      
      <NavigationContainer>
        <RootStack.Navigator headerMode='none'>
          {userToken == null ? (
            <RootStack.Screen name="Auth" component={AuthStackScreen} options={{ headerShown: false }} />
          ) : (
            <RootStack.Screen name="App" component={AppStackScreen} options={{ headerShown: false }} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: (Platform.OS === 'ios') ? 25 : 0
  }
});
