# kook-pixiv-chan

Based on [kbotify](https://github.com/fi6/kBotify), this is the Pixiv-only repo of [potato-chatbot](https://github.com/potatopotat0/potato-chatbot).

## Deploying

To deploy on your own, first clone this repo and install dependencies with

```
git clone https://github.com/potatopotat0/kook-pixiv-chan
npm install
```

Note: the node module `sharp` may not be currectly installed in Mainland China. Please consider using a proxy.

Copy `./src/configs/template-auth.ts` to `./src/configs/auth.ts` and fill in your KOOK bot token. 

Copy `./src/configs/template-config.ts` to `./src/configs/config.ts` and set as you need. 

Start `kook-pixiv-chan` with

```
npm start
```

## TODO

- `.pixiv`
    - [ ] Ability to change illustration ranklist time period.
    - [x] Aliyun image detection.
    - [x] ~~NSFW.js image detection.~~
        - [ ] Remove NSFW.js / Fix NSFW.js
        - This method is broken and won't be fixed due to its unreliability. It's just not worth the effort.
        - `config.useAliyunGreen`, `config.customNSFWModel` and `config.customNSFWLink` have no use and effects now.
        - Even when `config.useAliyunGreen` is set to `false`, Pixiv chan will still try to use Aliyun image detection.
    - [x] Refresh linkmap of a certain illustration.
    - [x] (sort of) Maybe a better way of censoring NSFW.
        - NSFW illustrations will be attempted to add gaussian blur for up to 35px before falling back to Akarin.

---

## Avaliable command

Use `.pixiv help` to see a list of command.


## Censorship

Every illustration needs to be uploaded to KOOK's server before sending. R-18 and R-18G (based on Pixiv) illustration (if any) will not be upload and will be replaced with the picture below.

In regard of server bandwidth and load time, original image will be resize to 512px in width before uploading.

`kook-pixiv-chan` will take use of nsfwjs or Aliyun (set in `config.ts`) to detect whether the image is NSFW or not and amount of blur to apply.

~~Some illustrations may be censored by KOOK after uploading to their servers. The bot will first try to apply gaussian plur to those image for up to 35px. If those image are still censored, they will be replaced by the same picture as well.~~

~~A list of banned tags is defined in `./src/commands/pixiv/common/tagBanList.ts`. Illustration with one or more of those tags will be applied with 10px of gaussian blur beforehand. If it is still censored, additional blur will be applied in the same way (7px, 14px, 21px, 35px)~~

![akarin~](https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg)

Although KOOK seems to have their way of preventing massive reupload, after uploading, a map of pixiv illustration ID to its corresponding file link on KOOK's server will be added to a local file `./src/commands/pixiv/common/linkmap/map.json`. This can save server bandwidth and improve load time.