import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Modal, Animated, Easing } from 'react-native';
import  NfcManager, {NfcEvents, NfcTech} from 'react-native-nfc-manager';
import Lottie from 'lottie-react-native';
import NfcHelper from '../../../NfcHelper';
import assets from '../../../assets/animation/index'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const proccessing = assets.lottieFiles.NfcProccessing
const nfcSuccess = assets.lottieFiles.NfcSuccess
const nfcFail = assets.lottieFiles.NfcFail

interface NfcButtonProps {
    // isScan: boolean;
    // onPress: () => void;
    updateTagID:(arg: string) =>void;
    height: number,
    width: number,
    fail: boolean,
  }
  const NfcAnimButton: React.FC<NfcButtonProps> = ({ updateTagID, height, width, fail})=>{
    const ScanAnimRef = useRef<Lottie>(null)
    const [nfcProcessingVisible, setNfcProcessingVisible] = useState(true);
    const animationProgress = useRef(new Animated.Value(0))
    // const [scanning, setScanning ] = useState(false)
    

    let scanning = false;
    const StartScan = async () => {
        if(scanning==false){
            scanning = true;
            setNfcProcessingVisible(true)
            ScanAnimRef.current?.play()
            const tag = await NfcHelper.readTag();
            if (tag) {
                updateTagID(tag.id!)
                setNfcProcessingVisible(false)
                scanning = false;
                // setNfcSuccessVisible(true)
                ScanAnimRef.current?.play(39,39)
                animationProgress.current.setValue(0)
                Animated.timing(animationProgress.current, 
                    {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.linear,
                        useNativeDriver: false
                    }).start( async({finished})=>{
                            //after animation end
                            // setNfcSuccessVisible(false)
                            setNfcProcessingVisible(true)
                    }); 
                }  
            await NfcManager.registerTagEvent();
        } else{
            scanning = false;
            ScanAnimRef.current?.pause()
            NfcManager.cancelTechnologyRequest();
            console.log('scan canceled')
        }
            // setScanning(true)
              // Or set a specific startFrame and endFrame with:
            // animationRef.current?.play(30, 120);
                  
    };

    useEffect(() => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, () =>{
        })
        return()=>{
            NfcManager.setEventListener(NfcEvents.DiscoverTag,null)
        }    
    }, []);

    return(
        <View style={styles.section}>
            {
                nfcProcessingVisible &&
                <TouchableOpacity style={[styles.btn,{height, width}]} onPress={StartScan}>
                    <Lottie 
                        ref={ScanAnimRef}
                        source={proccessing} 
                        autoPlay ={false}
                        loop
                    />
                </TouchableOpacity>
            }
            {    !nfcProcessingVisible && !fail &&
                <TouchableOpacity style={[styles.btn,{height, width}]} onPress={StartScan} >
                    <Lottie 
                        source={nfcSuccess} 
                        autoPlay = {false}
                        loop = {false}
                        progress={animationProgress.current}
                    />
                </TouchableOpacity>
            }
            {    !nfcProcessingVisible && fail &&
                <TouchableOpacity style={[styles.btn,{height, width}]} onPress={StartScan} >
                    <Lottie 
                        source={nfcFail} 
                        autoPlay = {false}
                        loop = {false}
                        progress={animationProgress.current}
                    />
                </TouchableOpacity>
            }
        </View>
    )
}
const styles = StyleSheet.create({  
    btn: {
        borderRadius: 8,
        padding: 0,
    },
    section: {
        padding: 8,
        borderRadius: 8,
        marginTop:-24 ,
    },
  });
export default NfcAnimButton