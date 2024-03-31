import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, Button } from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NoRecordIcon from '../../components/noRecords';
import { Options } from '../../config';
import RecentTransactionData from './RecentTransactionData';

const HistoryStack = createNativeStackNavigator();
export default function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <HistoryStack.Screen name="createTopTabs" component={CreateTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}

const MaterialTopTab = createMaterialTopTabNavigator();
function CreateTopTabs() {
  return(
      <MaterialTopTab.Navigator
          screenOptions={{
              tabBarLabelStyle: { fontSize: 12 }, // sets the common style for the text labels on the tabs
              tabBarStyle: { backgroundColor: '#fff' }, // defines the background color of the tab bar
              tabBarActiveTintColor: "#EF0C14", // specifies the color of the label for the active tab
              tabBarIndicatorStyle: { backgroundColor: "#EF0C14" }, // customizes the style of the indicator for the active tab
              tabBarInactiveTintColor: "#31455A", // sets the color of the label for inactive tabs
          }}
      >
          <MaterialTopTab.Screen name="ALL" component={AllTransactionTab} />
          <MaterialTopTab.Screen name="DEBIT" component={DebitTransactionTab} />
          <MaterialTopTab.Screen name="CREDIT" component={CreditTransactionTab} />
      </MaterialTopTab.Navigator>

  )
}

function AllTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="All" />;
}

function DebitTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="paid" />;
  //Debit
}

function CreditTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="unpaid" />;
  //Credit
}


