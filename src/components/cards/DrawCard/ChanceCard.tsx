import React, {useState, useRef, useEffect}  from "react";
import { Text ,View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Avatar, Button, Card, Title, TextInput } from 'react-native-paper';
import NfcAnimButton from "../../buttons/NfcButton/NfcAnimButton";
import assets from '../../../assets/animation/index'
import Lottie from 'lottie-react-native';
import GestureFlipView from 'react-native-gesture-flip-card';
import chanceCardJson from '../../../assets/DrawCards.json'
import {Slider} from '@miblanchard/react-native-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
// const db = SQLite.openDatabase(
//     {
//         name: 'transactionDB',
//         location: 'default'
//     },
//     ()=>{},
//     error =>{console.log(error)}
// )
type ItemProps = {
    id: string ,
    playerList: FirebaseFirestoreTypes.DocumentData[],
    updateAllRecordCount:(arg: number) =>void;

    // landscape: string
};
const ChanceCard: React.FC<ItemProps> = ({ id,playerList,updateAllRecordCount})=> {
      
    const [transactionList, SetTransactionList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
    const [tagID, setTagID] = useState<string | undefined>(undefined);
    const [cancelScan, setCancelScan] = useState(false)
    const viewRef = useRef<typeof GestureFlipView>()
    const [playerName, setPlayerName] = useState('')
    const [number, setNumber] = React.useState([10]);

    const chanceAction = chanceCardJson.chance.find((x)=>x?.tagid === id)?.action
    const updateTagID = (tag: string):void => {
        setTagID(tag)
        // getData()

      }
    const addData = async(playerTag: string, type: string, value: number)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: playerTag,
                type: type,
                value: value,
                timeStamp: firestore.FieldValue.serverTimestamp(),       
            })
            .then(()=>{
                console.log('giao dịch thành công')                
            })
    }

    const queryProperties = chanceCardJson.chance.filter((x)=>x?.tagid === id)
    const cardData=queryProperties.map(
        (info)=>{
            return(
                <View>
                    <Text style={{color:'black', fontSize:20}}>{info.title}</Text>
                    {
                        <View >
                            <Text style={{color:'black', fontSize:20, alignSelf:'center'}}>{number}</Text>
                            <Slider
                            value={number}
                            minimumValue={10}
                            maximumValue={120}
                            step={10}
                            onValueChange={e => setNumber(e)}
                            />
                        </View>
                    }
                    {
                        ['move','movenearest'].includes(info.action)?null:
                        <View style={{marginTop: 0, marginLeft:0, alignItems:'center'}}>
                            <NfcAnimButton updateTagID={updateTagID} height={70} width={90} fail={cancelScan}></NfcAnimButton>
                        </View>
                    }
                </View>
            )
        }
    )

    const renderBack = ()=>{
        return(
            <View>
                <Card style={Styles.backStyle}>
                    <Card.Content>
                        <Title style={Styles.backTitle}>CƠ HỘI</Title>
                        <View style={{height:170, marginTop:10}}>
                            <Lottie 
                                source={assets.lottieFiles.Chance} 
                                autoPlay
                                loop={false}/>
                            </View>
                    </Card.Content>
                </Card>
            </View>
        )
    }
    const renderFront = ()=>{
        return(
            <View style={{marginTop: 30}}>
                <Card style={Styles.frontStyle}>
                <Card.Content>
                        <Title style={Styles.frontTitle}>{id}</Title>
                        {cardData}
                    </Card.Content>
                </Card>
            </View>
        )
    }

    return (
        <View>
        <GestureFlipView             
            width={300} 
            height={300}
            ref={viewRef}
        >
          {renderBack()}
          {renderFront()}
          </GestureFlipView>
      </View> 
    );



}
export default ChanceCard;
  
const Styles = StyleSheet.create({
    frontStyle: {
        backgroundColor: 'ghostwhite',
        height:300,
        width:300        
    },
    backStyle: {
        backgroundColor: 'orange',
        height:300,
        width:300,
        borderWidth: 20,
        borderColor: 'white'      
    },
    backTitle:{
        textAlign:'center',
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'KabelHeavy',
        fontSize: 40,
        height:50,
        textAlignVertical:'bottom'
    },
    buttonContainer: {
        elevation: 2,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width:180,
        height:38, 
        alignSelf: "center",
        flexDirection: 'row',
    },
    frontTitle:{
    },
    textInputSection: {
        height:50,
        width:170,
        marginHorizontal:30,
        marginTop: 35,
        alignSelf:'center',
        backgroundColor:'transparent', 
        borderRadius:15
    },
    textInput: {
        height:50, 
        width:170, 
        marginLeft:0 , 
        borderRadius:0, 
        backgroundColor:'white', 
        fontSize:17,
        borderColor:'lightgreen',
        borderWidth:2,
      },
    
    
})