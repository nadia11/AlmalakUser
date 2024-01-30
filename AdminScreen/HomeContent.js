import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Button, Image, SafeAreaView, ScrollView, RefreshControl, Animated, ToastAndroid } from 'react-native';

import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

import { Colors, Typography } from '../styles';
import { BASE_URL } from '../config/api';
import { Options } from '../config';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const Grid_Columns = 4;

import CustomStatusBar from '../components/CustomStatusBar';
import Noticeboard from '../components/NoticeBoard';


// export function HomeDetailsScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Home Details!</Text>
//     </View>
//   );
// }

// export function HomeScreen2({ navigation }) {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Go to Home Details" onPress={() => navigation.openDrawer('DrawerNavigator')} />
//     </View>
//   );
// }


export default function HomeScreen({ navigation }) {

  const [homePlace, setHomePlace] = React.useState();
  const [workPlace, setWorkPlace] = React.useState();
  const [mobile, setMobile] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userImage, setuserImage] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState(0.00);
  const [showBalance, setShowBalance] = React.useState(null);


  const retrieveData = async () => {
    try {
      const homePlace = await AsyncStorage.getItem('homePlace');
      if(homePlace !== null) { setHomePlace(JSON.parse(homePlace)) }

      const workPlace = await AsyncStorage.getItem('workPlace');
      if(workPlace !== null) { setWorkPlace(JSON.parse(workPlace)) }

      const mobile = await AsyncStorage.getItem('mobile');
      if(mobile !== null) { setMobile( mobile ); }
      
      const userName = await AsyncStorage.getItem('userName');
      if(userName !== null) { setUserName( userName ); }

      const userImage = await AsyncStorage.getItem('userImage');
      if(userImage !== null) { setuserImage( userImage ); }
    } 
    catch (error) { console.error(error); }
  }


  
  const isFocused = useIsFocused();
  React.useEffect(() => {
    retrieveData();
  }, [isFocused]);

  
  const [refreshing, setRefreshing] = React.useState(false);
  const wait = (timeout) => { 
    return new Promise(resolve => setTimeout(resolve, timeout))
  }
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => { setRefreshing(false); });
  }, []);


  const showBalanceHandle = async () => {
    await axios.get(BASE_URL+'/get-wallet-balance/' + mobile)
    .then( async response => {
      //console.log(response.data.wallet_balance);
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

      <ScrollView 
      contentContainerStyle={{ width: SCREEN_WIDTH, flexGrow: 1, paddingBottom: 50 }} 
      scrollsToTop={true} 
      // refreshControl={<RefreshControl refreshing={refreshing} 
      // onRefresh={onRefresh} colors={['#ff0000', '#399046', '#19AAF7', '#ffae00']} 
      // progressBackgroundColor="#fff" 
      // progressViewOffset={20} size={50} 
      // tintColor="#EBEBEB" title="Loading..." />}
      >
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
        
        <Noticeboard color="green" />

        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Services</Text>

          <View style={styles.GridViewBlockStyle}>
            <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="motorcycle" size={40} color="#00A968" /><Text>Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => ToastAndroid.show('Comming Soon...', ToastAndroid.SHORT)} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="hamburger" size={40} color="#00BCD4" /><Text>Food</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => ToastAndroid.show('Comming Soon...', ToastAndroid.SHORT)} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="truck-moving" size={40} color="#F53D3D" /><Text>Parcel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Your Favourite Locations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "homePlace", geometry: (homePlace ? homePlace.geometry : "")})} style={styles.listItem}>
            <Feather name="home" size={25} color={homePlace ? "#007bff" : "#000"} style={styles.leftIcon} />
            <View style={styles.listItemContent}>
              <Text style={styles.locationTitle}>Home</Text>
              <Text ellipsizeMode='tail' numberOfLines={1} style={{width: SCREEN_WIDTH-110}}>{homePlace ? homePlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "workPlace", geometry: (workPlace ? workPlace.geometry : "")})} style={styles.listItem}>
            <Feather name="briefcase" size={25} color={workPlace ? "#007bff" : "#000"} style={styles.leftIcon} />
            <View style={[styles.listItemContent, styles.listItemContentLast]}>
              <Text style={styles.locationTitle}>Work</Text>
              <Text ellipsizeMode='tail' numberOfLines={1} style={{width: SCREEN_WIDTH-110}}>{workPlace ? workPlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Invite Friends & Get Discount on Ride</Text>
          <Image style={{ height: 150, width: 400, resizeMode: 'contain' }} source={require('../assets/welcome-image.png')} />
          <Text style={{textAlign: 'justify', paddingHorizontal: 20, marginVertical: 10}}>Share this code to you Friends. When they will use this code on Ride & complete thier Ride, then you will get discount.</Text>

          <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('InviteFriends', {mobile: mobile})}>
            <Text style={styles.btnOutlineText}>Invite Friends</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container:{
    flex: 1
  },
  sectionContainer: {
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 10,
    marginTop: 15
  },
  GridViewBlockStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  GridViewBlockButton: {
    borderWidth: 2,
    borderColor: "#00A968",
    borderRadius: 5,
    fontSize: 14,
    backgroundColor: '#fff',
    elevation:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    margin: 5,
    width: ((SCREEN_WIDTH-(15*Grid_Columns))/Grid_Columns),
    height: 90,
    flex: 1,
    justifyContent: 'center',
    alignItems: "center",
    fontFamily: Typography.PRIMARY_FONT_REGULAR
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Typography.PRIMARY_FONT_BOLD,
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 10
  },
  listItem: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftIcon: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 10
  },
  listItemContent: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 10,
    width: '100%'
  },
  listItemContentLast: {
    borderBottomWidth: 0
  },
  locationTitle: {
    fontWeight: 'bold',
    fontFamily: Typography.PRIMARY_FONT_BOLD,
    fontSize: 16,
    color: '#333'
  },
  btnOutline: {
    alignSelf: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
    marginTop: 15,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60,
    marginBottom: 20
  },
  btnOutlineText: {
    fontSize: 16,
    color: Colors.BUTTON_COLOR, 
    fontWeight: 'bold',
    textTransform: 'uppercase',
    //fontFamily: 'Roboto-Bold'
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
});