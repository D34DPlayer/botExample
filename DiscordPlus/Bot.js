'use strict';
const Discord = require("discord.js");
const Command = require("./Command");
const Errors = require("./Errors");
const Group = require("./Group");

/**
 * Truncates a string if it's length goes beyond the provided max value.
 * @param {string} str
 * @param {number} max
 * @return {string}
 */
function truncateStr(str, max) {
    if (str.length > max)
        return `${str.slice(0, max - 3)}...`;
    return str;
}

/**
 * Tests if a prefix is a function or a static string.
 * @param {PrefixResolvable} prefix
 */
function dynamicPrefix(prefix) {
    return !((typeof prefix) === 'string');
}

/**
 * Default error handler, can be replaced by a custom one with the same signature when creating a Bot.
 * @param {Discord.Message} message
 * @param  {Error} error
 */
function defaultErrorHandler(message, error) {
    throw error;
}

/**
 * Help command function, can be replaced by a custom Command when creating a Bot.
 * @param {Discord.Message} msg
 * @param {string} raw_args
 */
async function defaultHelpCommand(msg, raw_args) {
    if (msg.client instanceof Bot) {
        let bot = msg.client;
        let prefix;
        if (dynamicPrefix(bot.prefix))
            prefix = await bot.prefix(bot, msg);
        else
            prefix = bot.prefix;
        let title = "Commands";
        let description = `**Prefix:** ${prefix}`;
        let color = 0;
        let thumbnailUrl = bot.user.avatarURL();
        let fields = [];
        let maxLength = 60;
        let commandHolder = bot;
        let target;
        let counter = 2;
        let goOn = true;
        while (counter < arguments.length && goOn) {
            goOn = false;
            for (let command of commandHolder.commands) {
                if (command.name === arguments[counter]) {
                    if (!command.performChecks(msg, bot))
                        break;
                    if (command instanceof Group) {
                        commandHolder = command;
                        goOn = true;
                    }
                    else
                        target = command;
                    break;
                }
            }
            counter += 1;
        }
        if (!target)
            target = commandHolder;
        if ((target instanceof Command) && !(target instanceof Group)) {
            let field = { "name": `**${target.name} *${target.usage}* **`, "value": `${target.description}` };
            fields.push(field);
        }
        else {
            if (target instanceof Group) {
                title = target.name;
                description = target.description;
            }
            for (let command of target.commands) {
                let field = { "name": `**${command.name}**`, "value": `${truncateStr(command.description, maxLength)}` };
                try {
                    if (await command.performChecks(msg, bot))
                        fields.push(field);
                }
                catch (e) { }
            }
        }
        let embed = new Discord.MessageEmbed({ "title": title, "description": description, "color": color, "fields": fields });
        if (thumbnailUrl)
            embed.setThumbnail(thumbnailUrl);
        await msg.channel.send(embed);
    }
}

class Bot extends Discord.Client {

    /**
     * Extension of the Discord Client to make trivial the command addition, accepts all the options from its parent and a few more.
     * @param {BotOptions} options - the Discord.Client ones
     *                             - errorHandler : it will receive all the errors thrown during the command checks and execution.
     *                             - commands : array of Commands that will be added to the bot.
     *                             - helpCommand : Command to override the default one, true to just disable it.
     *                             - checks : global checks the bot will perform before any command.
     *                             - prefix : can be a static string or an async function that returns a string, can't contain a " ".
     *                             - owner : used by the isOwner check, which uses the bot application owner by default if this one isn't set.
     */
    constructor(options) {
        super(options);
        this.errorHandler = this.options.errorHandler || defaultErrorHandler;
        this.commands = this.options.commands || [];
        if (!this.options.helpCommand) {
            let helpCommand = new Command(defaultHelpCommand, "help", "group/command", "Ce message-ci.", [], false);
            this.addCommand(helpCommand);
        }
        else if (this.options.helpCommand instanceof Command)
            this.addCommand(this.options.helpCommand);
        this.checks = this.options.checks || [];
        if (!dynamicPrefix(this.options.prefix) && (this.options.prefix.includes(" "))) {
            throw new TypeError('The bot prefix can\'t contain a space and must be defined');
        }
        this.prefix = this.options.prefix;
        this.owner = this.options.botOwner || "";
    }

