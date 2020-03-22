'use strict';

/*
    Here I'd create the bot, import stuff from other files and export the bot with all the commands and default checks added.
 */

const DiscordPlus = require("../DiscordPlus");
const { on_error } = require("./ErrorHandler");
const Admin = require("./AdminCommands");
const Regular = require("./RegularCommands");
const { notPrivateMessage } = require("./Checks");

exports.bot = new DiscordPlus.Bot({prefix: "$",
                                   errorHandler: on_error,
                                   botOwner: "258591131758100481"});

exports.bot.addCommand(Admin.adminGroup,
               Regular.message);

exports.bot.addCheck(notPrivateMessage);
