import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import  NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/prompts/androidprompt/AndroidPrompt';

function TagGame(props){
    const [start, setStart] = React.useState(null)
    const [duration, setDuration] = React.useState(0)
    const androidPromptRef = React.useRef()

    React.useEffect(()=>{
        let count = 5;
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) =>{
            count--;
            // if(Platform.OS == 'android'){
            //     androidPromptRef.current.setHintText(`${count}...`)
            // }
            androidPromptRef.current.setHintText(`${count}...`)
            if (count <=0){
                NfcManager.unregisterTagEvent().catch(() =>0);
                setDuration(new Date().getTime()-start.getTime());
                
                androidPromptRef.current.setVisible(false)
                // if(Platform.OS == 'android'){
                //     androidPromptRef.current.setVisible(false)
                // }
            }
           
        })
        return()=>{
            NfcManager.setEventListener(NfcEvents.DiscoverTag,null)
        }
    },[start])
        
    async function scanTag() {
        // console.warn('scanning')
        await NfcManager.registerTagEvent();
        // if(Platform.OS == 'android'){
        androidPromptRef.current.setVisible(true)
        setStart(new Date())
        setDuration(0)
    }
    
    return(
        <View style={styles.wrapper}>
            <Text>NFC TEST</Text>
            {duration >0 && <Text>{duration} ms</Text>}
            <TouchableOpacity style={styles.btn} onPress={scanTag}>
                <Text>SCAN</Text>
            </TouchableOpacity>    
            <AndroidPrompt 
                ref={androidPromptRef} 
                onCancelPress={()=>{
                    NfcManager.unregisterTagEvent().catch(()=>0)
                }}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    wrapper: {
    //   flex: 1,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    },
    btn: {
        margin: 15,
        backgroundColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        width: 100
    }
  });
  export default TagGame