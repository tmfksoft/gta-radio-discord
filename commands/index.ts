import { GuildChannel, VoiceChannel } from 'discord.js';
import DiscordBot from '../';
import Config from 'config';
import { stat } from 'fs';

export default (bot: DiscordBot) => {
    
    // Define the help command.
    bot.registerCommand({
        name: "help",
        description: "Displays information on using the bot",
        handler: (args, author, message) => {
            console.log(`Help command triggered!`);
            message.reply(`Hey ${author.username}, I'm a simple chat bot that can join voice channels and play radio stations!`);
            return true;
        }
    });

    // Define the voice command
    bot.registerCommand({
        name: "voice",
        description: "Joins the bot to a voice channel specified by the args",
        arguments: [
            {
                name: "Voice Channel ID",
                type: "number",
                optional: true,
            }
        ],
        handler: async (args, author, message) => {

            // Try and find that channel
            if (!message.guild) {
                message.reply("This command will only work in guilds, sorry!");
                return true;
            }

            // Check they passed the argument
            let channel: null | GuildChannel = null;
            if (args.length < 1) {
                // See if they're in a channel!
                if (!message.member) {
                    message.reply("Unknown error!");
                    return true;
                }
                const ch = message.member.voice.channel;
                if (!ch) {
                    message.reply("Please supply a voice channel ID!");
                    return false;
                }
                channel = ch;
            } else {

                let chanID = args[0];

                // 313533642980982794
                if (isNaN(+chanID)) {
                    message.reply("The channel ID must be numeric!");
                    return false;
                }

                channel = message.guild.channels.resolve(chanID);

                if (!channel) {
                    message.reply("Whoops, a channel with that ID doesn't exist :(");
                    return true;
                }
                
                if (channel.type !== "voice") {
                    message.reply("you're barking up the wrong tree. Please supply a voice channel ID!");
                    return true;
                }
            }

            if (!channel) {
                message.reply("Whoops, I couldn't find that channel!");
                return true;
            }

            // See if we're already connected.
            const existingConnection = bot.getVoiceConnection(channel.guild);
            if (existingConnection) {
                if (existingConnection.channel.id === channel.id) {
                    message.reply("I'm already in there playing music!");
                } else {
                    message.reply(`I'm already in ${existingConnection.channel.name} playing music!`);
                }
                return true;
            }

            // Join the voice channel.. finally.
            const vcChannel = channel as VoiceChannel;
            const connection = await vcChannel.join();

            connection.play("http://gta-radio.tbt.wtf/krose");
            bot.registerVoiceConnection(connection);

            message.reply("I've joined and I'm playing K-Rose!");

            return true;
        }
    });

    bot.registerCommand({
        name: "station",
        description: "Change the currently playing station",
        arguments: [
            {
                name: "Station Name",
                type: "string",
                optional: false,
            }
        ],
        handler: (args, author, msg) => {
            // Gotta be in a guild!
            if (!msg.guild) {
                msg.reply("this command only works in Guilds!");
                return true;
            }

            // We need the station name!
            if (args.length <= 0) {
                return false;
            }

            // See if we can fetch the existing connection.
            const connection = bot.getVoiceConnection(msg.guild);

            if (!connection) {
                msg.reply(`I'm not currently in a voice channel, join me to one with the ${Config.get('commandTrigger')}voice command.`);
                return true;
            }

            // Okay, we're in there. Lets figure out what they're after.
            const station = args.join("").toLowerCase();

            if (station === "krose" || station === "k-rose") {
                // Play K-Rose
                connection.play("http://gta-radio.tbt.wtf/krose");
                msg.reply("Playing K-Rose!");
                return true;
            }
            if (station === "bouncefm" || station === "bounce-fm") {
                // Play BounceFM
                connection.play("http://gta-radio.tbt.wtf/bounce-fm");
                msg.reply("Playing Bounce FM!")
                return true;
            }
            if (station === "csr" || station === "c.s.r." || station === "c.s.r" || station === "103.9") {
                // Play CSR
                connection.play("http://gta-radio.tbt.wtf/csr");
                msg.reply("Playing Contemporary Soul Radio (CSR 103.9)!");
                return true;
            }
            if (station === "kdst" || station === "k-dst") {
                // Play K-DST
                connection.play("http://gta-radio.tbt.wtf/k-dst");
                msg.reply("Playing K-DST!");
                return true;
            }
            if (station === "kjahwest" || station === "k-jah-west" || station === "k-jah" || station === "kjah") {
                // Play K-Jah West
                connection.play("http://gta-radio.tbt.wtf/k-jah-west");
                msg.reply("Playing K-JAH Radio West (K-JAH West)!");
                return true;
            }
            if (station === "master-sounds" || station === "mastersounds" || station === "98.3") {
                // Play Master Sounds
                connection.play("http://gta-radio.tbt.wtf/master-sounds");
                msg.reply("Playing Master Sounds 98.3!");
                return true;
            }
            if (station === "playback" || station === "playback-fm" || station === "playbackfm") {
                // Play Playback FM
                connection.play("http://gta-radio.tbt.wtf/playback-fm");
                msg.reply("Playing Playback FM!");
                return true;
            }
            if (station === "radio-los-santos" || station === "rls" || station === "radiolossantos") {
                // Play Radio Los Santos
                connection.play("http://gta-radio.tbt.wtf/radio-los-santos");
                msg.reply("Playing Radio Los Santos!");
                return true;
            }
            if (station === "radio:x" || station === "radio-x" || station === "radiox") {
                connection.play("http://gta-radio.tbt.wtf/radio-x");
                msg.reply("Playing Radio:X!");
                return true;
            }
            if (station === "sfur" || station === "sf-ur" || station == "sf:ur") {
                // Play SF-UR
                connection.play("http://gta-radio.tbt.wtf/sf-ur");
                msg.reply("Playing San Fierra Underground Radio (SF-UR)!");
                return true;
            }
            if (station === "wctr") {
                // Play WCTR
                connection.play("http://gta-radio.tbt.wtf/wctr");
                msg.reply("Playing West Coast Talk Radio (WCTR)!");
                return true;
            }

            msg.reply(`Sorry! I don't know a station named ${args[0]} :(`);

            return true;
        }
    });

    bot.registerCommand({
        name: "invite",
        description: "Get an invite link to add the bot to your server!",
        handler: (args, author, msg) => {
            msg.reply(`Add me with this link: https://discord.com/api/oauth2/authorize?client_id=${Config.get('client_id')}&permissions=${Config.get('permissions')}&scope=bot`);
            return true;
        }
    });

}