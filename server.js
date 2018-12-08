const express = require('express');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const dotenv = require('dotenv');
const pug = require('pug');
const people = require('./people.json');
const path = require('path');
const csv = require('csvtojson');
const regression = require('ml-regression-polynomial');

/** Variable declarations for Polynomial Regression **/
let dataFile = '', variableArray, errorRegression = null, errorEvaluating = null, headersRegression = [], xVariablesRegression = [], yVariablesRegression = [];
let regressionMatrix = [], regressionFnxString = '', regressionEvaluator = null, estimate = null;
/****************************************************/

dotenv.load();  //load environment variables
const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'pug');

app.use(busboy());
app.use(express.static(path.join(__dirname + '/public')));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Data Science',
        path: req.path
    });
});

app.get('/simplex', (req, res) => {
    res.render('simplex', {
        title: 'Minimization',
        data: dataFile === '' ? {} : require(dataFile),
        path: req.path
    });
});

app.get('/regression', (req, res) => {
    res.render('regression', {
        title: 'Polynomial Regression',
        headers: headersRegression,
        indepVars: xVariablesRegression,
        depVars: yVariablesRegression,
        matrix: regressionMatrix,
        functionString: regressionFnxString,
        evaluator: regressionEvaluator,
        path: req.path,
        errorRegression,
        errorEvaluating,
        estimate
    });
});

app.post('/regression/:id', (req, res) => {
    switch(req.path) {
        case '/regression/perform':
            if (variableArray) {
                const degree = parseInt(req.body.degreeOfPolynomial);
                if (xVariablesRegression.length > degree && degree > 0) {
                    regressionMatrix = [];
                    errorRegression = '';
                    const pr = require('./functions/regression/polynomialRegression');
                    pr.polynomialRegression(yVariablesRegression, xVariablesRegression, degree, (matrix, functionString, evaluator, error) => {
                        if (error)
                            errorRegression = error;
                        else {
                            regressionMatrix = matrix;
                            regressionFnxString = functionString;
                            regressionEvaluator = evaluator;
                            console.log(matrix);
                            console.log(functionString);
                            console.log(evaluator(1));
                        }
                    });
                    const pregression = new regression(xVariablesRegression, yVariablesRegression, degree);
                    console.log(pregression.toString(3));
                } else {
                    errorRegression = `Degree should be less than ${xVariablesRegression.length}`;
                }
            } else errorRegression = 'Choose a csv file first!';
            break;
        case '/regression/evaluate':
            if (regressionEvaluator) {
                estimate = regressionEvaluator(req.body.value_x);
                errorEvaluating = null;
            } else 
                errorEvaluating = 'Perform polynomial regression first!';
            console.log(`Estimate: ${estimate}`);
            break;
        default:
            break;
    }
    
    res.redirect("back");
});

app.route('/upload/:id')
    .post((req, res, next) => {
        let fstream;
        errorRegression = null;
        
        req.pipe(req.busboy);
        req.busboy.on('file', (fieldname, file, filename) => {
            console.log('Uploading: ' + filename);

            //Path where the file will be uploaded
            fstream = fs.createWriteStream(filename);
            file.pipe(fstream);
            fstream.on('close', async () => {
                // fs.createFileSync(filename + '.json');
                
                //csvtojson documentation
                await csv({
                    noheader: true,
                    trim: true,
                    headers: ["x", "y"]
                })
                .fromFile(filename)
                .then(jsonObj => {
                    variableArray = jsonObj;
                    // fs.writeFileSync(filename + '.json', JSON.stringify(jsonObj, null, 2));
                });

                switch(req.path) {
                    case '/upload/simplex':
                        
                        break;
                    case '/upload/postvariables':
                        if (variableArray) {
                            /**Reinstantiate**/
                            headersRegression = [];
                            xVariablesRegression = [];
                            yVariablesRegression = [];
                            /*****************/
                            for (let i=0; i<variableArray.length; i++) {
                                for (let key in variableArray[i]) {
                                    if (!headersRegression.includes(key))
                                        headersRegression = [...headersRegression, key];
                                    if (key === 'x')
                                        xVariablesRegression = [...xVariablesRegression, variableArray[i][key]];
                                    else if (key === 'y')
                                        yVariablesRegression = [...yVariablesRegression, variableArray[i][key]];
                                }
                            }
                        }
                        break;
                }
                /***********************/
                console.log('Upload Finished of ' + filename);

                res.redirect('back');
            });
        });
    });

app.get('/profile', (req, res) => {
    const person = people.profiles.find(p => p.id === req.query.id);
    res.render('profile', {
      title: `About ${person.firstname} ${person.lastname}`,
      person,
    });
  });
  
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});