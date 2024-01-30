import React from 'react';
import { Text, View, StyleSheet, Dimensions } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DeviceInfo from 'react-native-device-info';
import * as Animatable from 'react-native-animatable';
import axios from "axios";

const {height, width} = Dimensions.get('window');

export default function BatteryLowMessage(props)
{
	const [batteryChargeLevel, setBatteryChargeLevel] = React.useState(false);
	const [batteryPercent, setBatteryPercent] = React.useState(0);

	React.useEffect(() => { 
		batteryLevel();

		return () => batteryLevel();
	}, [batteryPercent]);

	const batteryLevel = () => {
		DeviceInfo.getBatteryLevel().then((percent) => {
			let level = Math.ceil(percent*100);

			if(level < 20) { 
				setBatteryChargeLevel('low'); 
				setBatteryPercent(level); 
			}
			else {
				setBatteryChargeLevel(false); 
			}
			//console.log('Battery Level: '+level+"%");
		});
	}

	if(batteryChargeLevel === false) return null;
  
    return (
		<Animatable.View animation="slideInDown" iterationCount={1} delay={0} useNativeDriver={true} style={styles.container}>
			<MaterialCommunityIcons name="battery-low" size={30} style={styles.icon} />
			<View>
				<Text style={{color: '#333', fontSize: 20, fontWeight: 'bold'}}>Phone Battery low</Text>
				<Text style={{color: '#333', fontSize: 18}}>{batteryPercent + "%"} of battery remain.</Text>
				<Text style={{color: '#333'}}>Charge your phone to keep using Driver App.</Text>
			</View>
		</Animatable.View>
    );
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute', 
		top: 60, 
		left: 0, 
		zIndex: 9999, 
		backgroundColor: '#fea5a5',
		paddingHorizontal: 10, 
		height: 90, 
		width: width, 
		flexDirection: 'row', 
		justifyContent: 'flex-start', 
		alignItems: 'center'
	},
	icon: {
		color:"#fea5a5", 
		backgroundColor: 'white', 
		padding: 12, 
		marginRight: 15, 
		borderRadius: 50
	}
	
});
