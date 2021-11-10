const Common = require('./common.js')
const Path = require('path');

/**
* defaults options
*/
var Config = {
    OptionFilePath: null, // internal set
    CurrentWorkingPath: null,
    TemplateFolder: null,
    version: 1,
    outputType: process.env.OUTPUT_FILE_TYPE ? process.env.OUTPUT_FILE_TYPE : "FILE", // FILE or PDF
    templatePath: process.env.OUTPUT_TEMPLATE_PATH ? process.env.OUTPUT_TEMPLATE_PATH : "HTML",
    tempFilePath: null, // holds the where we will savet he temp file while we run our process. note this is usually where the template folder is located
    keepTempFile: false, // if treu then the tempfile that is generated is not deleted
    output: "",
    input: { path: null, ext: null, basename: null },          // This is the project KiCad file to use to  extract the BOM information
    pdfOptions: {
        showPage: false,  // DEBUG: if set to true, then it will display PDF page for 3secods.
        pageSize: "A4",
        printBackground: false,
        landscape: false,
        marginsType: 0
    },
    sort: { by: 'ref', ascending: true }  // possible ref, qty, value, value_num, footprint, datasheet
}

function Init(currentWorkingPath, defaultTemplatePath) {
    Config.CurrentWorkingPath = currentWorkingPath;
    Config.TemplateFolder = defaultTemplatePath;
    return this;
}

/**
* validates and return a full path regatherless if its a folder or file.
* this function will handle relative and abosolute paths.
*
* NOTE: will test for in this order
*
*   - exports.CurrentWorkingPath/@source
*   - (only if avaliable) Config.OptionFilePath/@source
*   - exports.TemplateFolder/@source
*   - abosolute
*/
function ValidateAndReturnPath(source, isDirectory) {
    var Result = null
    //var Exist = exports.FileExist

    if (!Config.CurrentWorkingPath) {
        Common.Error('script current working path is empty')
    }

    if (!Config.TemplateFolder) {
        Common.Error('template path is empty')
    }

    if (Common.PathExist(Path.join(Config.CurrentWorkingPath, source), isDirectory)) {
        // could be relative to where the script was called from
        Result = Path.join(Config.CurrentWorkingPath, source)
    } else if (Config.OptionFilePath && Common.PathExist(Path.join(Config.OptionFilePath, source), isDirectory)) {
        // if the option file was used then check if the given path is relative to the option file
        Result = Path.join(Config.OptionFilePath, source)
    } else if (Common.PathExist(Path.join(Config.TemplateFolder, source), isDirectory)) {
        // the given path could be inside the default template folder
        Result = Path.join(Config.TemplateFolder, source)
    } else if (Common.PathExist(source, isDirectory)) {
        // the given path could be abosolute
        Result = source
    }

    if (!Result) {
        // fail if the path isn't valid
        Common.Error('Directory or file not found - ' + source)
    }

    return Result
}

/**
* this function is meant to validate the output type selection
*/
function ValidateOutputTypeSelection(type) {
    if (!type) {
        return Common.Error('output type option not set')
    }
    type = type.toUpperCase()

    switch (type) {
        case 'FILE':
        case 'PDF':
            // these are valid types
            break;
        default:
            return Common.Error('unknow file formate - ' + format)

    }
    // return the validated and process ouput format
    return type
}

