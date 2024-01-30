import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, StatusBar, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';

import * as Animatable from 'react-native-animatable';
//import Icon from 'react-native-vector-icons/FontAwesome';
//import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
//import Ionicons from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { Input } from 'react-native-elements';
import Constants from 'expo-constants';

import axios from 'axios';
import { Font } from 'expo-font';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default class SignUpForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      fontLoaded: false,
      showPass: true,
      press: false
    }
  }

  showPass = () => {
    if(this.state.press == false){
      this.setState({ showPass: false, press: true })
    }else{
      this.setState({ showPass: true, press: false })
    }
  }

  fontLoadedSuccess(){
    setTimeout(() => { this.setState({ fontLoaded: true }) }, 1000)
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    }).then( () => {
      this.setState({ fontLoaded: true });
    });
    //this.fontLoadedSuccess();
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.fontLoaded == true ? <Text style={{ fontFamily: 'Roboto-Bold'}}>Welcome to our Apps</Text> : <ActivityIndicator /> }
      </View>      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingTop: Constants.statusBarHeight,
    backgroundColor: '#fff',
    // backgroundColor: '#00A968',
    paddingLeft: 30,
    paddingRight: 30
  },
  statusBar: {
    backgroundColor: "#C2185B",
    height: Constants.statusBarHeight,
  },
  regform: {
    alignSelf: "stretch",
    textAlign: 'center'
  },
  header: {
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottomColor: '#fff',
    borderBottomWidth: 1
  },
  textinput: {
    alignSelf: "stretch",
    height: 45,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingLeft: 35,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold'
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
    color: '#00A968'
  },
  btnEye: {
    position: 'absolute',
    right: 10,
    top: 10,
  }
});
