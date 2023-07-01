import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback,ScrollView, Pressable} from 'react-native';
import PropertyCard from './src/components/cards/PropertyCard/PropertyCard';
import cardJson from './src/assets/PropertyCards.json'

// Pre-step, call this before any NFC operations
function App() {
  
  const DisplayData=cardJson.properties.map(
    (info)=>{
        return(
          <PropertyCard 
          name={info.nameInVn!} 
          id={info.idVn!} 
          price={info.price!} 
          backgroundColor={info.colorGroup!} />
        )
    }
)

  return (
    <View style={{height: 500 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{DisplayData}</ScrollView>

    </View>
    
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;