import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, ActivityIndicator, Button } from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from "react-native-vector-icons/Feather";
import PushNotification from 'react-native-push-notification';

import { Colors } from '../styles';
import { Options } from '../config';
import NoRecordIcon from '../components/noRecords';
import NotificationDetails from './NotificationDetails';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const NotificationStack = createNativeStackNavigator();
export default function NotificationStackScreen() {
  return (
    <NotificationStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <NotificationStack.Screen name="Notification" component={NotificationList} options={{headerShown: false, title: 'Notification', headerLeft: props => <MapNavLink {...props} /> }} />
      <NotificationStack.Screen name="NotificationDetails" component={NotificationDetails} options={{ title: 'Notification Details', headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </NotificationStack.Navigator>
  );
}

const MapNavLink = (props) => <FontAwesome5 name="map-marked-alt" size={30} color="#000" style={{marginLeft: 10}} onPress={() => props.navigation.navigate('DriverMapScreen')} />

function NotificationList(props) {
	const [notificationData, setNotificationData] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [refreshing, setRefreshing] = React.useState(false);

	React.useEffect(() => {
		PushNotification.getDeliveredNotifications(function(callback) {
			setNotificationData(callback);
			setLoading(false);
			setRefreshing(false);
		});
	}, []);

	const makeRemoteRequest = () => {		
		setLoading(true);
		setRefreshing(true);
		PushNotification.getDeliveredNotifications(function(callback) {
			setNotificationData(callback);
			setLoading(false);
			setRefreshing(false);
		});
	};
	
	const handleRefresh = () => {
		makeRemoteRequest();
	};

	const renderSeparator = () => {
		return <View style={{height: 1, width: "85%", backgroundColor: "#eee", marginLeft: "15%" }} />
	};
	
	const renderFooter = () => {
		if (!loading) return null;
		
		return (
			<View style={{paddingVertical: 20}} >
				<ActivityIndicator animating size="large" color='#f00' />
			</View>
		);
	};
	
	const renderItem = ({ item, index, separators }) => (
		<View key={item.identifier}>
			<TouchableOpacity style={styles.notItem} onPress={() => {
			  props.navigation.navigate('NotificationDetails', {
				title: item.title,
				body: item.body,
				date: item.tag
			  })}}>
				<Ionicons name="megaphone-outline" color="#fff" size={20} style={{backgroundColor: 'red', padding: 7, borderRadius: 50, marginRight: 10}} />
			
				<View>
					<View style={{flexDirection: 'row', width: SCREEN_WIDTH-80, justifyContent: 'space-between', alignItems: 'center'}}>
						<Text style={[styles.not_title, {width: (SCREEN_WIDTH/2)-15}]} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
						<Text style={styles.not_date}>{item.tag}</Text>
					</View>
					<Text style={[styles.description, {width: SCREEN_WIDTH-100}]} numberOfLines={2} ellipsizeMode="tail">{item.body}</Text>
				</View>
			</TouchableOpacity>
		</View>
	)

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			{/* <View style={styles.header}>
				<TouchableOpacity onPress={() => props.navigation.navigate('DriverMapScreen')}>
					<Feather name="map" size={30} style={{ color:"#fff" }} />
				</TouchableOpacity>
				
				<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
					<Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>Notifications</Text>
				</View>
				{Options.APP_OPTIONS.HEADER_LOGO}
			</View>		 */}

			<SafeAreaView style={styles.container}>
				{(notificationData.length == 0) && (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<NoRecordIcon title="Notifications" reloadFunction={() => makeRemoteRequest()} spinner={loading} />
					</View>
				)}

				{(notificationData.length > 0) && (
					<FlatList
					data={notificationData}
					style={{ marginTop: 40 }}
					renderItem={renderItem}
					numColumns={1}
					keyExtractor={item => item.identifier.toString()}
					ItemSeparatorComponent={renderSeparator}
					ListFooterComponent={renderFooter}
					ListFooterComponentStyle={{color: 'red'}}
					// contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					/>
				)}
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		top: 0,
		left: 0,
    	position: 'absolute',
		zIndex: 9999,
		backgroundColor: Colors.HEADER_NAV_COLOR,
		flexDirection: 'row',
		justifyContent: 'center', 
		alignItems: 'center',
		paddingHorizontal: 10,
		height: 50,
		width: SCREEN_WIDTH,
		textAlign: 'center'
	},
	headerText:{
		color:"#fff",
		fontSize:14
	},
	container: {
		flex: 1,
		backgroundColor: '#f1f1f1',
		justifyContent: 'flex-start',
		width: SCREEN_WIDTH,
		borderTopColor: '#ddd',
		borderTopWidth: 1,
		paddingVertical: 10
	  },
	  notItem: {
		width: SCREEN_WIDTH-20,
		marginLeft: 10,
		backgroundColor: '#fff', 
		paddingHorizontal: 10,
		paddingVertical: 10,
		elevation: 3,
		shadowColor: '#eee', 
		shadowOpacity: 0.5,
		shadowOffset: { height: 0, width: 0},
		shadowRadius: 25, 
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginTop: 10,
		borderRadius: 5
	  },
	  headerBg: {
		backgroundColor: '#fff', 
		padding: 10,
		elevation: 2,
		shadowColor: '#2AC062',
		shadowOpacity: 0.5,
		shadowOffset: { height: 0, width: 0},
		shadowRadius: 25,
		marginBottom: 10,
		flexDirection: 'row',
		justifyContent: 'space-between'
	  },
	  not_date: {
		paddingBottom: 10,
		fontSize: 12,
		color: '#333'
	  },
	  not_title: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
		textTransform: 'uppercase',
		alignItems: 'baseline',
		marginVertical: 5
	  },
	  description: {
		color: Colors.TEXT_PRIMARY, 
		textAlign: 'justify'
	  },
});