/**
* validate and override the PDF default options.fail save
    * /
function ValidateAndSetPDFOptions(options) {
    if (options) {
        if (options.showPage) {
            Config.pdfOptions.showPage = true
        }

        if (options.pageSize) {
            Config.pdfOptions.pageSize = options.pageSize
        }

        if (options.printBackground) {
            Config.pdfOptions.printBackground = true
        }

        if (options.landscape) {
            Config.pdfOptions.landscape = true
        }

        if (options.marginsType) {
            Config.pdfOptions.marginsType = options.marginsType
        }
    }
}

/**
* Handle loading the version 1 options files
*/
function LoadVersionTwoOption(options) {

    // check if we need to enable verbose
    if (options.verbose) {
        Common.Verbose = true
    }

    Config.input.path = ValidateAndReturnPath(options.input)
    Config.input.ext = Path.extname(Config.input.path)
    Config.input.basename = Path.basename(Config.input.path, Config.input.ext)

    Config.templatePath = ValidateAndReturnPath(options.templatePath, true)
    Config.outputType = ValidateOutputTypeSelection(options.outputType)

    // if the output type of PDF then we need to validate the PDF options
    if (Config.outputType === 'PDF') {
        ValidateAndSetPDFOptions(options.pdfOptions)
        Config.tempFilePath = Path.join(Config.templatePath, '.tempExportData')
    }


    // set the output default values just incase the user doesn't set them
    Config.output = { path: null, basename: Config.input.basename + '_bom', ext: '' }
    Config.output.path = Path.join(Path.dirname(Config.input.path), Config.output.basename + Config.output.ext)

    // check if the user has given us an output name
    if (options.outputName && options.outputName !== "" && options.outputName !== " ") {
        // get the extension name if it has one
        Config.output.ext = Path.extname(options.outputName)
        Config.output.basename = Path.basename(options.outputName, Path.extname(options.outputName))
    }

    if (options.outputPath && options.outputPath !== "" && options.outputPath !== " ") {
        // if the user has give us a path to use then validate it
        options.outputPath = ValidateAndReturnPath(options.outputPath, true)
        Config.output.path = Path.join(options.outputPath, Config.output.basename + Config.output.ext)
    }

    if (options.sort && options.sort.by && typeof options.sort.by === 'string') {
        Config.sort.by = options.sort.by.toLowerCase()
    }

    if (options.sort && options.sort.ascending === false) {
        Config.sort.ascending = false
    }

    if (options.keepTempFile) {
        Config.keepTempFile = true
    }
}

/**
* This handle getting the system options vai process aguments
*/
function LoadOld(parameter) {

    // keep backwards compatibily so make sure that we show the verbose
    Common.Verbose = true

    if (!parameter[2]) {
        Common.Error('input file parameter is missing')
    }

    if (!parameter[3]) {
        Common.Error('output file parameter is missing')
    }
    Config.input.path = ValidateAndReturnPath(parameter[2])
    Config.input.ext = Path.extname(Config.input.path);
    Config.input.basename = Path.basename(Config.input.path, Config.input.ext)

    Config.output = { path: '', basename: '', ext: '' }
    Config.output.ext = Path.extname(parameter[3])
    Config.output.basename = Path.basename(parameter[3], Config.output.ext)

    // check if the output folder exsist and return the full path
    Config.output.path = ValidateAndReturnPath(Path.dirname(parameter[3]), true)

    // now make sure that it includes the filename in the path
    Config.output.path = Path.join(Config.output.path, Config.output.basename + Config.output.ext)


    Config.outputType = 'FILE'

    // check if user has given us a path to use if not then use the default one
    if (parameter[4]) {
        Config.templatePath = ValidateAndReturnPath(parameter[4], true)
    } else {
        if ( Config.output.ext.toUpperCase() == ".CSV" ){
            Config.templatePath = ValidateAndReturnPath('CSV', true);
        } else {
            Config.templatePath = ValidateAndReturnPath('HTML', true);
        }
    }
    return Config
}

/**
* Handle loading the options from the given path
*
* @return on success returns the laoded config
*/
function Load(inputFile) {
    if (inputFile && inputFile.toUpperCase().indexOf('JSON') > -1) {
        var PathTemp = ValidateAndReturnPath(inputFile)

        if (PathTemp) {
            // get the absolute path from the option file
            Config.OptionFilePath = Path.dirname(Path.resolve(PathTemp))

            // load the options
            var Files = require('fs')

            try {
                var OptionTemp = JSON.parse(Files.readFileSync(PathTemp, 'utf8'))
            } catch (error) {
                Common.Error('unabled to read option file - ' + PathTemp, error)
            }

            if (!OptionTemp.input) {
                // input file is missing
                Common.Error('input file is missing from ' + Path.basename(PathTemp))
            }

            if (!OptionTemp.version) {
                Common.Error('option file has no version number')
            }

            Config.version = parseInt(OptionTemp.version)

            switch (Config.version) {
                case 2:
                    LoadVersionTwoOption(OptionTemp)
                    break;
                default:
                    Common.Error('option file version is not supported. found: ' + Config.version)
                    break;
            }
            return Config
        }
    }

    return null
}

module.exports = {
    Init,
    Load,
    LoadOld,
}