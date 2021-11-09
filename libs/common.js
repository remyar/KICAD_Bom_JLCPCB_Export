
/**
* if set to true then it will debug output message
*/
let Verbose = process.env.VERBOSE == "true" ? true : false;

async function FileExist(path) {
    // first check if directory exist
    var fs = require('fs');
    try {
        if (fs.statSync(path).isFile()) {
            return true
        }
    } catch (ex) {
        // we can ignore the error message
    }

    return false
}

function PathExist(path, isDirectory) {
    // first check if directory exist
    var fs = require('fs');
    try {
        if (isDirectory) {
            if (fs.statSync(path).isDirectory()) {
                return true
            }
        } else {
            if (fs.statSync(path).isFile()) {
                return true
            }
        }
    } catch (ex) {
        // we can ignore the error message
    }
    return false;
}

async function Message(message, data, verbose) {
    if (verbose || Verbose) {
        if (data) {
            console.log(message.toUpperCase() + "\n\n", data, "\n\n")
        } else {
            console.log(message)
        }
    }
}

async function Error(message) {
    var MessageTemp = '** Error **\n\t' + message + '\n\n'
    console.trace(MessageTemp)
    process.exit(1)
}

module.exports = {
    Message,
    Error,
    PathExist,
    FileExist
}