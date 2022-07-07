# kook-pixiv-chan

Based on [kbotify](https://github.com/fi6/kBotify), this is the Pixiv-only repo of [potato-chatbot](https://github.com/potatopotat0/potato-chatbot).

## Deploying

To deploy on your own, first clone this repo and install dependencies with

```
git clone https://github.com/potatopotat0/kook-pixiv-chan
npm install
```

Note: the node module `sharp` may not be currectly installed in Mainland China. Please consider using a proxy.

Copy `./src/configs/template-auth.ts` to `./src/configs/auth.ts` and fill in your KOOK bot token. Start `kook-pixiv-chan` with

```
npm start
```

## TODO

- `.pixiv`
    - [ ] Ability to change illustration ranklist time period
    - [x] Refresh linkmap of a certain illustration
    - [x] (sort of) Maybe a better way of censoring NSFW
        - NSFW illustrations will be attempted to add gaussian blur for up to 35px before falling back to Akarin

---

## Avaliable command

```
Pixiv 命令
---
.pixiv top [标签]? 获取本周 [标签] 标签的人气前九的图片，若 [标签] 缺省则为全站排名。
.pixiv illust [插画 ID] 获取 Pixiv 上对应 ID 的插画。
.pixiv author [用户 ID] 获取用户的最新九张插画。
.pixiv detail [插画 ID] 获取对应 ID 插画的详细信息（作品名、作者、标签……）。
.pixiv refresh [插画 ID] 刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）
```

```
Pixiv Commands
---
.pixiv top [tag]? Get the top 9 most popular illustrations with [tag] tag submitted this week. If [tag] is not provided, get the top 9 most popluar illustrations in every illustrations submitted this week.
.pixiv illust [Illustration ID] Get the illustration of the given illustration ID.
.pixiv author [User ID] Get the top 9 newest illustrations from the given user.
.pixiv detail [Illustration ID] Get the detail of the illustration of the given ID (name, author, tags, etc.).
.pixiv refresh [Illusration ID] Refresh cache for the illustration of the given ID. (Run this serval minutes later if some image does not display correctly)
```

## Censorship

Every illustration needs to be uploaded to KOOK's server before sending. R-18 and R-18G (based on Pixiv) illustration (if any) will not be upload and will be replaced with the picture below.

In regard of server bandwidth and load time, original image will be resize to 512px in width before uploading.

Some illustrations may be censored by KOOK after uploading to their servers. The bot will first try to apply gaussian plur to those image for up to 35px. If those image are still censored, they will be replaced by the same picture as well.

A list of banned tags is defined in `./src/commands/pixiv/common/tagBanList.ts`. Illustration with one or more of those tags will be applied with 10px of gaussian blur beforehand. If it is still censored, additional blur will be applied in the same way (7px, 14px, 21px, 35px)

![akarin~](https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg)

Although KOOK seems to have their way of preventing massive reupload, after uploading, a map of pixiv illustration ID to its corresponding file link on KOOK's server will be added to a local file `./src/commands/pixiv/common/linkmap/map.json`. This can save server bandwidth and improve load time.