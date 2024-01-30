import React from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform, Dimensions, Alert, ActivityIndicator, ToastAndroid, PermissionsAndroid } from 'react-native';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
// import { Input } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Picker} from '@react-native-community/picker';
import Modal from 'react-native-modal';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import { Colors } from '../../styles';
import { BASE_URL } from '../../config/api';
import { Options } from '../../config';

export default function editProfile(props) {
  const { navigation } = props;
  const [animating, setAnimating] = React.useState(false);
  
  const [date, setDate] =  React.useState(new Date());
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);

  /***Submit Form***/
  const [fullName, setFullName] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [userImage, setUserImage] = React.useState(null);
  const [uploadedImage, setUploadedImage] = React.useState('');
  const [uploadImageModal, setUploadImageModal] =  React.useState(false);

  const getUserData = async () => {
    await axios.get(BASE_URL+'/get-rider-data/'+props.route.params.mobile)
    .then(async response => {
      let day = response.data.date_of_birth.split('-')[2];
      let month = response.data.date_of_birth.split('-')[1];
      let year = response.data.date_of_birth.split('-')[0];
      let date_of_birth = new Date(year+"-"+month+"-"+day+'T00:00:00.000Z');
      
      setFullName( response.data.user_name );
      setGender( response.data.gender );
      setDate( date_of_birth );
      setDateOfBirth( response.data.date_of_birth );
      setUserImage( response.data.user_image ? response.data.user_image : null );
    });
  }
  React.useEffect(() => { 
    getUserData();
  }, []);
  

  const setDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false);
    
    if(event.type == "set") {
      setDate(currentDate);
      setDateOfBirth(currentDate);
    } else {
      console.log("cancel button clicked");
    }
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const handleSubmit = async () => {
    setAnimating( true );
    // console.log(fullName + props.route.params.mobile + gender + moment(dateOfBirth).format('DD/MM/YYYY'));
    //console.log("uri: "+ uploadedImage.uri + ", filename: "+uploadedImage.fileName + ", fileSize: "+uploadedImage.fileSize + ", width: "+response.width + ", height: "+response.height + ", isVertical: "+response.isVertical + ", path: "+response.path + ", type: " + response.type + ", timestamp: "+response.timestamp);
    await axios.post(BASE_URL+'/update-profile-form', {
        mobile: props.route.params.mobile,
        user_name: fullName,
        gender: gender,
        date_of_birth: moment(dateOfBirth).format('DD/MM/YYYY'),
        user_image: 'data:image/jpeg;base64,' + uploadedImage.base64,
        file_name: uploadedImage.fileName == undefined ? "no_image" : uploadedImage.fileName,
      },
      {onUploadProgress: progressEvent => { 
        console.log('Upload Progress: ' + Math.round(progressEvent.loaded / progressEvent.total * 100) + "%"); 
      }},
    )
    .then(async response => {
      if(response.data.code === 200){
        try {
          await AsyncStorage.setItem('userName', fullName );
          await AsyncStorage.setItem('mobile', props.route.params.mobile);
          await AsyncStorage.setItem('userImage', response.data.user_image);

          ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
          setAnimating( false );
          //props.navigation.popToTop();
          props.navigation.reset({index: 0, routes: [{name: 'Menu'}]});
        } catch (error) { console.error(error); }
      }
      else if(response.data.code === 501){
        Alert.alert('Response Error', response.data.message, [{ text: "OK" }]);
        setAnimating( false );
      }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
      setAnimating( false );
    });
  }

  const getPermissionFromCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: Options.APP_OPTIONS.AppName + " Camera Permission",
          message: Options.APP_OPTIONS.AppName + "App needs access to your camera so you can take your profile pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getPhotoFromCamera();
      } else {
        ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT); 
      }
    } catch (err) { 
      console.warn(err);
      ToastAndroid.show("Error: "+err, ToastAndroid.SHORT);
    }
  };

  const getPhotoFromCamera = () => {
    setUploadImageModal(false);

    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 200,
      maxHeight: 300,
      includeBase64: true,
      //saveToPhotos: true,
      //mediaType: 'video',
      //videoQuality: 'high',
      //durationLimit: 100000, //Video max duration in seconds
      cameraType: 'front', /**'back' or 'front'**/
    };
    
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.errorMessage) {
        alert('ImagePicker Error: ', response.errorMessage);
        console.log('ImagePicker Error: ', response.errorMessage);
      } 
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } 
      else {
        //console.log("uri: "+ response.uri + ", filename: "+response.fileName + ", fileSize: "+response.fileSize + ", width: "+response.width + ", height: "+response.height + ", type: " + response.type + ", base64: "+ response.base64);
        setUserImage(response.uri);
        setUploadedImage(response);
      }
    });
  }

  const getPermissionFromGallery = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: "Cool Photo App Camera Permission",
          message: "Cool Photo App needs access to your camera " + "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getPictureFromGallery();
      } else {
        ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT); 
      }
    } catch (err) { console.warn(err); }
  };

  const getPictureFromGallery = () => {
    setUploadImageModal(false);

    const options = {
      mediaType: 'photo',
      maxWidth: 200,
      maxHeight: 300,
      includeBase64: true
    };

    launchImageLibrary(options, (response) => {
      console.log('Open image picker');

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } 
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } 
      else {
        //console.log("uri: "+ response.uri + ", filename: "+response.fileName + ", fileSize: "+response.fileSize + ", width: "+response.width + ", height: "+response.height + ", type: " + response.type + ", base64: "+ response.base64);
        setUserImage(response.uri);
        setUploadedImage(response);
      }
    });
  }

  const disabledBtn = () => {
    let fields = fullName && gender && dateOfBirth && userImage;
    return fields !== '' ? 0 : 1;
  }
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : 'height'} style={{ flex: 1, justifyContent: "center" }} >
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.regform}>
              <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 30, width: SCREEN_WIDTH-60}}>
                <TouchableOpacity onPress={() => setUploadImageModal(true)} style={styles.uploadAvatar}>
                  <View style={styles.avatarContainer}>
                    {userImage === null ? (
                      <Feather name="user" size={60} color="#000" style={{ height: 120, width: 120, borderRadius: 0, lineHeight: 100, paddingLeft: 20 }} />
                    ) : (
                      <Image source={{uri: userImage, crop: {left: 30, top: 30, width: 60, height: 60}}} style={{ height: 120, width: 120, resizeMode: 'contain', borderRadius: 0 }} />
                    )}
                  </View>
                </TouchableOpacity>

                <Modal isVisible={uploadImageModal} animationType='slide' backdropColor="#000" backdropOpacity={0.3} style={styles.bottomModal} onBackButtonPress={() => setUploadImageModal(false)} onBackdropPress={() => setUploadImageModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalBackground}>
                      <Text style={styles.title}>Photo</Text>

                      <TouchableOpacity onPress={getPermissionFromCamera} style={[styles.addButton, {borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                        <Text style={styles.addButtonText}>Take From Camera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={getPermissionFromGallery} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Select From Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                <Text style={{fontSize: 18}}>Take your profile photo</Text>
              </View>

              <View>
                <Feather name="user" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Full Name" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="default" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setFullName( val )} value={fullName} />
              </View>

              <View>
                <View style={[styles.textInput, {paddingRight: 0}]}>
                  <Ionicons name="md-transgender" size={20} style={styles.inputIcon} />
                  <Picker selectedValue={gender} onValueChange={(itemValue, itemIndex) => setGender(itemValue)}>
                    <Picker.Item label="--Select Gender--" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Others" value="others" />
                  </Picker>
                </View>
              </View>
              
              <View>
                <Feather name="calendar" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Date of birth" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="number-pad" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setDateOfBirth( val )} value={dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : ""} onFocus={showDatepicker} />
              </View>

              {show && (
                <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="default" 
                value={date} mode={mode} onChange={setDateOnChange}
                is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
                minimumDate={new Date().setFullYear(new Date().getFullYear()-100)} maximumDate={new Date()}
                />
              )}

              <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ handleSubmit } disabled={disabledBtn() == 1 ? true : false}>
                <Text style={styles.btnText}>{animating === false ? "Update Profile" : "Submitting..."}</Text>
                <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", left: 70, top: 3}} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBackground: {
    backgroundColor: '#fff',
    // height: 200,
    margin: 10,
    borderRadius: 3
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },
  addButton: {
    
  },
  addButtonText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  uploadAvatar: {
    backgroundColor: '#ccc',
    height: 100,
    width: 100,
    borderRadius: 100,
    overflow: 'hidden'
  },
  avatarContainer: {

  },
  regform: {
    alignSelf: "stretch",
    textAlign: 'center'
  },
  header: {
    //fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottomColor: '#fff',
    borderBottomWidth: 1
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 50,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingLeft: 45,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase'
    //fontFamily: 'Roboto-Bold'
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 12,
    color: '#00A968',
    zIndex: 999
  },
  btnEye: {
    position: 'absolute',
    right: 15,
    top: 8,
  },
  hyperLinkText: {
    color: '#F53D3D',
    // textDecorationLine: 'underline',
    fontWeight: 'bold',
    padding: 3
  },
  errorEmail: {
    fontSize: 12,
    color: 'red',
    marginHorizontal: 20
  }
});
