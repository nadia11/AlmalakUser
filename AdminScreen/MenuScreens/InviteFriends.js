import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Share, SafeAreaView } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import axios from 'axios';
import { BASE_URL } from '../../config/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import { Colors, Typography } from '../../styles';

export default function InviteFriends(props) {
  const [invitationCode, setInvitationCode] = React.useState('');
  const [invitationUrl, setInvitationUrl] = React.useState();
  const [shareMessage, setShareMessage] = React.useState("Get 50% off (upto BDT 100) on your first Almalak ride! To accept, signup and use code: "+invitationCode +'\n\n' + "Download now: https://play.google.com/store/apps/details?id=com.almalak.almalakuserapp");

  const getUserData = async () => {
    axios.get(BASE_URL+'/get-invitation-code/'+props.route.params.mobile)
    .then((response) => {
      //console.log(response);
      setInvitationCode( response.data.invitation_code );
      setInvitationUrl( response.data.invitation_url );
    });
  }
  React.useEffect(() => { 
    getUserData();
  }, []);

  const inviteOtherFriends = async () => {
    try {
      const result = await Share.share({
        message: shareMessage,
        url: 'http://almalak.com',
        title: 'Almalak Ride Discount'
      },
      { dialogTitle: 'Almalak Ride Discount' });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          alert("Invitation Code Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        alert("Invitation Code Share cancelled");
      }
    } catch (error) {
      alert(error.message);
    }

    // Share.share({ message: invitationCode })
    // .then(result => console.log(result))
    // .catch(errorMsg => console.log(errorMsg));
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.footerScroll} contentContainerStyle={{flexGrow: 1, paddingBottom: 50, marginTop: 15, justifyContent: 'flex-start', alignItems: 'center'}}>
        <View style={{ backgroundColor: Colors.YELLOW, padding: 10, borderRadius: 100, width: 140, height: 140, marginBottom: 10}}>
          <FontAwesome5 name="users" size={60} color="#333" style={{lineHeight: 120, textAlign: 'center'}} />
        </View>

        <Text style={{fontSize: 30, fontWeight: 'bold'}}>Invite Friends</Text>
        <Text style={{fontSize: 16, marginBottom: 20}}>Invite Friends & get get discount on Ride</Text>
        <Text style={{fontSize: 16, marginBottom: 40, textAlign: 'center'}}>When your friend Sign Up with your Invite Friends code, you can receive upto Tk.500 a day.</Text>

        <Text style={{textTransform: 'uppercase', marginTop: 10, marginBottom: 5 }}>Share Your Invitation Code</Text>
        <Text style={styles.inviteCode}>{invitationCode}</Text>

        <TouchableOpacity style={styles.btnOutline} onPress={() => props.navigation.navigate('InviteFriendsSelectContacts', {invitationCode: invitationCode, invitationUrl: invitationUrl, mobile: props.route.params.mobile, shareMessage: shareMessage})}>
          <Text style={styles.btnOutlineText}>Invite Contact Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={inviteOtherFriends}>
          <Text style={styles.btnText}>Invite Other Friends</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20
  },
  inviteCode: {
    fontSize: 25,
    marginBottom: 30,
    color: "#333",
    borderColor: "#aaa",
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#ddd',
    paddingVertical: 8,
    textAlign: 'center',
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.BUTTON_COLOR,
    marginTop: 15,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  btnText: {
    fontSize: 16,
    color: "#fff", 
    textTransform: 'uppercase',
    //fontFamily: 'Roboto-Bold'
  },
  btnOutline: {
    alignSelf: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
    marginTop: 15,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  btnOutlineText: {
    fontSize: 16,
    color: Colors.BUTTON_COLOR, 
    fontWeight: 'bold',
    textTransform: 'uppercase',
    //fontFamily: 'Roboto-Bold'
  },
  footerScroll: {
    width: SCREEN_WIDTH-0,
    height: SCREEN_HEIGHT,
    paddingHorizontal: 20,
    // paddingVertical: 10,
    // marginBottom: 30,
  }
});