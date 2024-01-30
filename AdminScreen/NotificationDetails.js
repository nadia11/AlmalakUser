import React, { Component, useState } from "react";
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function NotificationDetails(props) {
  const { title } = props.route.params;
  const { body } = props.route.params;
  const { date } = props.route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ width: SCREEN_WIDTH, flexGrow: 1, paddingBottom: 50 }}>

        <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.description}>{body}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    justifyContent: 'flex-start',
    marginTop: 10,
    padding: 10
  },
  title: {
    width: SCREEN_WIDTH-20,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    alignItems: 'baseline',
    marginBottom: 10
  },
  date: {
    paddingBottom: 10,
    fontSize: 14,
    color: '#333'
  },
  description: {
    width: SCREEN_WIDTH-20,
    color: Colors.TEXT_PRIMARY, 
    textAlign: 'justify',
    lineHeight: 25,
    fontSize: 16
  },
});
