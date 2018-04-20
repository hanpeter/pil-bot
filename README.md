# pil-bot

[![Travis](https://img.shields.io/travis/hanpeter/pil-bot.svg?logo=travis)](https://travis-ci.org/hanpeter/pil-bot)
![GitHub last commit](https://img.shields.io/github/last-commit/hanpeter/pil-bot.svg?logo=github)
[![GitHub package version](https://img.shields.io/github/package-json/v/hanpeter/pil-bot.svg?logo=github)](package.json)
![David](https://img.shields.io/david/hanpeter/pil-bot.svg)
[![license](https://img.shields.io/github/license/hanpeter/pil-bot.svg)](LICENSE)

A simple bot for Discord that announces your Twitch stream

## What does it do?
When you turn your Twitch stream, pil-bot will notify in your discord channel with a link to your stream, the game you are playing, and the current number of viewers.
The information is updated every minute to provide your followers up to date information on your stream.

## How do I set it up?
Check out the code and run it wherever you would like! A hosting solutions like Heroku is great for this (`Procfile` is ready for you).
To run, you need to pass a few environment variables, then run `npm start`.

```shell
$ export DISCORD_BOT_TOKEN='MyDiscordBot'
$ export TWITCH_CLIENT_ID='MyTwitchClientId'
$ export TWITCH_CLIENT_SECRET='MyTwitchClientSecret'
$ export STREAMERS='{"MyStreamerId":"MyDiscordChannelId"}'
$ npm start
> pil-bot@0.1.1 start /Users/phan/projects/pil-bot
> node src/clock.js
```

In Discord, you want to provide following permissions for your bot. At the end, you should use `224256` as your permission value.
* Read Messages
* Embed Links
* Read Message History
* Send Messages
* Manage Messages
* Mention @everyone
* View Channel

### Environment Variables
|Name|Description|Default|
|----|-----------|-------|
|`DISCORD_BOT_TOKEN`|Secret token you get from Discord by creating a bot application. [`discord.js`](https://discord.js.org/) has an awesome [guide](https://discordjs.guide/#/preparations/setting-up-a-bot-application) on how to do this.|This variable is required.|
|`TWITCH_CLIENT_ID`|ID of your Twitch application. It is used to get your stream info. Follow Twitch's own [guide](https://dev.twitch.tv/docs/authentication/#registration) on how to get this.|This variable is required.|
|`TWITCH_CLIENT_SECRET`|Secret of your Twitch application. It is used to get your stream info. Follow Twitch's own [guide](https://dev.twitch.tv/docs/authentication/#registration) on how to get this.|This variable is required.|
|`STREAMERS`|Refer to the [section below](#streamer-config).|`{}` (Using this default means pil-bot does nothing)|
|`ROLLBAR_ACCESS_TOKEN`|An access token for Rollbar error tracking. If this is not set, errors are not logged in Rollbar.|No token|
|`ENVIRONMENT`|A string value to denote the environment this is running. Currently being used as Rollbar environment.|`development`|
|`LOG_LEVEL`|Minimum level of logs you want to see. Refer to [`loglevel`](https://github.com/pimterry/loglevel)'s documentation on what the levels are.|`info`|

#### Streamer Config
`STREAMERS` should be a JSON dictionary of Twitch ID to a dictionary of various configuration for that streamer.

|Key|Description|Default|
|---|-----------|-------|
|`channelId`|ID of the Discord channel to post when this streamer starts his broadcast. *Note: this is Discord channel ID, not its name.*|This value is required.|
|`color`|The colour to be added to the side of the embed message. Set the hex RGB value as a string, such as `"0xFF0000"`.|`0xFF0000` (Red)|
|`shouldUpdateMessage`|Whether the message should be updated every minute to provide the latest data to the discord users.|`true`|
|`shouldUpdateImage`|Whether the screenshot of the broadcast should be updated every minute to provide the latest data to the discord users. However, this means that some users will get a broken image for the image if they see the image too late.|`true`|
|`shouldUseEveryone`|Whether to prefix the message with `@everyone` tag. This will send every user of your discord Guild a notification.|`false`|

<details>
    <summary>Sample Configuration</summary>

```json
{
    "twitchplayspokemon": {
        "channelId": "12345",
        "color": "0x1A1AFF",
        "shouldUpdateMessage": true,
        "shouldUpdateImage": false,
        "shouldUseEveryone": false
    }
}
```
</details>

## How do I contribute?
We welcome your contribution! Check out [`CONTRIBUTING.md`](.github/CONTRIBUTING.md).
