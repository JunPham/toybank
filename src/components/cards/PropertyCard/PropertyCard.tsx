import React, {useState, useRef, useEffect}  from "react";
import { Text ,View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Avatar, Button, Card, Title, TextInput } from 'react-native-paper';
import NfcAnimButton from "../../buttons/NfcButton/NfcAnimButton";
import AddButton from '../../buttons/NfcButton/NfcAddButton';
import assets from '../../../assets/animation/index'
import Lottie from 'lottie-react-native';
import GestureFlipView from 'react-native-gesture-flip-card';
import cardJson from '../../../assets/PropertyCards.json'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Stars from 'react-native-stars';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import {Slider} from '@miblanchard/react-native-slider';

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
    playerList: FirebaseFirestoreTypes.DocumentData[],
    updateRecordCount:(arg: number) =>void;
    updateAllRecordCount:(arg: number) =>void;

    // landscape: string
};
const PropertyCard: React.FC<ItemProps> = ({ name, id, backgroundColor,price,playerList,updateRecordCount,updateAllRecordCount})=> {
      
    const [star, setStar] = React.useState(0);
    const [transactionList, SetTransactionList ] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
    const [tagID, setTagID] = useState<string | undefined>(undefined);
    const [cancelScan, setCancelScan] = useState(false)
    const viewRef = useRef<typeof GestureFlipView>()
    const [playerName, setPlayerName] = useState('')
    const [text, onChangeText] = React.useState('');
    const [diceNumber, setDiceNumber] = React.useState([10]);
    const [sliderVisible, setSliderVisible] = React.useState(false);
    const [sellAmount, setSellAmount] = React.useState([0]);

    const cardGroup =  cardJson.properties.find((x)=>x?.idVn === id)?.["group"]
    const updateTagID = (tag: string):void => {
      setTagID(tag)
    //   giao dịch thêm ga và nhà máy
      id=='go'? 
      addData(tag,'addfunds',price,'go','Special') 
      : cardGroup =='Utilities'?
      addData(tag,'removefunds',price*-1,'buy','Utilities')
      : cardGroup =='Railroad'?
      addData(tag,'removefunds',price*-1,'buy','Railroad')
      :addData(tag,'removefunds',price*-1,'buy','Props') 
      getData()
    }
    const playerTradeList = transactionList.filter((x)=>x?.cardID == id && x?.action=='buy')
    const latest = playerTradeList.reduce((prev,current)=>prev.timeStamp>current.timeStamp?prev:current,Date).timeStamp
    const queryBuyer:string =  transactionList.find((x)=>x?.cardID == id && x?.action=='buy' && x?.timeStamp == latest)?.playerID
    const updateBuildTagID = (tag: string):void => {
        if(star<5 && tag==queryBuyer){
            setCancelScan(false); addBuildRecord(tag,true)} 
        else setCancelScan(true);
        getData()
      }
  
    const updateDemolishTagID = (tag: string):void => {
        if(star>0 && tag==queryBuyer){
            setCancelScan(false); addBuildRecord(tag,false)}
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
        // getData()
    }

    const updatePlayerTagID = (tag: string):void => {
        console.log(tag)
        playerList.filter((x)=>x.tagID==tag).length>0?null:
        addPlayer(tag,text)
        updateAllRecordCount(0)
        onChangeText('')
        getData()
      }
    
    const rentValue =  cardGroup=='Props'?(cardJson.properties.find((x)=>x?.idVn === id)?.["rent"+star]):
                       cardGroup=='Railroad'?(cardJson.properties.find((x)=>x?.idVn === id)?.["rent"+(star-1)]):
                       (cardJson.properties.find((x)=>x?.idVn === id)?.["rent"+(star-1)])*diceNumber[0]
    // const propData = queryProperties.map((info)=>{
    //     return 
    // })
    const groupParameter = (cardGroup =='Utilities'?'Utilities':cardGroup =='Railroad'?'Railroad':'Props')
    const updateRentTagID = (tag: string):void => {
        if(tag!=queryBuyer&&playerList.filter((x)=>x.tagID==tag).length>0)
        {
            setCancelScan(false); 
            addData(tag,'removefunds',rentValue!*-1,'rent',groupParameter);
            addData(queryBuyer,'addfunds',rentValue!,"rent",groupParameter);
        } else setCancelScan(true);
        getData()
        // getData()
    }

    const updateSellID = async(tag: string):Promise<void> => {
        console.log(tag)
      addData(tag,'removefunds',sellAmount[0]*-1,'buy',groupParameter)
      await addData(queryBuyer,'addfunds',sellAmount[0],"sell",groupParameter);
      getData()
      
      }

    
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

    const countBuy =  transactionList.filter((x)=>x?.type=="removefunds").length
    
    useEffect(()=>{      
        // setStar(1);  
        updateRecordCount(countBuy!)
        updateAllRecordCount(transactionList.length!)
        playerList.forEach((x)=>{x.tagID==queryBuyer?setPlayerName(x.name):null})
        console.log('name '+queryBuyer)

    },[countBuy,transactionList.length!])


    const queryTXN =  transactionList.filter((x)=>x?.cardID == id && x?.action=="buy")
    const buyerCount = queryTXN.length
    // useEffect(()=>{
    // },[buyerCount])

    const queryCountBuild = transactionList.filter((x)=>x?.cardID == id && x?.action=="build").length
    const queryCountDemolish = transactionList.filter((x)=>x?.cardID == id && x?.action=="demolish").length
    const queryCountStar = queryCountBuild - queryCountDemolish        

    const queryCountRailroadBuy = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Railroad" && x?.action=='buy').length
    const queryCountRailroadSell = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Railroad" && x?.action=='sell').length
    const RailroadTotal = queryCountRailroadBuy-queryCountRailroadSell

    let item:number=0
    const getRailroads = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Railroad" && x?.action=='buy')
    getRailroads.forEach((i)=>{
        var mortgageRCount = transactionList.filter((x)=>x?.cardID == i.cardID && x?.action=="mortgage").length
        var unMortgageRCount = transactionList.filter((x)=>x?.cardID == i.cardID && x?.action=="unmortgage").length
        var mortgageTotal = mortgageRCount-unMortgageRCount
        item = item - mortgageTotal})
    
    const queryCountUtilitiesBuy = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Utilities" && x?.action=='buy').length
    const queryCountUtilitiesSell = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Utilities" && x?.action=='sell').length
    const UtilitiesTotal = queryCountUtilitiesBuy-queryCountUtilitiesSell
    const getUtilities = transactionList.filter((x)=>x?.playerID == queryBuyer && x?.group=="Utilities" && x?.action=='buy')
    getUtilities.forEach((i)=>{
        var mortgageRCount = transactionList.filter((x)=>x?.cardID == i.cardID && x?.action=="mortgage").length
        var unMortgageRCount = transactionList.filter((x)=>x?.cardID == i.cardID && x?.action=="unmortgage").length
        var mortgageTotal = mortgageRCount-unMortgageRCount
        item = item - mortgageTotal})
    
    useEffect(()=>{      
        // setStar(1);  
        cardGroup=='Railroad'?
        setStar(RailroadTotal + item)
        :cardGroup=='Utilities'?
        setStar(UtilitiesTotal + item)
        :setStar(queryCountStar)
        console.log('starr'+item )
    },[queryCountStar,RailroadTotal,UtilitiesTotal,item])

    

    const mortgageCount = transactionList.filter((x)=>x?.cardID == id && x?.action=="mortgage").length
    const unMortgageCount = transactionList.filter((x)=>x?.cardID == id && x?.action=="unmortgage").length
    const mortgageRecord = mortgageCount-unMortgageCount
    useEffect(()=>{      
        if(buyerCount>0&&mortgageRecord<1){setTimeout(()=>{viewRef.current.flipLeft()},2000)}
    },[mortgageRecord,buyerCount])

    const queryProperties = cardJson.properties.filter((x)=>x?.idVn === id)
    const cardData=queryProperties.map(
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
                        {   
                            ["Railroad","Utilities"].includes(info.group)?
                            <View style={Styles.frontTitle}>
                                <Title style={{fontWeight:'900'}}>{1}</Title>
                                <MaterialIcons name='house' style={star==1?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                                <Title>: {info.rent0}$</Title>
                            </View>
                            :                 
                            <View style={Styles.frontTitle}>
                                <Title style={{fontWeight:'900'}}>{0}</Title>
                                <FontAwesome5 name='sign' style={{color: 'darkgreen', fontSize: 25, marginLeft:0}}></FontAwesome5>
                                <Title> : {info.rent0}$</Title>
                            </View>
                        }
                        <View style={Styles.frontTitle}>
                            <Title style={{fontWeight:'900'}}>{["Railroad","Utilities"].includes(info.group)?2:1}</Title>
                            <MaterialIcons name='house' style={star==(["Railroad","Utilities"].includes(info.group)?2:1)?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                            <Title>: {info.rent1}$</Title>
                        </View>
                        <View style={Styles.frontTitle}>
                            <Title style={{fontWeight:'900'}}>{["Railroad","Utilities"].includes(info.group)?3:2}</Title>
                            <MaterialIcons name='house' style={star==(["Railroad","Utilities"].includes(info.group)?3:2)?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                            <Title>: {info.rent2}$</Title>
                        </View>
                        <View style={Styles.frontTitle}>
                            <Title style={{fontWeight:'900'}}>{["Railroad","Utilities"].includes(info.group)?4:3}</Title>
                            <MaterialIcons name='house' style={star==(["Railroad","Utilities"].includes(info.group)?4:3)?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                            <Title>: {info.rent3}$</Title>
                        </View>
                        <View style={Styles.frontTitle}>
                            <Title style={{fontWeight:'900'}}>{["Railroad","Utilities"].includes(info.group)?'  ':4}</Title>
                            <MaterialIcons name='house' style={star==4?Styles.houseSelected:Styles.houseUnSelected}></MaterialIcons>
                            <Title>: {info.rent4}$</Title>
                        </View>
                        <View style={Styles.frontTitle}>
                            <FontAwesome5 name='hotel' style={star==5?Styles.hotelSelected:Styles.hotelUnSelected}></FontAwesome5>
                            <Title> : {info.rent5}$</Title>
                        </View>
                    </View>

                    <View>
                        {
                            ["Railroad","Utilities"].includes(info.group)?null:
                            <View style={{flexDirection:'row', marginTop:10}}>
                                <MaterialIcons name='house' style={{color: 'darkgreen', fontSize: 35, marginLeft:5}}></MaterialIcons>
                                <Text style={{color:'darkred', fontSize:23, marginTop:4}}> -{info.housecost}$</Text>
                                <View style={{marginBottom:0, marginTop: 0, marginLeft:-15}}>
                                    <NfcAnimButton updateTagID={updateBuildTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                </View>
                            </View>
                        }
                        {
                            ["Railroad","Utilities"].includes(info.group)?null:
                            <View style={{flexDirection:'row'}}>
                                <FontAwesome5 name='hammer' style={{color: 'darkred', fontSize: 28, marginLeft:5}}></FontAwesome5>
                                <Text style={{color:'darkgreen', fontSize:23, marginTop:4}}> +{info.housecost}$</Text>
                                <View style={{marginBottom:0, marginTop:0, marginLeft:-17}}>
                                    <NfcAnimButton updateTagID={updateDemolishTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                </View>
                            </View>
                        }
                        <View>
                            {
                                info.group!='Utilities'?null:
                                <View style={{marginLeft:20}}>
                                    <Text style={{color:'black', fontSize:20, alignSelf:'center'}}>{diceNumber} | {rentValue}</Text>
                                    <Slider
                                    value={diceNumber}
                                    minimumValue={1}
                                    maximumValue={12}
                                    step={1}
                                    onValueChange={e => setDiceNumber(e)}
                                    />
                                </View>
                            }
                            <View style={{marginTop: 20, marginLeft:10}}>
                                <NfcAnimButton updateTagID={updateRentTagID} height={90} width={120} fail={cancelScan}></NfcAnimButton>
                            </View>
                        </View>
                    </View>

                </View>

            </View>
        )
      }
    )

    const addData = async(playerTag: string, type: string, value: number, action: string, group: string)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: playerTag,
                type: type,
                value: value,
                group: group,
                action: action,
                timeStamp: firestore.FieldValue.serverTimestamp(),       
            })
            .then(()=>{
                console.log('đã mua') 
                action==('sell')?playerList.forEach((x)=>{x.tagID==playerTag?setPlayerName(x.name):null}):null 
                setSliderVisible(false)              
            })
    }

    const buildValue = cardJson.properties.find((x)=>x?.idVn === id)?.housecost
    const addBuildRecord = async(player:string,build:boolean)=>{
        const dataDocument = await firestore()
            .collection("TransactionRecord")
            .add({
                cardID: id,
                playerID: player,
                group: 'Props',
                type: build?'removefunds':'addfunds',
                action:  build?'build':'demolish',
                value: (buildValue == undefined?0:buildValue)*(build?-1:1),  
                timeStamp: firestore.FieldValue.serverTimestamp(),      
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
                group: groupParameter,
                type: Mortgage?'addfunds':'removefunds',
                action: Mortgage?'mortgage':'unmortgage',
                value: propertyValue == undefined?0:(Mortgage?propertyValue/2:Math.round(propertyValue/2*-1.1)),  
                timeStamp: firestore.FieldValue.serverTimestamp(),        
            })
            .then(()=>{
                console.log(Mortgage?'Cầm cố thế chấp sổ đỏ trả nợ, báo quá trời báo!':'chuộc lại sổ đỏ mừng rơi nước mắt')             
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

    const vacantFront=()=>{
        return(
            <View>                    
                    <View style={{flexDirection:'column'}}>             
                        {
                            id=='go'?
                            <View style={{height:170, marginTop:10}}>
                            <Lottie 
                                source={assets.lottieFiles.Go} 
                                autoPlay
                                loop={false}
                                speed={2}/>
                            </View>
                            :
                            <View style={{height:170, marginTop:10}}>
                            <Lottie 
                                source={assets.lottieFiles.Vancant} 
                                autoPlay
                                loop={false}/>
                            </View>
                        }
                        <View style={{alignItems:'center'}}>
                            <NfcAnimButton updateTagID={updateTagID} height={80} width={100} fail={false}/>
                        </View>
                    </View>
            </View>
        )
    }

    const newGame = async()=>{
        await massDeleteData(); 
        function startGame(){
            playerList.forEach((x)=>{
                addData(x.tagID,"addfunds",1500,"start",'Special')
            })    
        }
        startGame();
        getData();
    }

    const newGameFront = () => {
        return (
            <Card style={Styles.cardWrapper} >
                    <Card.Content  >
                        <Title style={{backgroundColor}}>{name}</Title>
                        <TouchableOpacity onPress={newGame}>
                            <View style={{height:50, marginTop:20}}>
                                <Lottie 
                                    style={{transform: [{scale: 2}]}}
                                    source={assets.lottieFiles.Start} 
                                    autoPlay
                                    loop/>
                            </View>
                        </TouchableOpacity>                        
                        <View style={Styles.textInputSection}>
                        {
                            // recordCount>0?null: 
                            <TextInput 
                            placeholder={'Thêm người chơi +'}
                            onChangeText={onChangeText}
                            value={text}
                            style={Styles.textInput}></TextInput>
                            }
                            {
                            text==''?null:
                            <View style={{marginTop: 10}}>
                                  <AddButton updateTagID={updatePlayerTagID}></AddButton>
                            </View>
                        }
                        </View>
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
                        <Title style={{backgroundColor, height:30, fontWeight:'bold'}}>{name}</Title>
                        {
                            queryTXN.length<1?null:
                            <View>
                                <View style={{flexDirection:'row'}}>
                                    <Title style={{fontSize:17, color:'green',fontWeight:'bold'}} > Tài sản của: {playerName}</Title>
                                    {
                                        queryCountStar<1&&
                                        <TouchableOpacity onPress={()=>setSliderVisible(!sliderVisible)}>
                                            <View style={{backgroundColor:'lightgreen',marginLeft:20, width:50, borderRadius:5}}>
                                                <Title style={{fontSize:17, color:'black',fontWeight:'bold', alignSelf:'center'}} >Bán</Title>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                </View>
                                {
                                    sliderVisible &&
                                    <View style={{marginLeft:20, flexDirection:'row'}}>
                                        <Text style={{color:'black', fontSize:17, alignSelf:'center', marginLeft:-15, marginTop:-18}}>{sellAmount}</Text>
                                        <View style={{marginLeft:5, width:180}}>
                                            <Slider
                                            value={sellAmount}
                                            minimumValue={0}
                                            maximumValue={500}
                                            step={10}
                                            onValueChange={e => setSellAmount(e)}
                                            />
                                        </View>
                                        <View style={{marginTop:7, marginLeft:-10}}>
                                            <NfcAnimButton updateTagID={updateSellID} height={60} width={60} fail={false}/>
                                        </View>
                                    </View>
                                }
                            </View>
                        }
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
                        name=='New Game'?null:
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
                        name=='New Game'?null:    
                        queryTXN.length<1?null:           
                        <View>
                            {
                                mortgageRecord==0&&queryCountStar==0?
                                <View style={[Styles.buttonContainer,{backgroundColor:'darkseagreen'}]}>
                                    <Text style={Styles.textBackStyle}> THẾ CHẤP: +{price/2}$ </Text>
                                    <View style={{marginTop:-5, marginLeft:-25}}>
                                        <NfcAnimButton updateTagID={updateMortgateTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                    </View>
                                </View>
                                :queryCountStar>0?null:
                                <View style={[Styles.buttonContainer,{backgroundColor:'salmon'}]}>
                                    <Text style={Styles.textBackStyle}> GIẢI CHẤP: -{Math.round(price/2*1.1)}$ </Text>
                                    <View style={{marginTop:-5, marginLeft:-25}}>
                                        <NfcAnimButton updateTagID={updateUnMortgateTagID} height={60} width={90} fail={cancelScan}></NfcAnimButton>
                                    </View>
                                </View>
                            }
                        </View>
                    }
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
        height:370,
        width:300        
    },
    backStyle: {
        backgroundColor: 'crimson',
        height:370,
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
      textInputMini: {
        height:50, 
        width:50, 
        marginLeft:0 , 
        borderRadius:0, 
        backgroundColor:'white', 
        fontSize:9,
        borderColor:'lightgreen',
        borderWidth:2,
      },
    
})