import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Alert, ActivityIndicator, LayoutAnimation, ToastAndroid, UIManager, Platform } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Modal from 'react-native-modal';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import PromoCodeModal from '../../GoogleMaps/PromoCodeModal';
import { BASE_URL } from '../../config/api';
import { Colors } from '../../styles';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PaymentMethodsModal(props) {
  const [scheduleModal, setScheduleModal] =  React.useState(false);
  const [paymentType, setPaymentType] = React.useState('cashPayment');
  const [paymentName, setPaymentName] = React.useState('Cash Payment');
  const [animating, setAnimating] = React.useState(true);
  const [totalRecord, setTotalRecord] = React.useState();
  const [cardData, setCardData] = React.useState([]);
  const mobile = props.riderMobile;

  const setModalScheduleVisible = () => {
    setScheduleModal(!setScheduleModal);
  }

  const getCardData = async () => {
    setAnimating( true );

    axios.get(BASE_URL+`/get-credit-card-list/${mobile}`)
    .then((response) => {
      if(response.data.code === 200){
        setCardData(response.data.message);
        setTotalRecord(response.data.total_record);
        setAnimating(false);
      }
    })
    .catch((error) => {
      setAnimating( false );
      setTotalRecord(0);
      console.log(error.message);
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
    });
  }

  const paymentTypeFromStorage = async () => {
    try {
      const paymentTypeAsync = await AsyncStorage.getItem('paymentType');
      if(paymentTypeAsync !== null) { setPaymentType(paymentTypeAsync) }

      const paymentNameStorage = await AsyncStorage.getItem('paymentName');
      if(paymentNameStorage !== null) { setPaymentName(paymentNameStorage) }
    } catch (error) { console.error(error); }
  }


  React.useEffect(() => { 
    getCardData();
    paymentTypeFromStorage();
  }, []);

  const selectPaymentType = async (type, name) => {
    setPaymentType(type);
    setPaymentName(name);
    props.paymentMethod(type);
    try {
      await AsyncStorage.setItem('paymentType', type);
      ToastAndroid.show('Payment Methods Successfully.', ToastAndroid.SHORT);
    } 
    catch (error) { console.error(error); }
    setScheduleModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap'}}>
        <TouchableOpacity onPress={() => setScheduleModal(true)} style={styles.paymentMethodButton}>
          <FontAwesome size={25} name="money" color="green" />
          <Text style={styles.paymentButtonText} numberOfLines={1}> {paymentName} </Text>
          <FontAwesome size={12} name="chevron-right" color="#aaa" />
        </TouchableOpacity>
        
        <PromoCodeModal promoCode={(code) => props.promoCode(code)} />
      </View>

      <Modal isVisible={scheduleModal} animationType='slide' backdropColor="white" backdropOpacity={1} onBackButtonPress={() => setScheduleModal(false)} style={styles.bottomModal}>
        <ScrollView style={styles.footerScroll} contentContainerStyle={{flexGrow: 1, paddingBottom: 100, backgroundColor: '#fff', justifyContent: 'center'}}>
          <TouchableOpacity style={[styles.vehicleListItem, (paymentType === "cashPayment" ? styles.vehicleListItemActive : "")]} onPress={() => {selectPaymentType('cashPayment', 'Cash Payment'); }}>
              <FontAwesome style={styles.vehicleIcon} size={30} name="money" color={Colors.ICON_COLOR} />
              <View>
                <Text style={styles.title}>Cash Payment</Text>
                <Text style={styles.subTitle}>Default Method</Text>
              </View>
              {paymentType === "cashPayment" ? (<Feather name="check-square" size={30} color={Colors.PRIMARY} style={styles.rightIcon} />) : null}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.vehicleListItem, (paymentType === "walletPayment" ? styles.vehicleListItemActive : "")]} onPress={() => {selectPaymentType('walletPayment', 'Wallet Payment'); }}>
              <FontAwesome5 style={styles.vehicleIcon} size={30} name="wallet" color={Colors.ICON_COLOR} />
              <View>
                <Text style={styles.title}>Wallet Payment</Text>
                <Text style={styles.subTitle}>Current Credit: 0.00</Text>
              </View>
              {paymentType === "walletPayment" ? (<Feather name="check-square" size={30} color={Colors.PRIMARY} style={styles.rightIcon} />) : null}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.vehicleListItem, (paymentType === "bankTransfer" ? styles.vehicleListItemActive : "")]} onPress={() => {selectPaymentType('bankTransfer', 'Bank Transfer'); }}>
              <FontAwesome style={styles.vehicleIcon} size={30} name="bank" color={Colors.ICON_COLOR} />
              <Text style={styles.title}>Bank Transfer</Text>
              {paymentType === "bankTransfer" ? (<Feather name="check-square" size={30} color={Colors.PRIMARY} style={styles.rightIcon} />) : null}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.vehicleListItem, (paymentType === "Paypal" ? styles.vehicleListItemActive : "")]} onPress={() => {selectPaymentType('Paypal', 'Paypal'); }}>
              <FontAwesome style={styles.vehicleIcon} size={30} name="paypal" color={Colors.ICON_COLOR} />
              <View>
                <Text style={styles.title}>Paypal</Text>
                <Text style={styles.subTitle}>info@almalak.com</Text>
              </View>
              {paymentType === "Paypal" ? (<Feather name="check-square" size={30} color={Colors.PRIMARY} style={styles.rightIcon} />) : null}
          </TouchableOpacity>

          <Text style={{marginBottom: 10, fontSize: 20, fontWeight: 'bold', marginTop: 20, textAlign: 'center'}}>Credit/Debit Cards</Text>

          {totalRecord === 0 && (<Text style={{textAlign: 'center', fontSize: 16}}>No Payment Methods found. Add New Card to use for Ride Payments.</Text>)}
          {animating && (<ActivityIndicator animating={animating} color='red' size="large" />)}

          {cardData.map((obj, index) => {
            return (
              <TouchableOpacity style={[styles.vehicleListItem, (obj.card_number === paymentType ? styles.vehicleListItemActive : "")]} key={obj.credit_card_id} activeOpacity={0.5} onPress={() => {selectPaymentType(obj.card_number, obj.card_type); }}>
                  <FontAwesome style={styles.vehicleIcon} size={30} name={obj.icon} color={Colors.ICON_COLOR} />
                  <View>
                    <Text style={styles.subTitle}>{obj.card_holder_name.toLocaleUpperCase()}</Text>
                    <Text style={styles.cardExpire}>{obj.expires_at}</Text>
                    <Text style={styles.title}>{obj.card_number}</Text>
                  </View>
                  {paymentType === obj.card_number ? (<Feather name="check-square" size={30} color={Colors.PRIMARY} style={styles.rightIcon} />) : null}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingVertical: 10
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: ((SCREEN_WIDTH)/2),
    padding: 5,
    paddingLeft: 15,
    paddingRight: 30,
  },
  paymentButtonText : {
    fontSize: 16,
    color: "#333"
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
  bottomModal: {
    justifyContent: 'flex-start',
    margin: 0,
    height: 300
  },
  schedulePickupItem: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 20
  },
  footerScroll: {
    width: SCREEN_WIDTH-0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 30,
    
    // elevation: 1,
    // shadowColor: '#2AC062',
    // shadowOpacity: 0.5,
    // shadowOffset: { height: 10, width: 0},
    // shadowRadius: 25
  },
  vehicleListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 5,
    height: 70,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  vehicleListItemActive: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    letterSpacing: 1.75
  },
  cardExpire: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontWeight: 'bold',
    color:Colors.TEXT_PRIMARY
  },
  subTitle: {
    fontSize: 15,
    color: '#666'
  },
  vehicleIcon: {
    marginRight: 10
  },
  rightIcon: {
    position: 'absolute',
    right: 15,
    top: 18
  },
});