    /**
     * Add one check (or many) to the Bot ones.
     * @param {...Check} checks
     */
    addCheck(...checks) {
        for (let check of checks) {
            this.checks.push(check);
        }
    }

    /**
     * Add one Command (or many) to the Bot ones.
     * @param {...Command} commands
     */
    addCommand(...commands) {
        for (let command of commands) {
            this.commands.push(command);
        }
    }

    /**
     * Default message handler, will check if the prefix is there and pass it to the command handler if it is.
     * @param {Discord.Message} message
     */
    async on_message(message) {
        let prefix;
        if (dynamicPrefix(this.prefix))
            prefix = await this.prefix(this, message);
        else
            prefix = this.prefix;
        if (!message.author.bot && message.content.startsWith(prefix)) {
            let command_content = message.content.replace(prefix, "");
            let reply = await this._commandHandler(message, command_content, this);
            if (!reply)
                this.errorHandler(message, new Errors.CommandNotFound(""));
        }
    }

    /**
     * Handles the commands, parses the arguments and performs the checks, will work recursively if there are Groups.
     * @param {Discord.Message} message - Message calling the command.
     * @param {string} content - unparsed string, with the group calls removed in case there where any.
     * @param {Bot | Group} caller - The command holder we are going to look for commands in.
     * @param {string[]} past_args - The arguments parsed for the Group caller.
     * @return {boolean} - false if no command was found.
     * @private
     */
    async _commandHandler(message, content, caller, past_args = []) {
        let name = content.split(" ")[0];
        let raw_args = content.split(" ").slice(1).join(" ");
        let args = this._parseArgs(raw_args);
        if (caller instanceof Bot) {
            for (let check of this.checks) {
                if (!await check(message, this))
                    throw new Errors.CheckFailure('');
            }
        }
        for (let command of caller.commands) {
            if (command.name === name && await command.performChecks(message, this)) {
                if (command instanceof Group) {
                    return this._commandHandler(message, raw_args, command, args);
                }
                else {
                    if (command.definedArgCount) {
                        if (args.length < command.minArgs)
                            throw new Errors.MissingRequiredArguments("");
                        else if (args.length > command.maxArgs)
                            throw new Errors.TooManyArguments("");
                    }
                    await command.commandFunction(message, raw_args, ...args);
                    return true;
                }
            }
            else if (command.name === name) {
                throw new Errors.CheckFailure("");
            }
        }
        if (caller instanceof Group) {
            if (caller.definedArgCount) {
                if (args.length < caller.minArgs)
                    throw new Errors.MissingRequiredArguments("");
                else if (args.length > caller.maxArgs)
                    throw new Errors.TooManyArguments("");
            }
            await caller.commandFunction(message, raw_args, ...past_args);
            return true;
        }
        return false;
    }

    /**
     * Parses the arguments from a command message, uses spaces to separate them unless they are in quotes (") or are escaped (\),
     * use raw_args if you want to parse it on your own.
     * @param {string} argStr
     * @return {string[]}
     * @private
     */
    _parseArgs(argStr) {
        let argArr = [];
        let buffer = "";
        let inQuote = false;
        let escaped = false;
        let ready = false;
        for (let char of argStr) {
            if (escaped) {
                buffer += char;
                escaped = false;
            }
            else if (char === '"') {
                if (inQuote) {
                    ready = true;
                    inQuote = false;
                }
                else {
                    inQuote = true;
                }
            }
            else if (char === ' ' && !inQuote) {
                ready = true;
            }
            else if (char === "\\") {
                escaped = true;
            }
            else {
                buffer += char;
            }
            if (ready && buffer) {
                argArr.push(buffer);
            }
            if (ready) {
                ready = false;
                buffer = "";
            }
        }
        if (buffer) {
            argArr.push(buffer);
        }
        return argArr;
    }
}

module.exports = Bot;
