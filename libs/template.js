const Common = require('./common.js')
const Path = require('path')

/**
* has all the template information for generating the BOM
*/
Template = {
    template: null, // holds the template data for table group should be Template.Path/template.conf
    group: null, // holds the template data for table group should be Template.Path/group.conf
    row: null, // holds the template data for table rows should be Template.Path/row.conf
    header: null, // holds the template data for table headers should be Template.Path/headers.conf
    fields: null // holds the template data for fields should be Template.Path/fields.conf
}


/**
*   generice read function
*/
function LoadFile(fileToLoad) {

    return new Promise(function (resolve, reject) {
        Common.Message('Reading Template - ' + fileToLoad)
        // read out file
        require('fs').readFile(fileToLoad, 'utf8', function (error, result) {
            if (!error) {
                resolve(result)
            } else {
                reject('Error reading ' + fileToLoad)
            }
        })
    })
}

/**
* Hanlde reading the various template files needed to generate
* the bom
*/
async function LoadTemplateFiles (config) {
    return new Promise(async function (resolve, reject) {

        try{
            Template.template = await LoadFile(Path.join(config.templatePath, '/template.conf'));
            Template.group = await LoadFile(Path.join(config.templatePath, '/group.conf'));
            Template.header = await LoadFile(Path.join(config.templatePath, '/headers.conf'));
            Template.row = await LoadFile(Path.join(config.templatePath, '/row.conf'));
            Template.fields = await LoadFile(Path.join(config.templatePath, '/fields.conf'));

            resolve(Template);
        } catch(err){
            reject(error);
        }
    });
}

module.exports = {
    LoadTemplateFiles
}