import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';

export default function faqScreen({ route }) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Faq & Questions</Text>
        <Text>
          {route?.params?.owner ? `${route.params.owner}'s Feed` : ''}
        </Text>
      </View>
    );
  }