import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, ToastAndroid, Animated, Linking } from 'react-native';
//import { List, ListItem } from 'react-native-elements';
// import { Container, Header, Content, List, ListItem, Text, Separator, Left, Right, Icon, Body, Button } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import CustomStatusBar from '../components/CustomStatusBar';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { AuthContext } from '../AuthScreens/context';
import { Colors, Typography } from '../styles';
import { Options } from '../config';
import editProfile from './MenuScreens/editProfile';
import savedPlaceScreen from './MenuScreens/savedPlaceScreen';
import LanguageScreen from './MenuScreens/LanguageScreen';
import myWalletMenu from './MenuScreens/myWalletMenu';
import recentTransaction from './MenuScreens/recentTransaction';
import PaymentMethods from './PaymentMethods/PaymentMethods';
import PermissionsScreen from './MenuScreens/PermissionsScreen';
import Coupons from './MenuScreens/Coupons';
// import InviteFriends from './MenuScreens/InviteFriends';
// import InviteFriendsSelectContacts from './MenuScreens/InviteFriendsSelectContacts';
import faqScreen from './MenuScreens/faqScreen';
import privacyPolicyMenu from './MenuScreens/privacyPolicyMenu';
import TermsAndConditionsMenu from './MenuScreens/TermsAndConditionsMenu';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


