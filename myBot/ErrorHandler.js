'use strict';

/*
    You can change the behavior depending on the Error type
 */

const { Errors } = require("../DiscordPlus");

async function on_error(msg, error) {
    if (error instanceof  Errors.CommandNotFound) {
        console.warn(`${msg.author.tag} > ${msg.content}`);
    }
    else if (error instanceof Errors.UserInputError)
        await msg.reply("Wrong syntax");
    else {
        console.error(error);
    }
}

exports.on_error = on_error;
