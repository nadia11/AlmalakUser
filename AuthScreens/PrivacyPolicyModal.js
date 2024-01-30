import React, { Component } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, ToastAndroid } from 'react-native';
const { width, height } = Dimensions.get('window');

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
};

export default function TermsModalScreen({ navigation }) {
  const [accepted, setAccepted] = React.useState(false);

  const acceptHandler = () => {
    ToastAndroid.showWithGravity("Privacy Policy accepted.", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    navigation.goBack();
  }

  const scrollEvent = ({nativeEvent}) => {
    if (isCloseToBottom(nativeEvent)) {
      setAccepted(true)
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <ScrollView style={styles.tcContainer} onScroll={scrollEvent}>
        <Text style={styles.tcP}>Failure to abide by Uder’s Terms of Service or other policies can result in temporary or permanent deactivation from the Uder platform.</Text>
        <Text style={styles.tcP}>To ensure a safe and respectful ride, do not:</Text>
        <Text style={styles.tcL}>{'\u2022'} Violate Uder’s weapons policy by bringing a weapon along on a Uder ride or on Uder property.</Text>
        <Text style={styles.tcL}>{'\u2022'} Violate Uder’s age requirement, which prohibits anyone under the age of 18 from riding without an adult.</Text>
        <Text style={styles.tcL}>{'\u2022'} Transport a child without a safety seat appropriate for the child’s weight.</Text>
        <Text style={styles.tcL}>{'\u2022'} Request rides for groups that cannot fit in the specified ride type.</Text>
        <Text style={styles.tcL}>{'\u2022'} Violate road safety laws including local scooter and bike laws.</Text>
        <Text style={styles.tcL}>{'\u2022'} Pay your fare in cash (cash tips are OK).</Text>
        <Text style={styles.tcL}>{'\u2022'} Discriminate against another member of the community on the basis of race, color, religion, national origin, disability, sexual orientation, sex, marital status, gender identity, age, military status, or any other characteristic protected under law.</Text>
        <Text style={styles.tcL}>{'\u2022'} Touch drivers or other riders without their explicit consent.</Text>
        <Text style={styles.tcL}>{'\u2022'} Use abusive, discriminatory, sexual, or inappropriate language, behavior, or gestures.</Text>
        <Text style={styles.tcL}>{'\u2022'} Smoke, vape, or consume alcohol during your ride.</Text>
        <Text style={styles.tcL}>{'\u2022'} Damage drivers’ or other riders’ property.</Text>
        <Text style={styles.tcL}>{'\u2022'} Engage in fraudulent behavior, including but not limited to: using a stolen phone or credit card to request a ride, coupon phishing, or manipulating reviews for ride credit.</Text>
        <Text style={styles.tcL}>{'\u2022'} Broadcast or record in violation of state or local laws or Uder’s recording device policy.</Text>
      </ScrollView>

      <TouchableOpacity disabled={ !accepted } onPress={ acceptHandler } style={ accepted ? styles.button : styles.buttonDisabled }><Text style={styles.buttonLabel}>Accept</Text></TouchableOpacity>
    </View>
  );
}

const styles = {
  container:{
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10
  },
  title: {
    fontSize: 22,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  tcP: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: "justify",
  },
  tcL:{
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: "justify"
  },
  tcContainer: {
    marginTop: 15,
    marginBottom: 15,
    height: height * .78
  },
  button:{
    backgroundColor: '#136AC7',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20
  },
  buttonDisabled:{
    backgroundColor: '#999',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20
 },
  buttonLabel:{
    fontSize: 14,
    color: '#FFF',
    alignSelf: 'center'
  }
}