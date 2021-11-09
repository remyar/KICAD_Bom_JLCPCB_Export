try {
    require('xml2js');
    require('dotenv').config();

    RunProcess();

} catch (e) {
    console.log('depdencies are missing. Please wait while they are installed.');

    const { exec } = require('child_process');

    // install the missing depdencies
    exec('npm install', { cwd: __dirname }, function (error, stdout, stderror) {
        if (error) {
            console.error(error)
            return;
        }
        // Run main BOM process
        RunProcess()
    });
}

async function RunProcess() {
    const Path = require('path');
    const Common = require('./libs/common.js');
    const ConfigClass = require('./libs/configuration.js').Init(process.cwd(), Path.join(__dirname, '/Template/'));
    const ComponentsClass = require('./libs/component.js');
    const templateClass = require('./libs/template.js');
    const ExportClass = require('./libs/export.js');

    Common.Message('KiCad_BOM_JLCPCB_Wizard Rev: ' + (process.env.PLUGIN_VERSION ? process.env.PLUGIN_VERSION : '0.0.0'));

    Configuration = ConfigClass.Load(process.argv[2]);

    // if the options were loaded the exist
    if (!Configuration) {
        // No options file given so try the system argument parameters
        Configuration = ConfigClass.LoadOld(process.argv);

        if (!Configuration) {
            Common.Error("Unkown load error:");
        }
    }

    Common.Message("BOM Configuration:", Configuration);

    try{
        let ComponentsData = await ComponentsClass.LoadAndProcessComponentList(Configuration);
        let TemplateData = await templateClass.LoadTemplateFiles(Configuration);
        let Export = await ExportClass.CreateBOM(Configuration, ComponentsData, TemplateData);
    
        // BOM is now complete
        Common.Message(Export, null, true)
    } catch(err){
        Common.Error(err);
    }
   
}