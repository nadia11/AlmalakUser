import React from 'react';
import { Colors } from '../styles';
import { View, Text, StyleSheet, Image} from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const APP_OPTIONS = {
    SCREEN_OPTIONS: {
		gestureEnabled: false, 
        headerTransparent:false,
        //headerLeft: true,
        headerStyle: { backgroundColor: Colors.HEADER_NAV_COLOR, height: 50 },
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'normal' },
        headerTintColor: '#fff',
        headerBackTitleVisible: false
    },
    HEADER_LOGO: (<Image style={{ width: 45, height: 45, marginRight: 15, resizeMode: "contain" }} source={require('../assets/logo.png')} />),
    VersionCode: DeviceInfo.getVersion(),
    AppName: "Almalak",
    NETWORK_ERROR_MESSAGE: "Something went wrong. Please try again.",
}




// import { Platform, Dimensions } from 'react-native';

// const window = Dimensions.get('window');
// const DeviceInfo = {
//     deviceWidth: window.width,
//     deviceHeight: window.height,
//     deviceFontScale: window.fontScale,
//     deviceOS: Platform.OS,
//     deviceAspect_Ratio: window.width / window.height,
// };

// export default DeviceInfo;