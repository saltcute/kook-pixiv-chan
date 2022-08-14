export default {
    // Kbotify
    khlport: 6000,
    khlkey: 'encrypt key here',
    khltoken: 'token here',                     // Set the mode to WebSocket and fill in your token here
    khlverify: 'verify token here',
    assetUploadTokens: [
        {
            active: false,
            token: 'token here',                // You need at least one uploader token, this can be the same as khltoken
        }
    ],                                          // Use multiple token if need
    /**
     * Bot Market
     */
    botMarketUUID: 'your bot market UUID',      // Set your Bot Market UUID if needed (no you don't)
    /**
     * Aliyun (NSFW detection on cloud)
     */
    aliyunAccessKeyID: "Aliyun access key ID here",
    aliyunAccessKeySecret: "Aliyun access key secert here",
    /** 
     * Linkmap
     */
    remoteLinkmapUUID: "",
    remoteLinkmapToken: "",
};
