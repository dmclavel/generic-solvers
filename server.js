const express = require('express');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const dotenv = require('dotenv');
const pug = require('pug');
const path = require('path');

/** Variable declarations for Polynomial Regression **/
let dataFile = '', variableArray, errorRegression = null, errorEvaluating = null, headersRegression = [], xVariablesRegression = [], yVariablesRegression = [];
let regressionMatrix = [], regressionFnxString = '', regressionEvaluator = null, estimate = null;
/****************************************************/

/** Variable declarations for Quadratic Spline Interpolation **/
let variableArrayQSI, errorQSI = null, headersQSI = [], xVariablesQSI = [], yVariablesQSI = [];
let qsiEquations = [], qsiMatrix = [];
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

app.get('/qsi', (req, res) => {
    res.render('qsi', {
        title: 'Quadratic Spline Interpolation',
        headers: headersQSI,
        indepVars: xVariablesQSI,
        depVars: yVariablesQSI,
        qsiEquations,
        qsiMatrix,
        path: req.path,
        errorQSI
    });
});

app.post('/qsi/:id', (req, res) => {
    switch(req.path) {
        case '/qsi/perform':
            if (variableArrayQSI) {
                const quadraticSpline = require('./functions/quadratic-spline/quadInterpolate');
                quadraticSpline.quadraticInterpolate(yVariablesQSI, xVariablesQSI, (equations, matrix, gaussMatrix, error) => {
                    if (error)
                        errorQSI = error;
                    else {
                        errorQSI = null;
                        qsiEquations = [...equations, 'a1 = 0'];
                        qsiMatrix = matrix;
                    }
                });
            } else 
                errorQSI = 'Choose a csv file first!';
    }
    res.redirect("back");                   
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
                            errorRegression = null;
                            regressionMatrix = matrix;
                            regressionFnxString = functionString;
                            regressionEvaluator = evaluator;
                        }
                    });
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
                const readFile = require('./functions/file-reading/readcsv');
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
                        }
                        await readFile.readCsv(filename, 'regression', (varArray, pheader, pxvector, pyvector, error) => {
                            if (error)
                                errorRegression = error;
                            else {
                                error = null;
                                variableArray = varArray;
                                headersRegression = pheader;
                                xVariablesRegression = pxvector;
                                yVariablesRegression = pyvector;
                            } 
                        });
                        break;
                    case '/upload/postqsivars':
                        if (variableArrayQSI) {
                            /**Reinstantiate**/
                            headersQSI = [];
                            xVariablesQSI = [];
                            yVariablesQSI = [];
                            /*****************/
                        }
                        await readFile.readCsv(filename, 'qsi', (varArray, qheader, qxvector, qyvector, error) => {
                            if (error)
                                errorQSI = error;
                            else {
                                errorQSI = null;
                                variableArrayQSI = varArray;
                                headersQSI = qheader;
                                xVariablesQSI = qxvector;
                                yVariablesQSI = qyvector;
                            }
                        });
                        break;
                }
                /***********************/
                console.log('Upload Finished of ' + filename);

                res.redirect('back');
            });
        });
    });

// app.get('/profile', (req, res) => {
//     const person = people.profiles.find(p => p.id === req.query.id);
//     res.render('profile', {
//       title: `About ${person.firstname} ${person.lastname}`,
//       person,
//     });
//   });

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});