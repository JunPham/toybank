import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Modal, Animated, Easing } from 'react-native';
import  NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import Lottie from 'lottie-react-native';

interface tagProps {
    id: any;
}
const NfcButton: React.FC<tagProps>=(props: tagProps)=>{
    const ScanAnimRef = useRef<Lottie>(null)
    const [nfcSuccessVisible, setNfcSuccessVisible] = useState(false);
    const [processingButtonVisible, setprocessingButtonVisible] = useState(true);
    const [nfcFailVisible, setNfcFailVisible] = useState(false);
    const animationProgress = useRef(new Animated.Value(0))

    let scanning = false;
    const StartScan = useCallback(async () => {
        if(scanning==false){
            scanning = true;
            ScanAnimRef.current?.play()
            // Or set a specific startFrame and endFrame with:
            // animationRef.current?.play(30, 120);
            await NfcManager.registerTagEvent();
        } else{
            scanning = false;
            ScanAnimRef.current?.pause()
            NfcManager.unregisterTagEvent().catch(()=>0)
        }
        
    }, [])
    let tag = null
    React.useEffect(()=>{
        NfcManager.setEventListener(NfcEvents.DiscoverTag, async () =>{
            setprocessingButtonVisible(false)
            setNfcSuccessVisible(true)
            props.id(await NfcManager.getTag());
            // ScanSuccessAnimRef.current?.play()
            animationProgress.current.setValue(0)
            Animated.timing(animationProgress.current, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: false
              }).start(({finished})=>{
                    setNfcSuccessVisible(false)
                    setprocessingButtonVisible(true)
                    ScanAnimRef.current?.play()
            });
        })
        return()=>{
            NfcManager.setEventListener(NfcEvents.DiscoverTag,null)
        }
    },[])

    return(
        <View>
            <Modal visible={processingButtonVisible} transparent={true}>
                <TouchableOpacity style={styles.btn} onPress={StartScan}>
                    <Lottie 
                        ref={ScanAnimRef}
                        source={require('../../../assets/animation/NfcProccessing.json')} 
                        autoPlay ={false}
                        loop
                    />
                </TouchableOpacity>
            </Modal> 
            <Modal visible={nfcSuccessVisible} transparent={true}>
                <TouchableOpacity style={styles.btn} >
                    <Lottie 
                        // ref={ScanSuccessAnimRef}
                        source={require('../../../assets/animation/NfcSuccess.json')} 
                        autoPlay = {false}
                        loop = {false}
                        progress={animationProgress.current}
                    />
                </TouchableOpacity>
            </Modal>   
        </View>
    )
}
const styles = StyleSheet.create({
    
    btn: {
        margin: 15,
        borderRadius: 8,
        padding: 0,
        width: 100,
        height:80,      
    }
  });
export default NfcButton