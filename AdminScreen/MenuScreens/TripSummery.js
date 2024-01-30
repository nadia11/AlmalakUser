import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Colors } from '../../styles';
import { BASE_URL } from '../../config/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TripSummery({ route, navigation }) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        <Text>Trip Summery</Text>
        {/* <Text>{route?.params?.owner ? `${route.params.owner}'s Wallet` : ''}</Text> */}
        
      </View>
    );
  }

  
const styles = StyleSheet.create({
  container: {
    marginBottom: 100
  },
  scrollView: {
      width: SCREEN_WIDTH-0,
      height: SCREEN_HEIGHT,
      paddingHorizontal: 20,
      marginBottom: 10
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-100,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
});