import NfcManager, {
    NfcTech,
    Ndef,
    NfcEvents,
    NfcError,
  } from 'react-native-nfc-manager';

class NfcHelper{
    readTag = async () => {
        let tag = null;
    
        try {
          await NfcManager.requestTechnology([NfcTech.Ndef]);
    
          tag = await NfcManager.getTag();
          tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();
    
        } catch (ex) {
          // for tag reading, we don't actually need to show any error
          console.log(ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    
        return tag;
    };   
}
export default new NfcHelper();