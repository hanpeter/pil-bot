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

### Environment Variables
|Name|Description|Default|
|----|-----------|-------|
|`DISCORD_BOT_TOKEN`|Secret token you get from Discord by creating a bot application. [`discord.js`](https://discord.js.org/) has an awesome [guide](https://discordjs.guide/#/preparations/setting-up-a-bot-application) on how to do this.|This variable is required.|
|`TWITCH_CLIENT_ID`|ID of your Twitch application. It is used to get your stream info. Follow Twitch's own [guide](https://dev.twitch.tv/docs/authentication/#registration) on how to get this.|This variable is required.|
|`TWITCH_CLIENT_SECRET`|Secret of your Twitch application. It is used to get your stream info. Follow Twitch's own [guide](https://dev.twitch.tv/docs/authentication/#registration) on how to get this.|This variable is required.|
|`STREAMERS`|A JSON dictionary of Twitch ID to Discord channel ID. If you want to announce when "twitchplayspokemon" streams goes live to Discord channel ID "12345", put `{"twitchplayspokemon":"12345"}`. *Note: this is Discord channel ID, not its name.*|`{}` (Using this default means pil-bot does nothing)|
|`ROLLBAR_ACCESS_TOKEN`|An access token for Rollbar error tracking. If this is not set, errors are not logged in Rollbar.|No token|
|`ENVIRONMENT`|A string value to denote the environment this is running. Currently being used as Rollbar environment.|`development`|
|`LOG_LEVEL`|Minimum level of logs you want to see. Refer to [`loglevel`](https://github.com/pimterry/loglevel)'s documentation on what the levels are.|`info`|

## How do I contribute?
We welcome your contribution! Check out [`CONTRIBUTING.md`](.github/CONTRIBUTING.md).
