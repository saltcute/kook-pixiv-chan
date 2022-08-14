export default {
    appname: "Pixiv Chan", // This is the name of your robot. It can be anything you want.
    resizeWidth: 512,
    resizeHeight: 512,
    enableBotMarket: false,
    customNSFWModel: false,
    customNSFWLink: ``,
    useAliyunGreen: true,
    pixivAPIBaseURL: "http://pixiv.lolicon.ac.cn",
    pixivImageProxyBaseURL: "http://i.pixiv.lolicon.ac.cn",
    useRemoteLinkmap: false,
    remoteLinkmapBaseURL: "",
    maintainingRemoteLinkmap: false,
    adminList: ["1854484583"], // Administrator users list, an array of user ID
    /**
     * Channel ID for testing if the token is banned or not, and recieving online status message
     * Make sure the bot have the premission to view, and to send message to, this channel
     */
    uploaderOnlineMessageDestination: "1145141919810"
}