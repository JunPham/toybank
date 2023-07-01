export function getAnimation(input) {
    switch (input) {
      case "NfcFail": return require('./NfcFail.json');
      case "NfcProccessing": return require('./NfcProccessing.json');
      case "NfcSuccess": return require('./NfcSuccess.json');
    }
  }
