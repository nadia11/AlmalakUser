import React, { Component } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
const {height, width} = Dimensions.get('window');

export default class ActivityIndicatorLoading extends Component {
   state = { animating: true }
   
   closeActivityIndicator = () => setTimeout(() => this.setState({
   animating: false }), 60000)
   
   componentDidMount = () => this.closeActivityIndicator();

   render() {
      const animating = this.state.animating
      return (
         <View style={styles.container}>
          <View style={styles.activityIndicator}>
            <ActivityIndicator animating={animating} color='#EF0C14' size="large" />
            <Text style={styles.loadingText}>Loading, please wait...</Text>
            </View>
         </View>
      )
   }
}

const styles = StyleSheet.create ({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0,
      backgroundColor: 'rgba(0,0,0,0.5)'
   },
   activityIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 80,
      width: width - 30,
      backgroundColor: "#fff",
      borderRadius: 5,
      elevation: 7,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 0},
      shadowRadius: 10,
      shadowOpacity: 0.5
   },
   loadingText: {
     paddingHorizontal: 15,
     fontSize: 20
   }
});