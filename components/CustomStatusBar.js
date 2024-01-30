import React, { Component, useState } from 'react';
import { StatusBar } from 'react-native';

export default function CustomStatusBar(props) {
  const [isConnected, setIsConnected] = useState(true);

    return (
      <StatusBar 
      animated={true}
      backgroundColor={props.backgroundColor ? props.backgroundColor : (isConnected ? "#399046" : 'red')}
      barStyle={props.barStyle ? props.barStyle : (isConnected ? "light-content" : "dark-content")}
      showHideTransition="fade" //'fade', 'slide', 'none'
      hidden={false} 
      translucent={false} 
      networkActivityIndicatorVisible={true} 
      />
    )
}


{ /*<View style={styles.statusBar} />*/ }

// const styles = StyleSheet.create({
//     statusBar: {
//       backgroundColor: "#399046",
//       height: Constants.statusBarHeight,
//     }
// })