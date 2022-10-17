export default {
    /**
     * This name will appear in the bunyan log output
     * 
     * It could be anything you want
     */
    appname: "Pixiv Chan",

    /**
     * The image will be resize to the following resolution
     * 
     * Pixiv Chan will try to fit the image in the resolution, instead of cropping it
     */
    resizeWidth: 512,
    resizeHeight: 512,

    /**
     * Send heartbeat to Bot Market every 30 minutes
     * 
     * If you don't know what it is, leave it as default.
     * 
     * This should not affects normal use.
     */
    enableBotMarket: false,

    /**
     * Note that Aliyun international is generally a lot more expensive
     */
    useAliyunChina: true,

    /** 
     * URL of the web API
     * 
     * Check https://github.com/Hexona69/pixiv-web-api
     */
    pixivAPIBaseURL: "http://pixiv.lolicon.ac.cn",

    /**
     * URL of remote linkmap
     * 
     * Pixiv Chan will store the linkmap locally every 30 minutes anyway no matter what this option is set
     * 
     * If set to true, Pixiv Chan will download linkmap from the URL at launch
     * 
     * Pixiv web API also comes with remote linkmap
     * 
     * Check https://github.com/Hexona69/pixiv-web-api
     */
    useRemoteLinkmap: false,
    remoteLinkmapBaseURL: "",

    /**
     * Whether this instance of Pixiv Chan is contributing to the remote linkmap or not
     * 
     * If set to true, Pixiv Chan will update remote linkmap every 30 minutes
     * 
     * This require setting a UUID and token on your web API and in your configs/auth.ts
     * 
     * Check https://github.com/Hexona69/pixiv-web-api
     */
    maintainingRemoteLinkmap: false,

    /**
     * Reverse proxy URL for getting image from Pixiv
     * 
     * You can use virtually any service for this: 
     * 
     * `i.pixiv.cat`
     * 
     * `i.pixiv.re`
     * 
     * and more...
     * 
     * Or build your own using your server or with 3rd party service like Cloudflare Workers, Replit.
     */
    pixivImageProxyBaseURL: "https://i.pixiv.lolicon.ac.cn",

    /**
     * Administrators list, an array of user ID
     */
    adminList: ["1854484583"],

    /**
     * Channel ID for testing if the token is banned or not, and recieving online status message
     * 
     * Make sure the bot have the premission to view, and to send message to, this channel
     */
    uploaderOnlineMessageDestination: "1145141919810"
}