const assets = {
    lottieFiles:{
        NfcFail: require('./NfcFail.json'),
        NfcProccessing: require('./NfcProccessing.json'),
        NfcSuccess: require('./NfcSuccess.json'),
        Area: require('./area.json'),
        Vancant: require('./vacant.json'),
        Start: require('./start.json'),
        Mortgage: require('./mortgage.json'),
        DotLoading: require('./dotLoading.json'),
        Add: require('./add.json'),
    },
    CardCover: [
        {
            source: require('./church.json'),
            name:'church'
        },
        {
            source: require('./market.json'),
            name:'market'
        },
        {
            source: require('./area.json'),
            name:'nature'
        },
        {
            source: require('./city.json'),
            name:'city'
        },
        {
            source: require('./PalaceLandscape.json'),
            name:'palace'
        },
        {
            source: require('./RailWay.json'),
            name:'railway'
        },
        {
            source: require('./town.json'),
            name:'town'
        },

    ]
}
export default assets
