import React, { Component } from 'react';
import { Text, View, Linking, Platform, StyleSheet, Alert, Dimensions, Pressable, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import VersionCheck from 'react-native-version-check'
import Modal from 'react-native-modal';
import moment from 'moment';

import { Colors } from '../styles';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CheckAppUpdate(props) {
    const packageName = VersionCheck.getPackageName();
    const CurrentBuildNumber = VersionCheck.getCurrentBuildNumber();
    const currentVersion = VersionCheck.getCurrentVersion();
    const [latestVersionFromStore, setLatestVersionFromStore] = React.useState();
    const [country, setCountry] = React.useState();
    const [appUrl, setAppUrl] = React.useState();
    const [openModal, setOpenModal] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);
    const [nextTime, setNextTime] = React.useState(null);

    React.useEffect(() => {
      getDataFromStorage();
    }, [nextTime]);

    const getDataFromStorage = async () => {
      try {
          await AsyncStorage.getItem('nextUpdateTime').then(value => {
            setNextTime(value ? value : null);
            needUpdate();
          });
      } 
      catch (error) { console.error(error); }
    }

    VersionCheck.getLatestVersion({
        provider: Platform.select({ ios: 'appStore', android: 'playStore'}) 
    })
    .then(latestVersion => {
        setLatestVersionFromStore(latestVersion);
    });

    VersionCheck.getCountry().then(country => setCountry(country));

    VersionCheck.getStoreUrl({ appID: packageName }).then(res => {
      setAppUrl(res);
    });
    
    const needUpdate = () => {
      VersionCheck.needUpdate({
        depth: 1,
        currentVersion: currentVersion,
        latestVersion: latestVersionFromStore,
        forceUpdate: true,
        // provider: () => fetch('http://your.own/api')
        // .then(r => r.json())
        // .then(({version}) => version),
      })
      .then(async res => {
        var minutesPassed = moment().diff(nextTime, 'minutes');
        if (res.isNeeded) {
          if(nextTime === null) {
            setOpenModal(true);
          } else if(minutesPassed>1) {
            setOpenModal(true);
          }
        }
        //res.currentVersion, res.isNeeded, res.storeUrl, res.latestVersion
      });
    }

    const dismissButton = async () => {
      setOpenModal(false);
      let time = moment().add(5, 'hour').format("YYYY-MM-DD HH:mm:ss");
      await AsyncStorage.setItem('nextUpdateTime', time);
      setNextTime(time);
    }

    const handleUpdate = () => {
      Linking.canOpenURL(appUrl).then(supported => {
        if (supported) {
          return Linking.openURL(appUrl);
        } else {
          return Linking.openURL("https://play.google.com/store/apps/details?id="+ packageName);
        }
      });
    }

    return (
      <Modal isVisible={openModal} animationType='slide' backdropColor="#000" backdropOpacity={0.7} style={styles.bottomModal} onBackButtonPress={() => setOpenModal(false)} onBackdropPress={() => setOpenModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ backgroundColor: '#fff', height: 300, borderRadius: 5 }}>
            <Text style={styles.title}>New Version Available</Text>
            <Text style={styles.text}>A new version (Version: {latestVersionFromStore}) is available. Please update app to new version to be upto-date.</Text>
            <Text style={styles.text}>Would you like to update is now.</Text>

            <View style={styles.buttonWrap}>
              <Pressable onPress={dismissButton} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Later</Text>
              </Pressable>

              <Pressable onPress={handleUpdate} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Update Now</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
}

const styles = StyleSheet.create({
    text: {
      paddingHorizontal: 30, 
      paddingBottom: 20, 
      fontSize: 16
    },
    bottomModal: {
      justifyContent: 'center',
      margin: 10
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingVertical: 10,
      color: '#333'
    },
    buttonWrap: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: SCREEN_WIDTH-20,
      paddingRight: 15,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    confirmButton: {
      alignSelf: "center",
      borderRadius: 3,
      padding: 10,
      marginBottom: 15,
  
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    },
    confirmButtonText : {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.BUTTON_COLOR, 
      textAlign: 'center',
      textTransform: 'uppercase'
    },
});