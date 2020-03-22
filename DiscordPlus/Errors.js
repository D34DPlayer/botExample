'use strict';

/*
    Feel free to add custom errors here if needed, errors can also be give other properties if needed.
 */

class DiscordError extends Error{
    constructor(message) {
        super(message);
        this.name = "DiscordError";
    }
}
    class TimeoutError extends DiscordError{
        constructor(message) {
            super(message);
            this.name = "TimeoutError";
        }
    }
    class CommandError extends DiscordError{
        constructor(message) {
            super(message);
            this.name = "CommandError";
        }
    }
        class UserInputError extends CommandError{
            constructor(message) {
                super(message);
                this.name = "UserInputError";
            }
        }
            class MissingRequiredArguments extends UserInputError{
                constructor(message) {
                    super(message);
                    this.name = "MissingRequiredArguments";
                }
            }
            class TooManyArguments extends UserInputError{
                constructor(message) {
                    super(message);
                    this.name = "TooManyArguments";
                }
            }
            class BadArgument extends UserInputError{
                constructor(message) {
                    super(message);
                    this.name = "BadArgument";
                }
            }
            class CommandNotFound extends UserInputError{
                constructor(message){
                    super(message);
                    this.name = "CommandNotFound";
                }
            }
        class CheckFailure extends CommandError{
            constructor(message){
                super(message);
                this.name = "CheckFailure";
            }
        }
            class NoPrivateMessage extends CheckFailure{
                constructor(message){
                    super(message);
                    this.name = "NoPrivateMessage";
                }
            }
            class NotOwner extends CheckFailure{
                constructor(message){
                    super(message);
                    this.name = "NotOwner";
                }
            }

module.exports = {
    DiscordError,
    TimeoutError,
    CommandError,
    UserInputError,
    MissingRequiredArguments,
    TooManyArguments,
    BadArgument,
    CommandNotFound,
    CheckFailure,
    NoPrivateMessage,
    NotOwner
};
