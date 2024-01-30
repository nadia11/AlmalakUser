import React, {Component} from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, FlatList, ImageBackground, ScrollView, Animated, Platform, Linking } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import axios from 'axios';
import moment from 'moment';
import socketIO from 'socket.io-client';

import { Colors } from '../styles';
import { Options } from '../config';
import { BASE_URL, SOCKET_IO_URL } from '../config/api';
import CustomStatusBar from "../components/CustomStatusBar";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


const defaultMessages = [
  { text: "Hi, I'm at pickup" },
  { text: "I'm here" },
  { text: "Where are you now?" },
  { text: "I'm looking for you" },
  { text: "Be right there" },
]


export default class chatMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatMessage: "",
      chatMessages: [],
      socketId: ''
    };
    this.socket = null;
  }

  componentDidMount() {
    this.socket = socketIO(SOCKET_IO_URL);
    const name = this.props.route.params.name;
    const room = this.props.route.params.room;
    const tripNumber = this.props.route.params.tripNumber;
    // const name = 'Rabiul';
    // const room = 123456789;
    // const tripNumber = 'TRHZKK7G0D0A';

    this.socket.emit("riderSentRequestToJoinTripChat", {name, room, tripNumber});

    this.socket.emit("joinTripChat", {name, room, tripNumber}, (error) => {
      if(error) { alert(error) }
    });

    this.socket.on("tripMessage", msg => {
      console.log("message: "+msg.text, "socketId: "+msg.socketId);
      this.setState({ chatMessages: [...this.state.chatMessages, msg] });
    });
  }

  componentWillUnmount() {
    this.socket.emit("disconect");
    this.socket.close();
  }

  handlePhoneCall = () => {
    let dialPad = '';
    const mobile = this.props.route.params.mobile;

    if (Platform.OS === 'android') { dialPad = 'tel:${'+mobile+'}'; }
    else { dialPad = 'telprompt:${'+mobile+'}'; }
    
    Alert.alert('Phone Call?', 'Do you want to Phone Call to Rider?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Call', onPress: () => Linking.openURL(dialPad)},
    ], { cancelable: true });
  }
  
  disabledCallButton = () => {
    return this.props.route.params.mobile == '' ? 0 : 1;
  }

  submitChatMessage() {
    const name = this.props.route.params.name;
    const room = this.props.route.params.room;
    const tripNumber = this.props.route.params.tripNumber;
    // const name = 'Rabiul';
    // const room = 123456789;
    // const tripNumber = 'TRHZKK7G0D0A';


    this.socket.emit('tripMessage', {room: room, user: name, date:`${new Date()}`, time:`${new Date().getTime()}`, text: this.state.chatMessage, socketId: this.socket.id});
    // this.socket.emit("chat message", {id:1, date:`${new Date().getTime()}`, message: this.state.chatMessage, socketId: this.socket.id});
    this.setState({ chatMessage: "", socketId: this.socket.id });
  }

  renderItem = ({ item, index, separators }) => {
    if(item.socketId == this.state.socketId) {
      return(
        <View key={index} style={styles.myStyle} >
          <Text style={{ fontSize: 14, color: "#fff" }} key={index}> {item.text}</Text>
          <Text style={{ fontSize: 12, color: "#fff" }}>{moment(item.date).format('h:mm A')}</Text>
          <View style={styles.rightArrow}></View>
          <View style={styles.rightArrowOverlap}></View>
        </View>
      )
    } 
    else {
      return(
        <View key={index} style={styles.receiverStyle} >
          <Text style={{ fontSize: 14}} key={index}> {item.text}</Text>
          <Text style={{ fontSize: 12}}>{moment(item.date).format('h:mm A')}</Text>
          <View style={styles.leftArrow}></View>
          <View style={styles.leftArrowOverlap}></View>
        </View>
      )
    }
  }

  render() {
    const photo = this.props.route.params.photo;

    return (
      <View style={styles.container}>
        <CustomStatusBar />
        <View style={styles.header}>
          <Feather name="arrow-left" size={25} color="#000" style={{}} onPress={() => this.props.navigation.goBack()} />

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "center"}}>
            {photo !== "" && <Image style={styles.news_picture} source={{uri: photo, crop: {left: 30, top: 30, width: 50, height: 50}}} /> }
            {photo == "" && <Image style={styles.news_picture} resizeMode="cover" source={require('../assets/avatar.png')} /> }
            <Text style={styles.name}>{this.props.route.params.name}</Text>
          </View>

          <TouchableOpacity onPress={this.handlePhoneCall} style={[styles.callButton, {backgroundColor: Colors.GREEN, opacity: (this.disabledCallButton() == 0 ? 0.7 : 1) }]} disabled={this.disabledCallButton() == 0 ? true : false}>
            <FontAwesome name="phone" size={25} color="#fff" />
          </TouchableOpacity>
        </View>

        <ImageBackground source={require('../assets/images/chat-bg-dark-apps.png')} style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, paddingTop: 10 }}>
          <FlatList
            data={this.state.chatMessages}
            //style={{ marginTop: 10 }}
            renderItem={this.renderItem}
            numColumns={1}
            keyExtractor={(item,index)=>index.toString()}
            //ListHeaderComponent={this.renderHeader}
            //ListHeaderComponentStyle={{color: 'red'}}
            contentContainerStyle={{width: SCREEN_WIDTH-20, margin: 10 }}
            //ListEmptyComponent={this.EmptyList}
            // refreshing={this.state.refreshing}
            // onRefresh={this.handleRefresh}
            // onEndReached={this.handleLoadMore}
            // onEndReachedThreshold={.5}
          />

          <View style={styles.footer}>
            <Animated.ScrollView horizontal scrollEnabled showsHorizontalScrollIndicator={false} snapToInterval={SCREEN_WIDTH} contentContainerStyle={{paddingVertical: 5, marginLeft: 5, marginRight: 10}} >
              {defaultMessages.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => this.setState({ chatMessage: item.text })} style={styles.defaultMessages}>
                  <Text style={{ fontSize: 14, color: "#000" }} key={index}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>

            <View style={styles.footerSendWrap}>
              <TextInput style={styles.inputField} placeholderTextColor="#888" autoCorrect={false} value={this.state.chatMessage} onSubmitEditing={() => this.submitChatMessage()} placeholder="Enter Message" onChangeText={message => { this.setState({ chatMessage: message }); }} />

              <TouchableOpacity onPress={() => this.submitChatMessage()} style={styles.btnSend}>
                  <Text style={styles.btnSendText}><MaterialIcons name='send' size={25} /></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  
  footer:{
    position: 'absolute', 
    bottom: 5, 
    left: 0
  },
  defaultMessages: {
    backgroundColor: '#fff',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 50,
    height:40,
    paddingHorizontal:10,
    padding: 8,
    marginHorizontal: 5
  },
  footerSendWrap: {
    alignItems:'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height:60,
    paddingHorizontal:10,
    padding:5,
  },
  btnSend:{
    borderRadius: 50,
    backgroundColor: "red",
    padding: 12,
    width: 50,
    height: 50,
    marginLeft: 10,
    paddingLeft: 15
  },
  btnSendText:{
    color: "#fff", 
    textAlign: 'center',
    fontSize: 18
},
  inputField: {
    height: 50, 
    paddingLeft: 20,
    width: SCREEN_WIDTH-80, 
    // borderWidth: 2,
    // borderColor: '#aaa',
    backgroundColor: '#fff',
    borderRadius: 100,
    fontSize: 16
  },
  myStyle: {
    marginVertical: 7,
    backgroundColor:"#0078fe",
    borderRadius:20,
    paddingVertical:5,
    paddingHorizontal: 10,
    marginLeft: '29%',
    marginRight: '1%',
    maxWidth: '70%',
    justifyContent: 'flex-end',
  },
  date: {
    alignSelf: 'flex-end',
    margin: 15,
    fontSize:12,
    color:"#808080",
  },
  rightArrow: {
    position: "absolute",
    backgroundColor: "#0078fe",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomLeftRadius: 25,
    right: -7
  },
  rightArrowOverlap: {
    position: "absolute",
    backgroundColor: "#0A2224",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomLeftRadius: 18,
    right: -20
  },
  receiverStyle: {
    marginVertical: 7,
    backgroundColor:"#dedede",
    borderRadius:20,
    paddingVertical:5,
    paddingHorizontal: 10,
    marginRight: '29%',
    marginLeft: '1%',
    maxWidth: '70%',
    alignSelf: 'flex-start'
  },
  leftArrow: {
    position: "absolute",
    backgroundColor: "#dedede",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -7
  },
  leftArrowOverlap: {
      position: "absolute",
      backgroundColor: "#0A2224",
      width: 20,
      height: 35,
      bottom: -6,
      borderBottomRightRadius: 18,
      left: -20
  },
  header: {
    backgroundColor: Colors.HEADER_NAV_COLOR,
    padding: 10, 
    width: SCREEN_WIDTH, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  name: {
    fontWeight: 'bold', 
    color: '#fff', 
    fontSize: 16
  },
  news_picture: {
    height: 40,
    width: 40, 
    resizeMode: 'cover', 
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 10
  },
  callButton: {
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 50
  }
});
