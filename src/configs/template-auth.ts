export default {
    /**
     * kbotify setup
     * 
     * Only WebSocket is supported. Refer to kbotify document for WebHook settings
     */
    khlport: 6000,
    khltoken: 'Put yor token here',

    /**
     * Array of tokens of asset uploader for load balancing and load shifting
     * 
     * Put the token of your main bot here if you do not wish to use a separate one
     * 
     * You will need at least one token for Pixiv Chan to function normally
     * 
     * At launch, all of the uploader will send a message to `uploaderOnlineMessageDestination` in `configs/config.ts`
     * 
     * to test the availability of each uploader
     * 
     * Pixiv Chan will tag every administrator (defined by `adminList` in `configs/config.ts`) in uploaderOnlineMessageDestination and automately terminate if no token is available
     */
    assetUploadTokens: [
        {
            active: false,
            token: 'Your assets uploading token here',
        }
    ],
    /**
     * UUID of Bot Market bot
     * 
     * If you don't know what it is, leave it as default.
     * 
     * This should not affects normal use.
     */
    botMarketUUID: 'Your bot market UUID here',

    /**
     * Aliyun Green (NSFW detection on cloud)
     * 
     * This is mandatory **for now**
     * 
     * TODO: allows no censorship runing at own risk
     */
    aliyunAccessKeyID: "Aliyun access key ID here",
    aliyunAccessKeySecret: "Aliyun access key secert here",

    /**
     * If `maintainingRemoteLinkmap` in `configs/config.ts` is set to true, Pixiv Chan will update remote linkmap every 30 minutes
     * 
     * Which requires setting a UUID and token on your web API and here
     * 
     * Check out https://github.com/Hexona69/pixiv-web-api
     */
    remoteLinkmapUUID: "",
    remoteLinkmapToken: "",
};
