import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, CheckBox, Button } from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NoRecordIcon from '../components/noRecords';
import { Options } from '../config';
import TripsHistory from '../AdminScreen/MenuScreens/TripHistory';
import TripDetails from '../AdminScreen/MenuScreens/TripDetails';
import FoodHistory from '../AdminScreen/MenuScreens/FoodHistory';
import ParcelHistory from '../AdminScreen/MenuScreens/ParcelHistory';

const HistoryStack = createNativeStackNavigator();
export default function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <HistoryStack.Screen name="createTopTabs" component={CreateTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <HistoryStack.Screen name="TripDetails" component={TripDetails} options={{ title: "Trip Details", headerBackTitleVisible: false,  headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}


const makeRemoteRequest = async () => {
  
};

const MaterialTopTab = createMaterialTopTabNavigator();
function CreateTopTabs() {
  return(
      <MaterialTopTab.Navigator
          screenOptions={{
              tabBarLabelStyle: { fontSize: 12 }, // specifies the common label style
              tabBarStyle: { backgroundColor: '#fff' }, // sets the background color of the tab bar
              tabBarActiveTintColor: "#EF0C14", // defines the color of the label for the active tab
              tabBarIndicatorStyle: { backgroundColor: "#EF0C14" }, // sets the style of the indicator for the active tab
              tabBarInactiveTintColor: "#31455A", // specifies the color of the label for inactive tabs
          }}
      >
          <MaterialTopTab.Screen name="Trips" component={TripsHistory} />
          <MaterialTopTab.Screen name="Food" component={FoodHistory} />
          <MaterialTopTab.Screen name="Parcel" component={ParcelHistory} />
      </MaterialTopTab.Navigator>

  )
}