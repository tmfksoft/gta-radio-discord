import Discord from 'discord.js';
import Config from 'config';
import ICommand from './interfaces/ICommand';
import Commands from './commands';

class DiscordBot {
    private client: Discord.Client;
    private commands: { [key: string]: ICommand } = {};
    private voiceConnections: Discord.VoiceConnection[] = [];

    constructor() {
        this.client = new Discord.Client();
    }

    async start() {
        await this.client.login(Config.get('loginToken'));

        if (this.client.user) {
            this.client.user?.setPresence({
                status: "online",
                afk: false,
                activity: {
                    name: "GTA:SA Radio",
                    type: "PLAYING",
                }
            });
        }

        this.client.on('message', async (msg) => {
            // Ignore my own messages
            if (msg.author === this.client.user) {
                return;
            }

            if (msg.content[0] === Config.get('commandTrigger')) {
                const ex = msg.content.split(" ");
                const commandName = ex[0].toLowerCase().substr(1);
                console.log(`Checking for command '${commandName}'`);
                console.log(this.commands);
                if (this.commands[commandName]) {
                    const command = this.commands[commandName];

                    console.log(`Calling command '${commandName}'`);
                    const args = ex.slice(1);
                    let ret = command.handler(args, msg.author, msg);

                    // Hacky way to deal with Promise handlers as well as regular..
                    if (ret instanceof Promise) {
                        ret = await ret;
                    }

                    if (!ret) {
                        // Tell them the arguments
                        const argList: string[] = [];
                        if (command.arguments) {
                            for (let a of command.arguments) {
                                if (a.optional) {
                                    argList.push(`[${a.name}:${a.type}]`);
                                } else {
                                    argList.push(`{${a.name}:${a.type}}`);
                                }
                            }
                        }
                        msg.channel.send(`!${commandName} ${argList.join(" ")}`);
                    }
                }
            }
        });

        Commands(this);

        console.log(`Authorization URL https://discord.com/api/oauth2/authorize?client_id=${Config.get('client_id')}&permissions=${Config.get('permissions')}&scope=bot`);
    }

    registerCommand(command: ICommand) {
        const name = command.name.toLowerCase();
        if (!this.commands[name]) {
            this.commands[name] = command;
            console.log(`Registered command ${name}`, command);
        } else {
            throw Error(`Command ${name} already exists!`);
        }
    }
    getCommands(): { [key:string]: ICommand } {
        return this.commands;
    }

    getDiscord(): Discord.Client {
        return this.client;
    }
    registerVoiceConnection(conn: Discord.VoiceConnection) {
        this.voiceConnections.push(conn);
        conn.on('disconnect', ev => {
            this.voiceConnections.splice(this.voiceConnections.indexOf(conn), 1);
        })
    }
    getVoiceConnections(): Discord.VoiceConnection[] {
        return this.voiceConnections;
    }
    getVoiceConnection(guild: Discord.Guild): Discord.VoiceConnection | null {
        for (let chan of guild.channels.cache.array()) {
            const channelId = chan.id;
            for (let vc of this.voiceConnections) {
                if (vc.channel.id === channelId) {
                    return vc;
                }
            }
        }
        return null;
    }
}
const bot = new DiscordBot();
bot.start();

export default DiscordBot;
export { DiscordBot, bot };