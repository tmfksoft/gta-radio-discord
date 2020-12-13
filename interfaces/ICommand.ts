import Discord from 'discord.js';

interface ICommandArgument {
    name: string,
    type: string,
    optional: boolean,
}
export default interface ICommand {
    name: string,
    description: string,
    arguments?: ICommandArgument[],
    handler: (args: string[], author: Discord.User, message: Discord.Message) => boolean | Promise<boolean>,
}