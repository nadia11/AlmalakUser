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
      <HistoryStack.Screen name="createTopTabs" component={createTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <HistoryStack.Screen name="TripDetails" component={TripDetails} options={{ title: "Trip Details", headerBackTitleVisible: false,  headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}


const makeRemoteRequest = async () => {
  
};

const MaterialTopTab = createMaterialTopTabNavigator();
function createTopTabs() {
  return(
    <MaterialTopTab.Navigator tabBarOptions={{labelStyle: { fontSize: 12 }, style: { backgroundColor: '#fff' } }} activeTintColor="#EF0C14" indicatorStyle="#EF0C14" inactiveTintColor="#31455A" pressColor="#EF0C14">
      <MaterialTopTab.Screen name="Trips" component={TripsHistory} />
      <MaterialTopTab.Screen name="Food" component={FoodHistory} />
      <MaterialTopTab.Screen name="Parcel" component={ParcelHistory} />
    </MaterialTopTab.Navigator>
  )
}