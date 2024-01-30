import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { RadioButton } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export const LanguageSelection = (props) => {
  const [checked, setChecked] = React.useState();
  const [language, setLanguage] = React.useState(null);
  const { navigation } = props;

  const getLanguage = async () => {
    try {
      const langStorage = await AsyncStorage.getItem('langStorage')
      // const langStorage = await AsyncStorage.removeItem('langStorage')
      if(langStorage !== null) { setLanguage(langStorage); setChecked(langStorage) }
    } catch (error) { console.error(error); }
  }

  React.useEffect(() => {
    getLanguage();
  }, []);


  const _signInPage = async () => {
    if(language == null){
      alert("Please select Language First");
    }
    else{
      try {
        await AsyncStorage.setItem('langStorage', language);
        navigation.navigate('LoginMobile');
      } catch (error) { console.error(error); }
    }
  }

  const _signUpMobilePage = async () => {
    if(language == null){
      alert("Please select Language First");
    }else{
      try {
        await AsyncStorage.setItem('langStorage', language);
      } catch (error) { console.error(error); }

      navigation.push('SignUpMobile', { language: language });
    }
  }

  return (
    <View style={styles.container}>
        <View style={{ flex: 3, alignItems: 'center', justifyContent: 'flex-start', marginTop: 100 }}>
          <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 100, width: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Image style={{ height: 128, width: 128, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
          </Animatable.View>
          
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Select Prefered Language</Text>
                        
            <TouchableOpacity style={styles.checkbox} onPress={() => { setChecked('english'); setLanguage("english"); }}>
              <Text>English</Text>
              <RadioButton style={styles.radiobutton} value="english" status={checked == 'english' ? 'checked' : 'unchecked'} onPress={() => { setChecked('english'); setLanguage("english"); }} color="#EF0C14" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkbox} onPress={() => { setChecked('bangla'); setLanguage("bangla"); }}>
              <Text>বাংলা</Text>
              <RadioButton style={styles.radiobutton} value="bangla" status={checked == 'bangla' ? 'checked' : 'unchecked'} onPress={() => { setChecked('bangla'); setLanguage("bangla"); }} color="#EF0C14" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkbox} onPress={() => { setChecked('arabic'); setLanguage("arabic"); }}>
              <Text>Arabic</Text>
              <RadioButton style={styles.radiobutton} value="arabic" status={checked == 'arabic' ? 'checked' : 'unchecked'} onPress={() => { setChecked('arabic'); setLanguage("arabic"); }} color="#EF0C14" />
            </TouchableOpacity>

            <Text style={{ fontSize: 12, marginTop: 10 }}>*You can change Language later from settings Menu</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', top: SCREEN_HEIGHT-120, left: 10, flex: 1, flexWrap: "nowrap", flexDirection: "row", justifyContent: 'center'}}>
            <TouchableOpacity style={styles.button} onPress={ _signInPage }><Text style={styles.btnText}>Sign In</Text></TouchableOpacity>
            <TouchableOpacity style={styles.buttonOutline} onPress={ _signUpMobilePage }><Text style={{ color: "#EF0C14", fontWeight: 'bold'}}>Sign Up</Text></TouchableOpacity>
        </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center',
    paddingTop: (Platform.OS === 'ios') ? 25 : 0
  },
  button: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#DC2322",
    marginVertical: 30,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH /2) - 20
  },
  buttonOutline: {
    alignItems: "center",
    padding: 15,
    borderColor: "#DC2322",
    borderWidth: 1,
    marginVertical: 30,
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
  checkbox: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: SCREEN_WIDTH - 40,
    paddingVertical: 3,
    paddingLeft: 10,
    borderRadius: 3,
    marginVertical: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  radiobutton: {
    position: 'absolute',
    right: 10,
    top: 5
  }
});