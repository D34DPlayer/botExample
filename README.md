# botExample
A bot example using my small framework

The aim of this framework is to take care of the message handling and allow the user to create commands with easy to understand classes.

It introduces 3 new classes:
- Bots (extension of Discord.Client to accept commands)
- Commands (holder for a the command function and other useful data)
- Groups (extension of Command that can hold other Commands to allow an easy command hierachy)

It uses Checks (`(Discord.Message, Bot) => Promise<Boolean>`) to decide if a discord user can use that specific command, 
and accepts errorHandlers, that will recieve the errors thrown during Checks and command execution to allow diferent responses defending
on the error type.

It comes with default help command that will only show the commands the user can use and uses the Command name, usage and description properties.
