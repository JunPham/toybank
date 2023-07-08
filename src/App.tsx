import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, FlatList, TouchableWithoutFeedback } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import NfcAnimButton from './components/buttons/NfcButton/NfcAnimButton';
import PropertyCard from './components/cards/PropertyCard/PropertyCard';
import ChanceCard from './components/cards/DrawCard/ChanceCard';
import cardJson from './assets/PropertyCards.json'
import chanceCardJson from './assets/DrawCards.json'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { Avatar, Button, Card, Title, Paragraph, TextInput } from 'react-native-paper';
import AnimateNumber from 'react-native-animate-number'

export default function App() {
  const [hasNfc, setHasNfc] = React.useState<boolean | null>(null);
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [tagID, setTagID] = useState<string | undefined>(undefined);
  const [playerList, SetPlayerList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
  const [transactionList, SetTransactionList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
  const [text, onChangeText] = React.useState('');
  const [recordCount, setRecordCount] = useState(0);
  // const [cancelScan, setCancelScan] = useState(true)

  const updateTagID = (tag: string):void => {
    if(tag == tagID) {
      setTagID('Đã scan thẻ này rồi')
    }
    else setTagID(tag)
    getData()
    getTransactionList()
    console.log(tag)
  }


  const updateRecordCount = (count: number):void => {
    setRecordCount(count)
    console.log('records:'+recordCount)
  }

  const updateAllRecordCount = ():void => {
    // setAllRecordCount(count)
    getTransactionList()
    getData()
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
      await getTransactionList()
    }
    check();
    console.log('spam')
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
          playerList={playerList}
          updateRecordCount={updateRecordCount}
          updateAllRecordCount={updateAllRecordCount}
          />
        </View>
      )
    }
  )

  const queryChanceCard = chanceCardJson.chance.filter((x)=>x?.tagid == tagID)
  const ChanceCardData=queryChanceCard.map(
    (info)=>{
      return(
        <View style={{marginHorizontal:30, marginVertical:30,}}>
          <ChanceCard
          key={info.tagid}
          id={info.tagid!} 
          playerList={playerList}
          updateAllRecordCount={updateAllRecordCount}
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

  const getTransactionList = async()=>{
    const dataDocument = await firestore()
        .collection("TransactionRecord")
        .get()
        .then(querySnapshot=>{
            const data:any=[];
            querySnapshot.forEach(documentSnapshot =>{
                data.push(documentSnapshot.data())
            })
            SetTransactionList(data);
        })
}

  const addPlayer = async(playerTag,playerName)=>{
    const dataDocument = await firestore()
        .collection("Players")
        .add({
            name: playerName,
            tagID: playerTag,       
        })
        .then(()=>{
            console.log('đã thêm player')                
        })
  }

  const deletePlayer = async(playerTag)=>{
    // Get all users
    await firestore()
      .collection('Players')
      .where('tagID','==',playerTag)
      .get()
      .then(querySnapshot =>{
        querySnapshot.docs[0].ref.delete()
      })
  }

  const playerData = playerList.map(
    (info)=>{
      const playerRecords = transactionList.filter((x)=>x.playerID==info.tagID)
      const sumValue = playerRecords.reduce((prev,current)=>prev+current.value,0)
      const latestValue = playerRecords.reduce((prev,current)=>prev.timeStamp>current.timeStamp?prev:current,Date.now).value
      var styleProps = {
        style: latestValue>0 ? styles.numberPositiveStyle: styles.numberNegativeStyle
      };
      return(
        <View style={{marginHorizontal:30, marginVertical:0,marginTop:3, flexDirection:'row'}}>
           <Card style={styles.playerCardWrapper} >
                <Card.Content style={{flexDirection:'row'}}>
                  <Title style={{backgroundColor:'transparent', marginTop:-5}}>{info.name}: </Title>
                  <AnimateNumber {...styleProps}
                  value={sumValue} 
                  interval={0.3}
                  countBy={1}
                  formatter={(val: number) => {
                    return '$ ' + (val).toFixed(0)
                  }}
                  onProgress= {() =>{}}
                  />
                </Card.Content>
            </Card>
          {
            recordCount>0?null:
            <TouchableOpacity onPress={()=>{deletePlayer(info.tagID); getData()}}>
              <View style={{marginTop:10, marginLeft:10, backgroundColor:'white', borderRadius:30, width:30}}>
                <FontAwesome name='close' style={{color: 'darkred', fontSize: 30, marginLeft: 3}}/>
              </View>
            </TouchableOpacity>
          }
        </View>
      )
  })


  return(
    <View>
      <View style={{marginTop:0}}>
        <ScrollView contentContainerStyle={{height:900, marginTop:0, flexGrow: 1}}>
          {query.length>0?cardData:null}
          {queryChanceCard.length>0?ChanceCardData:null}
          {playerData}
        </ScrollView>
      </View>
      <View style={styles.footerTagStyle}>
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
    marginTop: 4,
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
    height:50,
    width:170,
    marginHorizontal:30,
    marginTop: 35,
    alignSelf:'stretch'
  },
  textInput: {
    height:50, 
    width:170, 
    marginLeft:0 , 
    borderRadius:0, 
    backgroundColor:'white', 
    fontSize:17,
    borderColor:'lightgreen',
    borderWidth:2
  },
  playerCardWrapper: {
    backgroundColor: 'ghostwhite',
    height:50,
    width:260,               
},
  numberPositiveStyle: {
    color: 'green',
    fontSize:18, 
    marginTop: -1
  },
  numberNegativeStyle: {
    color: 'darkred',
    fontSize:18, 
    marginTop: -1
  },
  footerTagStyle: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    height:50,
    backgroundColor:'gray'
  },
});