const MenuStack = createNativeStackNavigator();
export default function MenuStackScreen() {
  return (
    <MenuStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <MenuStack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <MenuStack.Screen name="editProfile" component={editProfile} options={{ title: "Edit Profile", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="savedPlaces" component={savedPlaceScreen} options={{ title: "Saved Places", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="myWallet" component={myWalletMenu} options={{ title: "My Wallet", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="Coupons" component={Coupons} options={{ title: "Coupons", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="recentTransaction" component={recentTransaction} options={{ title: "Recent Transaction", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="PaymentMethods" component={PaymentMethods} options={{ title: "Payment Methods", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="Language" component={LanguageScreen} options={ ({ route }) => { title: route.params.name }} />
      <MenuStack.Screen name="Permissions" component={PermissionsScreen} options={{ title: "Permissions", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      {/* <MenuStack.Screen name="InviteFriends" component={InviteFriends} options={{ title: "Invite Friends", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} /> */}
      {/* <MenuStack.Screen name="InviteFriendsSelectContacts" component={InviteFriendsSelectContacts} options={{ title:"", headerLeft: false, headerTransparent:true }} /> */}
      <MenuStack.Screen name="faq" component={faqScreen} options={{ title: "FAQ", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="PrivacyPolicy" component={privacyPolicyMenu} options={{ title: "Privacy Policy", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <MenuStack.Screen name="TermsAndConditions" component={TermsAndConditionsMenu} options={{ title: "Terms & Conditions", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </MenuStack.Navigator>
  );
}

export const MenuScreen = (props) => {
  const { signOut } = React.useContext(AuthContext);
  const { navigation } = props;

  const _handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure, you want to log out? Stay signed in to book your next trip faster', [
      { text: 'CANCEL', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'CONFIRM SIGN-OUT', onPress: signOut },
    ], { cancelable: true });
  }

  const [mobile, setMobile] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userImage, setUserImage] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState(0.00);
  const [showBalance, setShowBalance] = React.useState(null);
  // const [balanceWidth, setBalanceWidth] = React.useState(new Animated.Value(100));

  
  const getUserData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobile');
      if(mobile !== null) { setMobile( mobile ); }

      const userName = await AsyncStorage.getItem('userName');
      if(userName !== null) { setUserName( userName ); }
      
      const userImage = await AsyncStorage.getItem('userImage');
      if(userImage !== null) { setUserImage( userImage ); }
    } 
    catch (error) { console.error(error); }
  }
  React.useEffect(() => { getUserData() }, []);
  

  const showBalanceHandle = async () => {
    await axios.get(BASE_URL+'/get-wallet-balance/' + mobile)
    .then( async response => {
      console.log(response.data.wallet_balance);
      if(response.data.code === 200){
        setWalletBalance(response.data.wallet_balance);
		    setShowBalance(true);
      }
      else if(response.data.code === 501){
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
      }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
    });
	  setTimeout(() => {setShowBalance(false)}, 5000);
  }

  
  return (
    <SafeAreaView style={styles.container}>
	    <CustomStatusBar />

      <View style={styles.profileCard}>
        <View style={styles.profileImageWrap}>
          {userImage !== "" && <Image source={{uri: userImage, crop: {left: 30, top: 30, width: 60, height: 60}}} style={{height: 70, width: 70, borderRadius: 35 }} /> }
          {userImage == "" && <Feather name="user" size={50} color="#333" style={styles.profileImage} /> }
        </View>
		
        <View style={styles.profileRight}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileMobile}>{mobile}</Text>
        </View>

		<TouchableOpacity onPress={showBalanceHandle} style={{ position: 'absolute', right: 10, top: 45 }}>
          {!showBalance && (
            <Animated.View style={{ height: 35, backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 }}>
              <Text style={{color: Colors.BUTTON_COLOR, fontSize: 20, fontWeight: 'bold'}}>৳</Text>
              <Text style={{color: '#333', fontSize: 14}}> Tap for Balance</Text>
            </Animated.View>
          )}

          {showBalance && (
            <View style={{ height: 35, backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}>
              <Text style={{color: Colors.BUTTON_COLOR, fontSize: 20, fontWeight: 'bold'}}>৳</Text>
              <Text style={{color: '#333', fontSize: 14, marginLeft: 5}}>{Number(walletBalance).toFixed(2)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/*** Separator ***/}
        <Text style={styles.separator}>ACCOUNTS</Text>

        <TouchableOpacity onPress={() => navigation.navigate('editProfile', {name: "Language Preference", mobile: mobile, userName: userName}) } style={styles.listItem}>
          <Ionicons name="md-create" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Edit My Profile</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('savedPlaces', {mobile: mobile}) } style={styles.listItem}>
          <Ionicons name="ios-star" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Saved Places</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('myWallet', {mobile: mobile}) } style={styles.listItem}>
          <FontAwesome5 name="wallet" size={20} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>My Wallet</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Coupons') } style={styles.listItem}>
          <Ionicons name="md-pricetags" size={20} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Coupons</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods', {mobile: mobile}) } style={styles.listItem}>
          <FontAwesome5 name="credit-card" size={20} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}> Payment Methods</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>


        {/*** Separator ***/}
        <Text style={styles.separator}>SETTINGS</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Language', {name: "Language Preference"}) } style={styles.listItem}>
          <Ionicons name="md-globe" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Language</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => navigation.navigate('Permissions')} style={styles.listItem}>
          <MaterialIcons name="verified-user" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Permissions</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.navigate('InviteFriends', {mobile: mobile})} style={styles.listItem}>
          <Feather name="users" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Invite Friends</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        {/*** Separator ***/}
        <Text style={styles.separator}>HELP & SUPPORT</Text>

        <TouchableOpacity onPress={() => navigation.navigate('faq') } style={styles.listItem}>
          <Ionicons name="ios-help-buoy" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Freequently Asked Questions</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions') } style={styles.listItem}>
          <Ionicons name="ios-ribbon" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Terms & Conditions</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy') } style={styles.listItem}>
          <MaterialCommunityIcons name="shield-star-outline" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Privacy Policy</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

		    <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/Almalak-101398854854477')} style={styles.listItem}>
          <MaterialCommunityIcons name="facebook" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Almalak Page</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('http://almalak.com')} style={styles.listItem}>
          <MaterialCommunityIcons name="web" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={styles.listItemText}>Website</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={ _handleSignOut } style={[styles.listItem, {marginTop: 10}]}>
          <Ionicons name="md-exit" size={25} color={Colors.ICON_COLOR} style={styles.leftIcon} />
          <Text style={{color: 'red', fontSize: 16, fontFamily: Typography.PRIMARY_FONT_BOLD}}>Sign Out</Text>
          <Feather name="chevron-right" size={15} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
        </TouchableOpacity>

        <Text style={styles.version}>Version: {Options.APP_OPTIONS.VersionCode}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#fff",
    marginBottom: 100
  },
  profileCard: {
    justifyContent: 'flex-start',
    padding: 15,
    backgroundColor: 'rgba(75,185,90,0.3)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileRight: {

  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: Typography.PRIMARY_FONT_BOLD
  },
  profileMobile: {
    fontSize: 16
  },
  profileImageWrap: {
    backgroundColor: "#EFF3F6",
    borderRadius: 50,
    width: 70,
    height: 70,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  profileImage: {
    lineHeight: 50,
    textAlign: 'center',
    padding: 10
  },
  SubScreencontainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 20
  },
  separator: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: "left",
      backgroundColor: "#EFF3F6",
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginTop: 20,
      fontFamily: Typography.PRIMARY_FONT_BOLD
  },
  listItem: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: "#fff"
  },
  listItemText: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    marginLeft: 15
  },
  leftIcon: {
    position: 'absolute',
    left: 20,
    top: 12
  },
  rightIcon: {
    position: 'absolute',
    right: 15,
    top: 20
  },
  version: {
    margin: 15,
    textAlign: 'center',
    fontSize: 16,
  },

  //For Language Screen
  checkbox: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: (SCREEN_WIDTH - 40),
    paddingVertical: 3,
    paddingLeft: 10,
    borderRadius: 3,
    marginVertical: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  radiobutton: {
    position: 'absolute',
    right: 10,
    top: 5
  },


  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  btnText: {
    fontSize: 16,
    color: "#fff", 
    fontWeight: 'bold',
    //fontFamily: 'Roboto-Bold'
  }
});