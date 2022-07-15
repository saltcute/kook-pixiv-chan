export default {
    // Kbotify
    khlport: 6000,
    khlkey: 'encrypt key here',
    khltoken: 'token here',                     // Set the mode to WebSocket and fill in your token here
    khlverify: 'verify token here',
    assetUploadToken: 'token here',             // Use a separate token if needed
    // Bot Market
    enableBotMarket: false,                     // Set to true if deploying on Bot Market
    botMarketUUID: 'your bot market UUID',      // Set your Bot Market UUID if needed (no you don't)
    // nsfwjs (Local NSFW detection)
    customNSFWModel: false,                     // Set to true if wantted to use local model
    customNSFWLink: "",                         // Relative path "./" is the root folder of kook-pixiv-chan
    // Aliyun (NSFW detection on cloud)
    useAliyunGreen: false,
    aliyunAccessKeyID: "Aliyun access key ID here",
    aliyunAccessKeySecret: "Aliyun access key secert here",
};
