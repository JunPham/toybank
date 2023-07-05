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
import CardContent from "react-native-paper/lib/typescript/src/components/Card/CardContent";
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
      
    const [star, setStar] = React.useState(0);
    const [transactionList, SetTransactionList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
    const [tagID, setTagID] = useState<string | undefined>(undefined);
    const [cancelScan, setCancelScan] = useState(false)
    const updateTagID = (tag: string):void => {
      setTagID(tag)
      addData(tag)
      getData()
    }
    
    const queryBuyer =  transactionList.find((x)=>x?.cardID == id && x?.type=="buy")?.playerID
    const updateBuildTagID = (tag: string):void => {
        if(star<5 && tag==queryBuyer){
            setCancelScan(false); addBuildRecord(tag,-1,true)} 
        else setCancelScan(true);
        getData()
      }
  
    const updateDemolishTagID = (tag: string):void => {
        if(star>0 && tag==queryBuyer){
            setCancelScan(false); addBuildRecord(tag,1,false)}
        else setCancelScan(true);
        getData()
    }
  
    const updateMortgateTagID = (tag: string):void => {
        if(tag==queryBuyer)
        {
            setCancelScan(false); addMortgageRecord(tag,true)
        } else setCancelScan(true);
        getData()
    }
    const updateUnMortgateTagID = (tag: string):void => {
        if(tag==queryBuyer)
        {
            setCancelScan(false); addMortgageRecord(tag,false)
        } else setCancelScan(true);
        getData()
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
            check()
        // console.log('sao:'+ star)
        // if(queryTXN.length>0&&doFlip){setTimeout(()=>{viewRef.current.flipLeft()},2000)}
    },[])

    const queryTXN =  transactionList.filter((x)=>x?.cardID == id && x?.type=="buy")
    const buyerCount = queryTXN.length
    // useEffect(()=>{
    // },[buyerCount])

    const queryCountBuild = transactionList.filter((x)=>x?.cardID == id && x?.type=="build").length
    const queryCountDemolish = transactionList.filter((x)=>x?.cardID == id && x?.type=="demolish").length
    const queryCountStar = queryCountBuild - queryCountDemolish        
    useEffect(()=>{      
        // setStar(1);  
        setStar(queryCountStar);
    },[queryCountStar])

    const mortgageCount = transactionList.filter((x)=>x?.cardID == id && x?.type=="mortgage").length
    const unMortgageCount = transactionList.filter((x)=>x?.cardID == id && x?.type=="unmortgage").length
    const mortgageRecord = mortgageCount-unMortgageCount
    useEffect(()=>{      
        if(buyerCount>0&&mortgageRecord<1){setTimeout(()=>{viewRef.current.flipLeft()},2000)}
    },[mortgageRecord,buyerCount])

    const query =  cardJson.properties.filter((x)=>x?.idVn === id)
    const cardData=query.map(
      (info)=>{
        return(
            <View  key={info.idVn} >
                <View style={{flexDirection:'row'}}>
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
                    {/* <Title style={{alignSelf:"center", fontWeight:'bold', color:'green', marginLeft:20}}>{(queryCountStar<1?star:(queryCountStar-star))*info.housecost}</Title> */}
                </View>
                <View style={{flexDirection:'row'}}>
                    <View>
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

                    <View>
                        <View style={{flexDirection:'row', marginTop:10}}>
                            <MaterialIcons name='house' style={{color: 'darkgreen', fontSize: 35, marginLeft:5}}></MaterialIcons>
                            <Text style={{color:'darkred', fontSize:23, marginTop:4}}> -{info.housecost}$</Text>
                            <View style={{marginBottom:-40, marginTop: -20, marginLeft:-15}}>
                                <NfcAnimButton updateTagID={updateBuildTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                            </View>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <FontAwesome5 name='hammer' style={{color: 'darkred', fontSize: 28, marginLeft:5}}></FontAwesome5>
                            <Text style={{color:'darkgreen', fontSize:23, marginTop:4}}> +{info.housecost}$</Text>
                            <View style={{marginBottom:-40, marginTop: -20, marginLeft:-17}}>
                                <NfcAnimButton updateTagID={updateDemolishTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                            </View>
                        </View>
                    </View>

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
                viewRef.current.flipLeft()
            })
    }

    const buildValue = cardJson.properties.find((x)=>x?.idVn === id)?.housecost
    const addBuildRecord = async(player:string,negativeInput:number,build:boolean)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: player,
                type: build?'build':'demolish',
                value: (buildValue == undefined?0:buildValue)*negativeInput,       
            })
            .then(()=>{
                console.log(build?'chúc mừng cưng đã xây xong 1 nhà mới':'Buồn qué, bị giang hồ siết nợ giật sập 1 căn nhà ')
            })
    }

    const propertyValue = cardJson.properties.find((x)=>x?.idVn === id)?.price
    const addMortgageRecord = async(player:string,Mortgage:boolean)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: player,
                type: Mortgage?'mortgage':'unmortgage',
                value: propertyValue == undefined?0:(Mortgage?propertyValue/2:Math.round(propertyValue/2*-1.1)),         
            })
            .then(()=>{
                console.log(Mortgage?'Cầm cố thế chấp sổ đỏ trả nợ, báo quá trời báo!':'chuộc lại sổ đỏ mừng rơi nước mắt')             
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
            })
    }

    const TxnData=queryTXN.map(
        (info)=>{
          return(
            <Title style={{fontSize:13}} >{info.playerID}</Title>
          )
        })
    
    const vacantFront=()=>{
        return(
            <View style={{flexDirection:'column'}}>
                <View style={{height:170, marginTop:10}}>
                    <Lottie 
                        source={assets.lottieFiles.Vancant} 
                        autoPlay
                        loop={false}/>
                </View>
                <View style={{alignItems:'center'}}>
                    <NfcAnimButton updateTagID={updateTagID} height={80} width={100} fail={false}/>
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

    const mortgagedView = () => {
        return (
            <View style={{flexDirection:'column'}}>
                <View style={{height:170, marginTop:10, marginBottom:20}}>
                    <Lottie 
                        source={assets.lottieFiles.Mortgage} 
                        autoPlay
                        loop/>
                </View>
            </View>
        )
    }

    const renderFront = () => {
        return (
            <View >
                {
                    name=='New Game'?newGameFront():
                    <Card style={Styles.cardWrapper} >
                        <Card.Content>
                        <Title style={{backgroundColor}}>{name}</Title>
                        {queryTXN.length<1?null:TxnData}
                        {queryTXN.length<1?vacantFront():mortgageRecord>0?mortgagedView():cardData}
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
                    {
                        queryTXN.length<1?vacantFront():
                        mortgageRecord>0?
                        mortgagedView()
                        :
                        <View style={{height:180, alignContent:'center'}} >
                            <Lottie 
                                source={assets.lottieFiles.Area} 
                                autoPlay
                                loop={false}
                                speed={2.5}/>
                        </View>
                    }                  
                    {       
                        queryTXN.length<1?null:           
                        <View>
                            {
                                mortgageRecord==0&&queryCountStar==0?
                                <View style={[Styles.buttonContainer,{backgroundColor:'darkseagreen'}]}>
                                    <Text style={Styles.textBackStyle}> THẾ CHẤP: +{price/2}$ </Text>
                                    <View style={{marginTop:-30, marginLeft:-25}}>
                                        <NfcAnimButton updateTagID={updateMortgateTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                    </View>
                                </View>
                                :queryCountStar>0?null:
                                <View style={[Styles.buttonContainer,{backgroundColor:'salmon'}]}>
                                    <Text style={Styles.textBackStyle}> GIẢI CHẤP: -{Math.round(price/2*1.1)}$ </Text>
                                    <View style={{marginTop:-30, marginLeft:-25}}>
                                        <NfcAnimButton updateTagID={updateUnMortgateTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                    </View>
                                </View>
                            }
                        </View>
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