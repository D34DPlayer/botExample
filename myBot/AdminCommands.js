'use strict';

const DiscordPlus = require("../DiscordPlus");
const { isOwner } = require("./Checks");

// What the group will do if no sub-command is found, and the group checks are passed.
async function _admin(msg, raw_args) {
    await msg.reply("Use `help admin`");
}

// With groups it's always better to set the definedArgCount to false.
exports.adminGroup = new DiscordPlus.Group(_admin, 'admin', '', 'Admin Commands', [isOwner], false);

async function _message(msg, raw_args) {
    await msg.channel.send(`Bot says: *${raw_args}*`)
}

// The group checks are performed before checking the inner commands so you don't have to add them here too.
// Here we will use the raw_args so we set the definedArgCount to false.
let message = new DiscordPlus.Command(_message, "message", "[your message]", "Repeats everything you.",[],false);

exports.adminGroup.addCommand(message);
