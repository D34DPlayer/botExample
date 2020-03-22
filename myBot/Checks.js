'use strict';

/*
    Checks decide if an user can run the command or not, return a boolean if you want to trigger the CheckFailure Error,
    or throw your own error. Add the new error classes in DiscordPlus/Errors and try to extend the class that fits it the most.

    Checks receive the command Message and the Bot as arguments.
 */

const { Errors } = require("../DiscordPlus");
const { User, Team} = require("discord.js");

function notPrivateMessage(msg, bot) {
    if (msg.channel.type === "dm") throw new Errors.NoPrivateMessage("");
    return true;
}

async function isOwner(msg, bot) {
    if (bot.owner && bot.owner !== msg.author.id) throw new Errors.NotOwner("");
    let app = await bot.fetchApplication();
    if (app.owner instanceof User && app.owner.id !== msg.author.id) throw new Errors.NotOwner("");
    if (app.owner instanceof Team && app.owner.ownerID !== msg.author.id) throw new Errors.NotOwner("");
    return true;
}

module.exports = {
    notPrivateMessage,
    isOwner
};
