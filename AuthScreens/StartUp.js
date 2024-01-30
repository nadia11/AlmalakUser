import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

import { LanguageSelection } from './LanguageSelection';
import CustomStatusBar from '../components/CustomStatusBar';
import Noticeboard from '../components/NoticeBoard';
import SliderScrollView from '../components/SliderScrollView';
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export const StartUp = (props) => {
  // const { navigation } = props;
  const [language, setLanguage] = React.useState(null);
  const [sliderImages, setSliderImages] = React.useState([]);
  const [fromOnline, setFromOnline] = React.useState(false);

  const getLan = async () => {
    try {
      const langStorage = await AsyncStorage.getItem('langStorage')
      // const langStorage = await AsyncStorage.removeItem('langStorage')
      if(langStorage !== null) { setLanguage(langStorage); }
    } catch (error) { console.error(error); }
  }

  React.useEffect(() => {
    getLan();
    //getSliderImage();
  }, []);

  
  if(language === null) {
    return ( <LanguageSelection navigation={props.navigation} /> )
  }
  
  
  const getSliderImage = () => {
    return fetch('https://tutofox.com/foodapp/api.json')
      .then((response) => response.json())
      .then((responseJson) => {
        setSliderImages(responseJson.banner);
        setFromOnline(true);
        //console.log(responseJson.banner)
      })
      .catch((error) => console.error(error));
  }
  
  const localSliderImages = [
    require('../assets/images/slider-1.jpg'),
    require('../assets/images/slider-2.jpg'),
    require('../assets/images/slider-3.jpg'),
    require('../assets/images/slider-4.jpg'),
  ]


  return (
    <View style={styles.container}>
        <CustomStatusBar backgroundColor={Colors.BUTTON_COLOR} />

        <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 100, width: 100, alignItems: 'center', justifyContent: 'flex-start', marginBottom: 10 }}>
          <Image style={{ height: 128, width: 128, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
        </Animatable.View>

        <Text style={{ fontSize: 24, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Welcome to Uder Rider App</Text>

        {/* <SliderFlatlist images={fromOnline ? sliderImages : localSliderImages} fromUrl={fromOnline} sliderHeight={300} dotPosition="bottom" /> */}
        <SliderScrollView images={fromOnline ? sliderImages : localSliderImages} fromUrl={fromOnline} sliderHeight={(SCREEN_HEIGHT / 2)+30} dotPosition="bottom" />

		    <View style={{position: 'absolute', bottom: 10, left: 10, flexWrap: "nowrap", flexDirection: "row", justifyContent: 'center'}}>
          <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('LoginMobile')}>
            <Text style={styles.btnText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonOutline} onPress={() => props.navigation.navigate('SignUpMobile')}>
            <Text style={{ color: "#EF0C14", fontWeight: 'bold'}}>Sign Up</Text>
          </TouchableOpacity>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    // flex: 1,
    // backgroundColor: 'red',
    height: SCREEN_HEIGHT - 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    position: 'relative'
  },
  button: {
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.BUTTON_COLOR,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH /2) - 20
  },
  buttonOutline: {
    alignItems: "center",
    padding: 15,
    borderColor: Colors.BUTTON_COLOR,
    borderWidth: 1,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH /2) - 20
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16
  },
});