import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Animatable from 'react-native-animatable';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export const CurrentLocationButton = function(props) {
  const cb = props.cb ? props.cb : () => console.log('Callback function not passed to CurrentLocationButton!');
  const bottom = props.bottom ? props.bottom : 0;
  const [animationType, setAnimationType] = React.useState('zoomIn');

    return (
      <Animatable.View animation={animationType} iterationCount={1} delay={0} useNativeDriver={true} style={[styles.container, {top: SCREEN_HEIGHT - bottom}]}>
        <MaterialIcons name="my-location" color="#000" size={25} onPress={() => {cb(); setAnimationType('zoomOut'); setAnimationType('zoomIn');}} />
			</Animatable.View>
    )
}


const styles = StyleSheet.create({
  container:{
    //position: 'absolte', thi create problem
    left: (SCREEN_WIDTH - 230),
    zIndex: 9,
    width: 45,
    height: 45,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: "#000000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});