import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TouchableWithoutFeedback, TextInput, Alert, Keyboard } from "react-native";
import { Colors } from '../styles';
import Modal from 'react-native-modal';
import Feather from "react-native-vector-icons/Feather";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PromoCodeModal(props) {
  const [promoModal, setPromoModal] =  React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');

  const setPromoModalVisible = () => {
    setPromoModal(!setPromoModal);
  }

  return (
    <View>
      <TouchableOpacity onPress={() => setPromoModal(true)} style={styles.promoButton}>
        <Text style={{fontSize: 16}}> Promo</Text>
      </TouchableOpacity>

      <Modal isVisible={promoModal} animationType='slide' backdropColor="#000" backdropOpacity={0.3} style={styles.bottomModal} onBackButtonPress={() => setPromoModal(false)}   onBackdropPress={() => setPromoModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ backgroundColor: '#fff', height: 370 }}>
            <Text style={styles.title}>Add Promo Code</Text>
            <Text style={{paddingHorizontal: 30, paddingBottom: 20, fontSize: 16}}>Please note that only one promo code can be applied per ride.</Text>

            <TextInput style={styles.textinput} placeholder="Promo Code" placeholderTextColor="rgba(0,0,0,.5)" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setPromoCode( val )} value={promoCode} />

            <TouchableOpacity onPress={() => {setPromoModal(false); props.promoCode(promoCode)}} style={styles.addButton}>
              <Text style={styles.addButtonText}> Apply Promo Code</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  promoButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 3
  },
  textinput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 45,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: '#fff',
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingLeft: 20,
    marginBottom: 40,
    marginLeft: 30,
    width: (SCREEN_WIDTH - 60)
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-60,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
});
