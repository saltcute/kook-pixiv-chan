# kook-pixiv-chan

Based on [`Kasumi`](https://github.com/Hexona69/kasumi), `kook-pixiv-chan` is a powerful KOOK bot for [Pixiv](https://www.pixiv.net).

## Deploying

> kook-pixiv-chan has too much things that make us recommend against deploying on your own. Think twice before you do this, and no gurantees are provided.
>
> We are working on changing this situation, but you should not expect any ETA

To deploy on your own, first clone this repo and install dependencies with

```
git clone https://github.com/Hexona69/kook-pixiv-chan
npm install
```

Copy `/src/configs/template-auth.ts` to `/src/configs/auth.ts`

Copy `/src/configs/template-config.ts` to `/src/configs/config.ts`

Fill in everything per instruction included

Start `kook-pixiv-chan` with

```
npm start
```

or with

```
npm run pm2
```

to start using pm2

## TODO

- [x] Ability to change illustration ranklist time period.
- [x] Aliyun image detection.
- [x] Refresh the linkmap of a certain illustration.
- [ ] Allow running without any censorship at own risk


---

## Avaliable commands

Use `.pixiv` to see a list of command.

Use `.pixiv help <command>` to get detailed help for using the command.

使用 `.pixiv help 中文命令` 查询部分指令的中文别名

Please join our [official KOOK server](https://kook.top/iOOsLu) and try it out!

## Censorship

Every illustration needs to be uploaded to KOOK's server before sending. R-18 and R-18G (based on Pixiv) illustration (if any) will not be upload and will be replaced with the picture below.

In regard of server bandwidth and load time, original image will be resize to 768px (configurable) in width before uploading.

`kook-pixiv-chan` will detect whether the image is NSFW or not and amount of blur to apply based on Aliyun Image Detection.

A list of banned tags is defined in `/src/commands/pixiv/common/tagBanList.ts` and a list of banned user is defined in `/src/commands/pixiv/common/userBanList.ts`. Illustration with one or more of those tags or users in the list will be rejected anyway, without checking nsfw.

![akarin~](https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg)
