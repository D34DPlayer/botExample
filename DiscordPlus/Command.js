'use strict';

class Command {

    /**
     * Wraps a function to hold other properties.
     * @param {Function} commandFunction - what the command does, takes the Message and the raw args as the two first arguments.
     * @param {string?} name - Name the command will be called by, can't contain a " ", the function's one by default.
     * @param {string?} usage - Used mostly by the help function, also gives the maxArgs value, the function signature by default.
     * @param {string} description - Used by the help function, empty by default.
     * @param {Check[]} checks - Array of the checks that must be fulfilled to execute the command function.
     * @param {boolean} definedArgCount - If the command sends an error if the amount of arguments goes under or over the range of the function,
     *                                    set it to false if you plan to parse the args yourself.
     * @constructor
     */
    constructor(commandFunction, name = "", usage = "", description = "", checks = [], definedArgCount = true) {
        this.commandFunction = commandFunction;
        this.description = description;
        this.checks = checks;
        this.definedArgCount = definedArgCount;
        if (!commandFunction) {
            throw new TypeError("A function must be given to the command");
        }
        if (!name || name.includes(" ")) {
            name = commandFunction.name;
        }
        if (!usage) {
            usage = this._parseArgs(commandFunction);
        }
        this.name = name;
        this.usage = usage;
        this.minArgs = commandFunction.length - 2;
        this.maxArgs = this.usage ? usage.split(" ").length : 0;
    }
    /**
     * To add a check (or many) to the Command after it's been initialized.
     * @param {Check[]}checks
     */
    addCheck(...checks) {
        for (let check of checks) {
            this.checks.push(check);
        }
    }

    /**
     * Performs all the checks of the Command, unless you throw a custom error inside the check it'll throw a CheckFailure.
     * @param {Discord.Message} message
     * @param {Bot} bot
     * @return {boolean}
     */
    async performChecks(message, bot) {
        for (let check of this.checks) {
            if (!await check(message, bot))
                return false;
        }
        return true;
    }

    /**
     * Gets the signature of a function given. (Without the first two arguments since they are the Message and raw_args,
     * use the raw_args if you want a custom parsing.
     * @param {Function} funct
     * @return {string} - has this form "var1 var2 [varWithDefaultValue]"
     * @private
     */
    _parseArgs(funct) {
        let string = funct.toString();
        let start = 0, stop = 0, inQuote = false, quote;
        for (let charIndex in string.split("")) {
            if (!start && string[charIndex] === '(') {
                start = Number(charIndex);
            }
            else if (start && !inQuote && string[charIndex].match(/["'`]/)) {
                quote = string[charIndex];
                inQuote = true;
            }
            else if (start && !inQuote && string[charIndex] === ')') {
                stop = Number(charIndex);
                break;
            }
            else if (start && inQuote && string[charIndex] === quote)
                inQuote = false;
        }
        let args = string.slice(start + 1, stop)
            .replace(/ /g, "")
            .replace(/,/g, " ")
            .split(" ");
        args = args.map((word) => word.includes("=") ? `[${word.split("=")[0]}]` : word);
        return args.slice(2).join(" ");
    }
}

module.exports = Command;
