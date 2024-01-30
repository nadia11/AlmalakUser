import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
//import { List, ListItem } from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, } from '@react-navigation/drawer';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import DrawerNavigator from '../AdminScreen/DrawerNavigator';

import { Colors, Typography } from '../styles';
import { Options } from '../config';

import NotificationList from './NotificationList';
import EventAndNews from '../AdminScreen/EventAndNews';
import EventAndNewsDetails from '../AdminScreen/EventAndNewsDetails';
import HistoryStackScreen from '../AdminScreen/History';
import MenuStackScreen from '../AdminScreen/Menu';
import HomeScreen from './HomeContent';
import HomeDetailsScreen from './HomeContent';


const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerLeft: props => <DrawerButton {...props} />, headerTitleAlign: 'center', title: '', headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <HomeStack.Screen name="HomeDetails" component={HomeDetailsScreen} />
    </HomeStack.Navigator>
  );
}

const FeedStack = createNativeStackNavigator();
function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <FeedStack.Screen name="EventAndNews" component={EventAndNews} options={{title: "News & Events", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO}} />
      <FeedStack.Screen name="EventAndNewsDetails" component={EventAndNewsDetails} options={{title: "News Details", headerRight: () => Options.APP_OPTIONS.HEADER_LOGO}} />
    </FeedStack.Navigator>
  );
}
 
export function DrawerButton() {
  const [mobile, setMobile] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userPhoto, setUserPhoto] = React.useState('');

  const getUserData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName')
      const mobile = await AsyncStorage.getItem('mobile')
      const userPhoto = await AsyncStorage.getItem('userPhoto')
      
      if(userName !== null) { setUserName( userName ); }
      if(mobile !== null) { setMobile( mobile ); }
      if(userPhoto !== null) { setUserPhoto( userPhoto ); }
    } catch (error) { console.error(error); }
  }
  React.useEffect(() => { getUserData() }, []);

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileImageWrap}>
        {userPhoto !== "" && <Image style={{ height: 70, width: 70, resizeMode: 'contain', borderRadius: 100 }} source={{uri: userPhoto}} /> }
        {userPhoto == "" && <Feather name="user" size={40} color="#333" style={styles.profileImage} /> }
      </View>
      <View style={styles.profileRight}>
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileMobile}>{mobile}</Text>
      </View>
    </View>
  );
}



const MaterialBottomTab = createMaterialBottomTabNavigator();
export default function Home() {
  return (
    <MaterialBottomTab.Navigator
    screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') { iconName = focused ? 'home' : 'home'; }
          if (route.name === 'Notifications') { iconName = focused ? 'notifications' : 'notifications-active'; }
          if (route.name === 'History') { iconName = focused ? 'history' : 'history'; }
          if (route.name === 'Feed') { iconName = focused ? 'rss-feed' : 'rss-feed'; }
          else if (route.name === 'Menu') { iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted'; }
          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
      initialRouteName="Home" activeColor="#fff" inactiveColor="#31455A" barStyle={{ backgroundColor: Colors.HEADER_NAV_COLOR, paddingBottom: 5, shadowColor:'#000', shadowOffset: {width:0, height:0 }, shadowOpacity: 0.5 }} labeled={true} shifting={true}>
      <MaterialBottomTab.Screen name="Home" component={HomeStackScreen} />
      <MaterialBottomTab.Screen name="Notifications" component={NotificationList} />
      <MaterialBottomTab.Screen name="History" component={HistoryStackScreen} />
      <MaterialBottomTab.Screen name="Feed" component={FeedStackScreen} options={{tabBarLabel: 'Feed', tabBarIcon: ({ color }) => (<Ionicons name="newspaper-outline" color={color} size={26} />)}} />
      <MaterialBottomTab.Screen name='Menu' component={MenuStackScreen} />
    </MaterialBottomTab.Navigator>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    // marginBottom: 100
  },
  profileCard: {
    height: 50,
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: 'rgba(75,185,90,0.3)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileRight: {

  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    fontFamily: Typography.PRIMARY_FONT_BOLD
  },
  profileMobile: {
    fontSize: 16,
    color: '#fff'
  },
  profileImageWrap: {
    backgroundColor: "#EFF3F6",
    borderRadius: 50,
    width: 50,
    height: 50,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  profileImage: {
    lineHeight: 35,
    textAlign: 'center',
    padding: 10
  }
});