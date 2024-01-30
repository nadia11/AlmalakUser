import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ToastAndroid } from 'react-native';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import { Colors, Typography } from '../../styles';

export default function LanguageScreen(props) {
  const [checked, setChecked] = React.useState();
  const [language, setLanguage] = React.useState(null);

  const getLan = async () => {
    try {
      const langStorage = await AsyncStorage.getItem('langStorage')
      if(langStorage !== null) { setLanguage(langStorage); setChecked(langStorage) }
    } catch (error) { console.error(error); }
  }

  React.useEffect(() => {
    getLan()
  }, []);

  const acceptHandler = async () => {
    try {
      await AsyncStorage.setItem('langStorage', language);
    } catch (error) { console.error(error); }

    ToastAndroid.showWithGravity("Language Saved.", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    props.navigation.goBack();
  }

  return (
    <View style={styles.SubScreencontainer}>
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

        <TouchableOpacity style={styles.button} onPress={ acceptHandler }>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#fff",
    marginBottom: 100,
    alignItems: 'center'
  },
  SubScreencontainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 20
  },

  checkbox: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: (SCREEN_WIDTH - 40),
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
  },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.BUTTON_COLOR,
    marginTop: 30,
    borderRadius: 5,
    width: SCREEN_WIDTH - 100,
    marginLeft: 50
  },
  btnText: {
    fontSize: 16,
    color: "#fff", 
    fontWeight: 'bold',
    textTransform: 'uppercase',
    //fontFamily: 'Roboto-Bold'
  }
});