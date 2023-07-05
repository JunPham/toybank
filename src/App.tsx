import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, FlatList, TouchableWithoutFeedback } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import NfcAnimButton from './components/buttons/NfcButton/NfcAnimButton';
import AddButton from './components/buttons/NfcButton/NfcAddButton';
import PropertyCard from './components/cards/PropertyCard/PropertyCard';
import PlayerCard from './components/cards/PlayerCard/PlayerCard';
import NfcHelper from './NfcHelper';
import cardJson from './assets/PropertyCards.json'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { Avatar, Button, Card, Title, Paragraph, TextInput } from 'react-native-paper';

export default function App() {
  const [hasNfc, setHasNfc] = React.useState<boolean | null>(null);
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [tagID, setTagID] = useState<string | undefined>(undefined);
  const [playerList, SetPlayerList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);


  const updateTagID = (tag: string):void => {
    if(tag == tagID) {
      setTagID('Đã scan thẻ này rồi')
    }
    else setTagID(tag)
    console.log(tag)
  }
  const updatePlayerTagID = (tag: string):void => {
    console.log(tag)
  }


  useEffect(()=>{
    async function check() {
      const supported = await NfcManager.isSupported();
      if (supported){
        await NfcManager.start();
        setEnabled(await NfcManager.isEnabled());
      }
      setHasNfc(supported);
      await getData()
    }
    check();

  },[]);


  if (hasNfc == null){
    return null;
  } else if(!hasNfc){
    return(
      <View style={styles.wrapper}>
        <Text>Thiết bị không hỗ trợ NFC</Text>
      </View>
    )
  } else if(!enabled){
    return(
      <View style={styles.wrapper}>
        <Text style={styles.text} >Chưa bật NFC</Text>
        <TouchableOpacity 
          onPress={()=>{
            NfcManager.goToNfcSetting();
          }}
        >
          <Text style={styles.text}>GO TO SETTINGS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={async()=>{
            setEnabled(await NfcManager.isEnabled())
          }}
        >
          <Text style={styles.text}>RECHECK</Text>
        </TouchableOpacity>
      </View>
    )
  }
          {/* <FlatList
            style={{flex:1}}
            horizontal
            nestedScrollEnabled = {true}
            data={cardJson.properties}          
            renderItem={({item}) =>
            <TouchableWithoutFeedback style={{flex:1}} >
                            <PropertyCard 
                  name={item.nameInVn!} 
                  id={item.idVn!} 
                  price={item.price!} 
                  backgroundColor={item.colorGroup!} />

            </TouchableWithoutFeedback>
            }
            keyExtractor={item => item.idVn}
          />       */}

  const query =  ( 
    tagID==undefined ? 
    cardJson.properties.filter((x)=>x?.idVn == 'go') 
    : cardJson.properties.filter((x)=>x?.idVn == tagID)
  )
  const cardData=query.map(
    (info)=>{
      return(
        <View style={{marginHorizontal:30, marginVertical:-30}}>
          <PropertyCard
          key={info.id}
          name={info.nameInVn!} 
          id={info.idVn!} 
          price={info.price!} 
          backgroundColor={info.colorGroup!}
          />
        </View>
      )
    }
  )
  
  const getData = async()=>{
    const dataDocument = await firestore()
        .collection("Players")
        .get()
        .then(querySnapshot=>{
            const data:any=[];
            querySnapshot.forEach(documentSnapshot =>{
                data.push(documentSnapshot.data())
            })
            SetPlayerList(data);
        })
  } 

  const addData = async(player,name)=>{
    const dataDocument = await firestore()
        .collection("Players")
        .add({
            name: name,
            tagID: player,       
        })
        .then(()=>{
            console.log('đã thêm player')                
        })
  }

  const playerData = playerList.map(
    (info)=>{
      return(
        <View style={{marginHorizontal:30, marginVertical:-30,marginTop:-10}}>
          <PlayerCard name={info.name} playerId={info.tagID}></PlayerCard>
        </View>
      )
  })

  return(
    <View>
      <View style={styles.SafeAreaWrapper}>
        <NfcAnimButton updateTagID={updateTagID} height={80} width={100} fail={false}/>
        <View style={styles.UIDsection}>
          <Text style={[styles.sectionLabel]} >
            {tagID || '- - - - - - - - - - - - - - - - - - -'}
          </Text>
          {
            query.length == 1?
            <TouchableOpacity 
              style={{marginLeft:10, }}
              onPress={()=>{
                setTagID(undefined)
              }}
            >
              <Text>
                <FontAwesome name='close' style={{color: 'darkred', fontSize: 30}}/>
              </Text>
            </TouchableOpacity>
            : null
          }
        </View>      
      </View>
      <View style={{marginTop:0}}>
        <ScrollView contentContainerStyle={{height:1000, marginTop:0}}>
          {cardData}
          {playerData}
          <View style={[styles.cardWrapper,{flexDirection:'row', backgroundColor:'lightgreen', borderRadius:15}]}>
            <TextInput label={'đặt tên'} style={{height:60, width:100, marginLeft:10 , borderRadius:10, backgroundColor:'transparent', fontSize:20}}></TextInput>
            <AddButton updateTagID={updatePlayerTagID}></AddButton>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: '#f00f',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  UIDsection: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 30,
    marginRight: 40,
    height:40,
    flexDirection: 'row',
  },
  sectionLabel: {
    fontSize: 16,
    color: 'gray',
    marginLeft:10
  },
  SafeAreaWrapper: {
    marginTop:25,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  IDmarginLeft:{
    marginLeft:90,
    marginRight:10
  },
  ScrollView: {
    backgroundColor: 'white',
    marginHorizontal:15,
    borderRadius:8,
  },
  cardWrapper: {
    height:60,
    width:170,
    marginHorizontal:30,
    marginTop: 35,
    alignSelf:'center'
  },
});


