import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import {NfcEvents, nfcManager} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/prompts/androidprompt/AndroidPrompt';

function Game(props){
    const [start, setStart] = React.useState(null)
    const [duration, setDuration] = React.useState(0)
    const androidPromptRef = React.useRef()

    React.useEffect(()=>{
        let count = 5
        nfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) =>{
            count--;
            // if(Platform.OS == 'android'){
            //     androidPromptRef.current.setHintText(`${count}...`)
            // }
            androidPromptRef.current.setHintText(`${count}...`)
            if (count <=0){
                nfcManager.unregisterTagEvent().catch(() =>0);
                setDuration(new Date().getTime()-start.getTime());
                
                androidPromptRef.current.setVisible(false)
                // if(Platform.OS == 'android'){
                //     androidPromptRef.current.setVisible(false)
                // }
            }
           
        })
        return()=>{
            nfcManager.setEventListener(NfcEvents.DiscoverTag,null)
        }
    },[start])
        
    async function scanTag() {
        await nfcManager.registerTagEvent();
        // if(Platform.OS == 'android'){
        androidPromptRef.current.setVisible(true)
        setStart(new Date())
        setDuration(0)
    }
    
    return(
        <View style={styles.wrapper}>
            <Text>NFC Game</Text>
            {duration >0 && <Text>{duration} ms</Text>}
            <TouchableOpacity style={styles.btn} onPress={scanTag}>
                <Text>START</Text>
            </TouchableOpacity>    
            <AndroidPrompt ref={androidPromptRef} />
        </View>
    )
}
const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btn: {
        margin: 15,
        backgroundColor: '#ccc',
        borderRadius: 8,
        padding: 15
    }
  });
  export default Game