import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Modal, Animated, Easing } from 'react-native';
import  NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import Lottie from 'lottie-react-native';
import assets from '../../../assets/animation/index'
import NfcHelper from '../../../NfcHelper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const Add = assets.lottieFiles.Add
const Loading = assets.lottieFiles.DotLoading
const failLoad = assets.lottieFiles.loadingDotFail
interface tagProps {
    updateTagID:(arg: string) =>void;
    // height: number,
    // width: number,
    // fail: boolean,
}
const NfcAddButton: React.FC<tagProps>=({updateTagID})=>{
    const ScanAnimRef = useRef<Lottie>(null)
    // const FailAnimRef = useRef<Lottie>(null)
    const [noScan, setNoScan] = useState(true);

    
    const StartScan = async () => {
        // if(scanVisible){           
        //     NfcManager.cancelTechnologyRequest();
        //     setScanVisible(false)
        //     console.log('+')
        // } else{
        //     const tag = await NfcHelper.readTag();
        //     if (tag) {
        //         updateTagID(tag.id!)
        //         setScanVisible(true)
        //     }
        //     setScanVisible(true)
        //     console.log('...')
        // }
        setNoScan(!noScan)
    }

    useEffect(()=>{
        async function check() {
            if(noScan){
                ScanAnimRef.current?.play(0,0);
                // FailAnimRef.current?.play(0,0);           
                NfcManager.cancelTechnologyRequest();
                console.log('+')
            } else{
                ScanAnimRef.current?.play();
                const tag = await NfcHelper.readTag();
                if (tag) {
                    updateTagID(tag.id!);
                    setNoScan(!noScan);
                    ScanAnimRef.current?.play(0,0);
                    // FailAnimRef.current?.play();
                }
                console.log('...')
            }    
        }
        check()
    },[noScan])

    return(
        <View>
                <TouchableOpacity  onPress={StartScan}>
                    <View style={styles.btn}>
                        {
                            noScan&&
                            <View>
                                <FontAwesome5 name='plus' style={styles.text}></FontAwesome5>
                            </View>
                        }
                        {
                            !noScan&&
                            <View style={styles.anim}>
                                <Lottie 
                                    ref={ScanAnimRef}
                                    source={Loading} 
                                    autoPlay
                                    loop
                                />
                            </View>
                        } 
                    </View>
                </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    
    btn: {
        flexDirection:'row',
        borderRadius: 40,
        marginLeft:5,
        padding: 0,
        width: 50,
        height:50,
        backgroundColor:'lightgreen' ,
        alignSelf:'center',
        alignItems:'center',
    },
    text:{
        backgroundColor:'transparent',
        marginTop:0,
        marginLeft:14, 
        color:'black',
        fontSize:25,

    },
    anim:{
        marginLeft:-5, 
        marginTop:0,
        width:60,
        height:60
    },
  });
export default NfcAddButton