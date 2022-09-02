# kook-pixiv-chan

Based on [`kbotify`](https://github.com/fi6/kBotify), `kook-pixiv-chan` is a somewhat powerful KOOK bot for [Pixiv](https://www.pixiv.net).

## Deploying

> kook-pixiv-chan has too much things that make us recommend against deploying on your own. Think twice before you do this, and no gurantees are provided.

To deploy on your own, first clone this repo and install dependencies with

```
git clone https://github.com/potatopotat0/kook-pixiv-chan
npm install
```

Copy `/src/configs/template-auth.ts` to `/src/configs/auth.ts`. Fill in your KOOK bot token, Aliyun ID and secret. 

Copy `/src/configs/template-config.ts` to `/src/configs/config.ts` and set as you need (generally you don't have to change anything here). 

Start `kook-pixiv-chan` with

```
npm start
```

or with

```
npm run pm2 -- --name="Pixiv Chan"
```

to start using pm2

## TODO

- [x] Ability to change illustration ranklist time period.
- [x] Aliyun image detection.
- [x] Refresh the linkmap of a certain illustration.


---

## Avaliable commands

Use `.pixiv` to see a list of command.

Use `.pixiv help <command>` to get detailed help for using the command.

Please join our [official KOOK server](https://kook.top/iOOsLu) and try it out!

## Censorship

Every illustration needs to be uploaded to KOOK's server before sending. R-18 and R-18G (based on Pixiv) illustration (if any) will not be upload and will be replaced with the picture below.

In regard of server bandwidth and load time, original image will be resize to 768px (configurable) in width before uploading.

`kook-pixiv-chan` will detect whether the image is NSFW or not and amount of blur to apply based on Aliyun Image Detection.

A list of banned tags is defined in `/src/commands/pixiv/common/tagBanList.ts` and a list of banned user is defined in `/src/commands/pixiv/common/userBanList.ts`. Illustration with one or more of those tags or users in the list will be rejected.

![akarin~](https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg)

Although KOOK seems to have their way of preventing massive reupload, after uploading, a map of pixiv illustration ID to its corresponding file link on KOOK's server will be added to a local file `/src/commands/pixiv/common/linkmap/map.json`. This can save server bandwidth and improve load time.
