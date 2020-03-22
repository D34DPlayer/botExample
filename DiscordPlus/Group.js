'use strict';
const Command = require("./Command");

class Group extends Command {

    /**
     * A Command that can hold other Commands, that will need to be called this way: "$groupName subCommandName *args", of course groups can be nested.
     * @params - same as Command
     * @param {Command[]} commands - Array of the Group sub-Commands
     */
    constructor(commandFunction, name = "", usage = "", description = "", checks = [], definedArgCount, commands = []) {
        super(commandFunction, name, usage, description, checks);
        this.definedArgCount = definedArgCount;
        this.commands = commands;
    }

    /**
     * To add a Command (or many) to the Group after it's been initialized.
     * @param {...Command} commands
     */
    addCommand(...commands) {
        for (let command of commands) {
            this.commands.push(command);
        }
    }
}

module.exports = Group;
