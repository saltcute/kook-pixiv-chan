# kook-pixiv-chan

Based on [kbotify](https://github.com/fi6/kBotify), this is the Pixiv-only repo of [potato-chatbot](https://github.com/potatopotat0/potato-chatbot).

## Deploying

> You MUST have access to Aliyun image detection service to deploy `kook-pixiv-chan` (for now)

To deploy on your own, first clone this repo and install dependencies with

```
git clone https://github.com/potatopotat0/kook-pixiv-chan
npm install
```

Copy `./src/configs/template-auth.ts` to `./src/configs/auth.ts`. Fill in your KOOK bot token, Aliyun ID and secret. 

Copy `./src/configs/template-config.ts` to `./src/configs/config.ts` and set as you need. 

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

- [ ] Ability to change illustration ranklist time period.
- [x] Aliyun image detection.
- [x] ~~NSFW.js image detection.~~
    - [ ] Remove NSFW.js / Fix NSFW.js
    - This method is broken and won't be fixed due to its unreliability. It's just not worth the effort.
    - `config.useAliyunGreen`, `config.customNSFWModel` and `config.customNSFWLink` have no use and effects now.
      Even when `config.useAliyunGreen` is set to `false`, Pixiv chan will still try to use Aliyun image detection.
- [x] Refresh the linkmap of a certain illustration.


---

## Avaliable commands

Use `.pixiv` to see a list of command.

Use `.pixiv help <command>` to get detailed help for using the command.

## About `linkmap`

The `linkmap` was originally a simple json file to save the link to the file of its corresponding illustration ID on kook's server.

Now, `linkmap` contains even more informations, and its structure can be shown as such:

```
{
    [illust_id: string]: {
        [page_number: string]: {
            kookLink: string
            NSFWResult: {
                status: number,
                success: boolean,
                blur: number,
                reason: {
                    porn?: {
                        ban: boolean
                        label: string
                        probability: number
                    }
                    terrorism?: {
                        ban: boolean
                        label: string
                        probability: number
                    }
                    live?: {
                        ban: boolean
                        label: string
                        probability: number
                    }
                    ad?: {
                        ban: boolean
                        label: string
                        probability: number
                    }
                },
                suggestion: {
                    ban: boolean
                    blurAmount: number
                }
            }
        }
    }
}
```

The `porn`, `terrorism`, `live` and `ad` part will appear in `reason` only if they contribute to the total blur amount. That is, ONLY when the image is NSFW in that certain category (sexual content, terrorism/politics/violence, smoking/gambling or advertising).

```
{
    "98941448":{
        "0":{
            "kookLink":"https://img.kookapp.cn/assets/2022-07/21/iZJakMhLwv0e8080.jpg",
            "NSFWResult":{
                "status":200,
                "success":true,
                "blur":0,
                "reason":{
                    
                }
            },
            "suggestion":{
                "ban":false,
                "blurAmount":0
            }
        }
    },
    "98012090":{
        "0":{
            "kookLink":"https://img.kookapp.cn/assets/2022-07/16/NUBJMKwKGu0e808k.jpg",
            "NSFWResult":{
                "status":200,
                "success":true,
                "blur":28,
                "reason":{
                    "porn":{
                        "ban":true,
                        "label":"porn",
                        "probability":99.94
                    }
                }
            },
            "suggestion":{
                "ban":true,
                "blurAmount":28
            }
        }
    }
}
```

## Censorship

Every illustration needs to be uploaded to KOOK's server before sending. R-18 and R-18G (based on Pixiv) illustration (if any) will not be upload and will be replaced with the picture below.

In regard of server bandwidth and load time, original image will be resize to 512px in width before uploading.

`kook-pixiv-chan` will make use of ~~nsfwjs or~~ Aliyun ~~(set in `config.ts`)~~ to detect whether the image is NSFW or not and amount of blur to apply.

~~Some illustrations may be censored by KOOK after uploading to their servers. The bot will first try to apply gaussian plur to those image for up to 35px. If those image are still censored, they will be replaced by the same picture as well.~~

~~A list of banned tags is defined in `./src/commands/pixiv/common/tagBanList.ts`. Illustration with one or more of those tags will be applied with 10px of gaussian blur beforehand. If it is still censored, additional blur will be applied in the same way (7px, 14px, 21px, 35px)~~

![akarin~](https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg)

Although KOOK seems to have their way of preventing massive reupload, after uploading, a map of pixiv illustration ID to its corresponding file link on KOOK's server will be added to a local file `./src/commands/pixiv/common/linkmap/map.json`. This can save server bandwidth and improve load time.
