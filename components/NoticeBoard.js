import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Noticeboard(props) {
    return (
      <View style={[styles.sectionContainer, {borderBottomColor: props.color, borderTopColor: props.color}]}>
        <Text style={{fontSize: 22, textAlign: "justify", marginBottom: 10}}>
          <Text style={{fontWeight: 'bold', color: 'red'}}>Al Malak</Text>-এর সকল লভ্যাংশ করোনা দুর্যোগ মোকাবেলায় সরকারি তহবিলে অনুদান হিসেবে প্রদান করা হবে।
        </Text>
        <Text style={{fontSize: 22, textAlign: "justify", fontWeight: 'bold'}}>
          আসুন সবাই সবার পাশে দাড়াই।
        </Text>
      </View>
    )
}

const styles = StyleSheet.create({
  container:{
    flex: 1
  },
  sectionContainer: {
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 10,
    marginTop: 15,
    backgroundColor: 'mintcream',
    borderBottomWidth: 3,
    borderBottomColor: 'red',
    borderTopWidth: 3,
    borderTopColor: 'red'
  }
});








// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// export default function Noticeboard(props) {
//     return (
//       <View style={[styles.sectionContainer, {borderColor: props.color, borderColor: props.color}]}>
//         <Text style={{fontSize: 22, textAlign: "justify", marginBottom: 10}}><Text style={{fontWeight: 'bold', color: 'red'}}>এসোযাই লিঃ</Text>-এর সকল লভ্যাংশ করোনা দুর্যোগ মোকাবেলায় সরকারি তহবিলে অনুদান হিসেবে প্রদান করা হবে।</Text>
//         <Text style={{fontSize: 22, textAlign: "justify", fontWeight: 'bold'}}>আসুন সবাই সবার পাশে দাড়াই।</Text>
//       </View>
//     )
// }

// const styles = StyleSheet.create({
//   container:{
//     flex: 1
//   },
//   sectionContainer: {
//     backgroundColor: '#fff',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     padding: 10,
//     margin: 15,
//     marginTop: 15,
//     backgroundColor: 'mintcream',
//     borderWidth: 2,
//     borderColor: 'red',
//     borderRadius: 5
//   }
// });

