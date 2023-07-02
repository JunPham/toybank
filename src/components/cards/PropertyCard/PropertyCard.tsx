import React, {useState, useRef, useEffect}  from "react";
import { Text ,View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import NfcAnimButton from "../../buttons/NfcButton/NfcAnimButton";
import assets from '../../../assets/animation/index'
import Lottie from 'lottie-react-native';
import GestureFlipView from 'react-native-gesture-flip-card';
import cardJson from '../../../assets/PropertyCards.json'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Stars from 'react-native-stars';
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
    name: string ,
    id: string ,
    backgroundColor: string,
    price: number,
    // landscape: string
};
const PropertyCard: React.FC<ItemProps> = ({ name, id, backgroundColor,price})=> {
      
    const [btnvisible, setBtnVisible] = React.useState(true);
    const [star, setStar] = React.useState(0);
    const [transactionList, SetTransactionList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
    const [tagID, setTagID] = useState<string | undefined>(undefined);
    const updateTagID = (tag: string):void => {
      setTagID(tag)
      addData(tag)
      getData()

    }
    const viewRef = useRef<typeof GestureFlipView>()
    
    // const createTable = () =>{
    //     db.transaction((tx)=>{
    //         tx.executeSql(
    //             "CREATE TABLE IF NOT EXISTS "
    //             + "TxnDATA "
    //             + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, PlayerID TEXT, CardID TEXT, Value INTEGER, Type TEXT);"
    //         )
    //     })
    // }

    // interface Transaction {
    //     id: number;
    //     value: number;
    //     cardID: string;
    //     playerID: string;
    //     type: string;
    // }

    // const addTransaction = ()=>{
    //     db.transaction((tx)=>{
    //         tx.executeSql("INSERT INTO TxnDATA (PlayerID, CardID, Value, Type) VALUES (?,?,?,?)"),
    //         [tagID,id,price,'buy'],
    //         (tx, result)=>{
    //             console.log('${id} đã được mua')
    //             getData()
    //         },
    //         error=>{
    //             console.log('Giao dịch ko thành công')        
    //         }

    //     })
    // }

    // const getData = ():void=>{
    //     try{
    //         db.transaction((tx)=>{
    //             tx.executeSql("SELECT * FROM TxnDATA"),
    //             [],
    //             (tx, result)=>{
    //                 let len = result.rows.length;
    //                 if(len>0){
    //                     let results: {
    //                         id: number,
    //                         value: number,
    //                         cardID: string,
    //                         playerID: string,
    //                         type: string
    //                     }[] = [];
    //                     for (let i=0; i<len; i++){
    //                         let item = result.rows.item(i);
    //                         results.push({
    //                             id: item.ID, 
    //                             playerID: item.PlayerID, 
    //                             cardID: item.CardID, 
    //                             value: item.Value, 
    //                             type: item.Type 
    //                         })
    //                     }
    //                     SetTransactionList(results);
    //                 }
    //             }
    //         })    

    //     } catch (error){
    //         console.log(error)
    //     }
    // }
    useEffect(()=>{
    //    setTimeout(()=>{viewRef.current.flipLeft()},2000)
        async function check() {
            await getData()           
        };
        check();
        setStar(queryCountStar);
        console.log('star:' + star)

    },[transactionList])

    const query =  cardJson.properties.filter((x)=>x?.idVn == id)
    const cardData=query.map(
      (info)=>{
        return(
            <View  key={info.idVn} >
                <View style={{flexDirection:'row'}}>
                    <Title style={{alignSelf:"center", fontWeight:'bold', color:'green'}}>{star*info.housecost}</Title>
                    <Stars
                    half={false}
                    default={star}
                    update={(val:number)=>{setStar(val)}}
                    spacing={1}
                    starSize={40}
                    count={5}
                    fullStar={<AntDesign name='star' style={{color: 'gold', fontSize: 25, marginLeft:11}}/>}
                    emptyStar={<AntDesign name='staro' style={{color: 'gold', fontSize: 25, marginLeft:11}}/>}
                    />
                    <Title style={{marginLeft:15,alignSelf:"center", fontWeight:'bold', color:'darkred'}}>{star*info.housecost}</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <FontAwesome5 name='sign' style={{color: 'darkgreen', fontSize: 25, marginLeft:11}}></FontAwesome5>
                    <Title> : {info.rent}$</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <Title style={{fontWeight:'900'}}>1</Title>
                    <MaterialIcons name='house' style={star==1?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                    <Title>: {info.rent1}$</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <Title style={{fontWeight:'900'}}>2</Title>
                    <MaterialIcons name='house' style={star==2?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                    <Title>: {info.rent2}$</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <Title style={{fontWeight:'900'}}>3</Title>
                    <MaterialIcons name='house' style={star==3?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                    <Title>: {info.rent3}$</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <Title style={{fontWeight:'900'}}>4</Title>
                    <MaterialIcons name='house' style={star==4?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                    <Title>: {info.rent4}$</Title>
                </View>
                <View style={Styles.frontTitle}>
                    <FontAwesome5 name='hotel' style={star==5?Styles.hotelSelected:Styles.hotelUnSelected}></FontAwesome5>
                    <Title> : {info.rent5}$</Title>
                </View>
            </View>
        )
      }
    )

    const addData = async(player)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: player,
                type: 'buy',
                value: price*-1,       
            })
            .then(()=>{
                console.log('đã mua')
            })
    }

    async function massDeleteData() {
        // Get all users
        const usersQuerySnapshot = await firestore().collection('TransactionRecord').get();
      
        // Create a new batch instance
        const batch = firestore().batch();
      
        usersQuerySnapshot.forEach(documentSnapshot => {
          batch.delete(documentSnapshot.ref);
        });
      
        return batch.commit();
      }
      
    const getData = async()=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .get()
            .then(querySnapshot=>{
                const data:any=[];
                querySnapshot.forEach(documentSnapshot =>{
                    data.push(documentSnapshot.data())
                })
                SetTransactionList(data);
                console.log(transactionList);
            })
    }

    const queryTXN =  transactionList.filter((x)=>x?.cardID == id && x?.type=="buy")
    const queryCountStar = transactionList.filter((x)=>x?.cardID == id && x?.type=="build").length
    const TxnData=queryTXN.map(
        (info)=>{
          return(
            <Title style={{fontSize:13}} >{info.playerID}</Title>
          )
        })
    
    const vacantFront=()=>{
        return(
            <View style={{flexDirection:'column'}}>
                <View>
                    <Title>
                        {tagID || '- - - - - - - - - - - - - - - - - - -'}
                    </Title>
                </View>
                <View style={{height:130, marginTop:30}}>
                    <Lottie 
                        source={assets.lottieFiles.Vancant} 
                        autoPlay
                        loop={true}/>
                </View>
                <View style={{alignItems:'center'}}>
                    <NfcAnimButton updateTagID={updateTagID} height={80} width={100}/>
                </View>
            </View>
        )
    }

    const newGameFront = () => {
        return (
            <Card style={Styles.cardWrapper} >
                    <Card.Content  >
                        <Title style={{backgroundColor}}>{name}</Title>
                        <TouchableOpacity onPress={()=>massDeleteData()}>
                            <View style={{height:200, marginTop:30}}>
                                <Lottie 
                                    source={assets.lottieFiles.Start} 
                                    autoPlay
                                    loop/>
                            </View>
                        </TouchableOpacity>                        
                    </Card.Content>
            </Card>
        )
    }

    const renderFront = () => {
        return (
            <View >
                {
                    name=='New Game'?newGameFront():
                    <Card style={Styles.cardWrapper} >
                        <Card.Content  >
                        <Title style={{backgroundColor}}>{name}</Title>
                        {queryTXN.length<1?null:TxnData}
                        {queryTXN.length<1?vacantFront():cardData}
                        </Card.Content>
                    </Card>
                }
                
        </View>
        );
      };
      
      const renderBack = () => {
        return (
          <View >
            <Card style={Styles.backStyle} >
                <Card.Content  >
                    <Title style={Styles.textBackStyle}>{name.toUpperCase()}</Title>
                    <Title style={Styles.textBackStyle}>{price} $</Title>
                    <View style={{height:180, alignContent:'center'}} >
                        <Lottie 
                            source={assets.lottieFiles.Area} 
                            autoPlay
                            loop={false}
                            speed={2.5}/>
                    </View>
                    {
                        btnvisible?
                        <TouchableOpacity style={[Styles.buttonContainer,{backgroundColor:'darkseagreen'}]} onPress={()=> setBtnVisible(false)}>
                        <Text style={Styles.textBackStyle}> THẾ CHẤP: {price/2} </Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={[Styles.buttonContainer,{backgroundColor:'salmon'}]} onPress={()=> setBtnVisible(true)}>
                            <Text style={Styles.textBackStyle}> GIẢI CHẤP: {Math.round(price/2*1.1)} </Text>
                        </TouchableOpacity>
                    }
                    {/* <Paragraph style={{color:'white'}}>Khi thẻ tài sản này bị thế chấp, phải đặt mặt này hướng lên</Paragraph> */}
                </Card.Content>
            </Card>
          </View>
        );
      };

    return (
        <View>
        <GestureFlipView             
            width={300} 
            height={500}
            ref={viewRef}
        >
          {renderBack()}
          {renderFront()}
          </GestureFlipView>
      </View> 
    );
}
export default PropertyCard;
  
const Styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: 'ghostwhite',
        height:400,
        width:300        
    },
    backStyle: {
        backgroundColor: 'crimson',
        height:400,
        width:300,
        borderWidth: 20,
        borderColor: 'white'      
    },
    textBackStyle:{
        textAlign:'center',
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'KabelHeavy',
    },
    buttonContainer: {
        elevation: 4,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width:140,
        alignSelf: "center",
    },
    frontTitle:{
        flexDirection: 'row',
    },
    houseSelected:{
        color: 'darkgreen', 
        fontSize: 30
    },  
    houseUnSelected:{
        color: 'gray', 
        fontSize: 30
    }, 
    hotelSelected:{
        color: 'darkgreen',
        fontSize: 25, 
        marginLeft:8
    },  
    hotelUnSelected:{
        color: 'gray',
        fontSize: 25, 
        marginLeft:8
    }, 
})