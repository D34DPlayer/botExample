'use strict';

const DiscordPlus = require("../DiscordPlus");

async function _message(msg, raw_args, optionalArgument = 1) {
    await msg.channel.send(`Bot says: *${optionalArgument}*`)
}

exports.message = new DiscordPlus.Command(_message, "message", "", "Repeats what you say.");
