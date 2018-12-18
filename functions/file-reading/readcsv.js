const csv = require('csvtojson');

const readCsv = async (filename, solverType, callback) => {
    let variableArray, headers = [], xVariables = [], yVariables = [];
    await csv({
        noheader: true,
        trim: true,
        headers: ["x", "y"]
    })
    .fromFile(filename)
    .then(jsonObj => {
        switch(solverType) {
            case 'regression':
                variableArray = jsonObj;
                for (let i=0; i<variableArray.length; i++) {
                    for (let key in variableArray[i]) {
                        if (!headers.includes(key))
                            headers = [...headers, key];
                        if (key === 'x')
                            xVariables = [...xVariables, variableArray[i][key]];
                        else if (key === 'y')
                            yVariables = [...yVariables, variableArray[i][key]];
                    }
                }
                if (headers.length > 2)
                    callback(null, null, null, null, 'Unrecognized file format!')
                else
                    callback(variableArray, headers, xVariables, yVariables, null);
                break;
            case 'qsi':
                variableArray = jsonObj;
                for (let i=0; i<variableArray.length; i++) {
                    for (let key in variableArray[i]) {
                        if (!headers.includes(key))
                            headers = [...headers, key];
                        if (key === 'x')
                            xVariables = [...xVariables, variableArray[i][key]];
                        else if (key === 'y')
                            yVariables = [...yVariables, variableArray[i][key]];
                    }
                }
                if (headers.length > 2)
                    callback(null, null, null, null, 'Unrecognized file format!')
                else 
                    callback(variableArray, headers, xVariables, yVariables, null);
                
                break;
            default:
                break;
        }
    });
}

module.exports = {
    readCsv
}