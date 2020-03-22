'use strict';

/*
    I'd add the events here, you can also call the bot.on_message inside a different function to perform any stuff with
    the messages before or after checking they are commands.
 */

const { bot } = require("./myBot/Commands");

function on_ready() {
    console.log(`Connected to discord as ${bot.user.tag}`);
}

bot.on('ready', on_ready);

bot.on('message', bot.on_message);

bot.login('token');
