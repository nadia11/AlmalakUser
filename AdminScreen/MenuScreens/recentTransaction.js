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
      <HistoryStack.Screen name="createTopTabs" component={createTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}

const MaterialTopTab = createMaterialTopTabNavigator();
function createTopTabs() {
  return(
    <MaterialTopTab.Navigator tabBarOptions={{labelStyle: { fontSize: 12 }, style: { backgroundColor: '#fff' } }} activeTintColor="#EF0C14" indicatorStyle="#EF0C14" inactiveTintColor="#31455A" pressColor="#EF0C14">
      <MaterialTopTab.Screen name="ALL" component={allTransactionTab} />
      <MaterialTopTab.Screen name="DEBIT" component={debitTransactionTab} />
      <MaterialTopTab.Screen name="CREDIT" component={creditTransactionTab} />
    </MaterialTopTab.Navigator>
  )
}

function allTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="All" />;
}

function debitTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="paid" />;
  //Debit
}

function creditTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="unpaid" />;
  //Credit
}


