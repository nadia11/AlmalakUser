import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function NoRecordIcon(props) {
    return (
      <TouchableOpacity onPress={() => props.reloadFunction ? props.reloadFunction() : ""}>
          {props.spinner === true && (
            <View style={{paddingVertical: 20}} >
              <ActivityIndicator animating size="large" color='#f00' />
            </View>
          )}

          {props.spinner === false && (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <Image source={require('../assets/no-records.png')} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>Could not find any {props.title}</Text>
              <Text><FontAwesome name="repeat" size={15} color="#444" /> Tap to Reload</Text>
            </View>
          )}
      </TouchableOpacity>
    )
}