const {twoDimensional} = require('../regression/polynomialRegression');

const quadraticInterpolate = (depVariable, indepVariable, callback) => {
    if (depVariable.length !== indepVariable.length)
        callback(null, null, 'Not equal length of x and y!');

    const dataPoints = depVariable.length;
    const intervals = depVariable.length - 1;
    const equations = 3 * intervals;
    let fxnContainer = [];

    for (let i=2; i<=intervals; i++) {
        const fxnString1 = `${Math.pow(indepVariable[i-1], 2)} * a${i-1} + ${indepVariable[i-1]} * b${i-1} + c${i-1} = ${depVariable[i-1]}`;
        const fxnString2 = `${Math.pow(indepVariable[i-1], 2)} * a${i} + ${indepVariable[i-1]} * b${i} + c${i} = ${depVariable[i-1]}`;
        if (!(fxnContainer.includes(fxnString1) && fxnContainer.includes(fxnString2)))
            fxnContainer = [...fxnContainer, fxnString1, fxnString2];
    }
    fxnContainer = [...fxnContainer,
        `${Math.pow(indepVariable[0], 2)} * a1 + ${indepVariable[0]} * b1 + c1 = ${depVariable[0]}`,
        `${Math.pow(indepVariable[intervals], 2)} * a${intervals} + ${indepVariable[intervals]} * b${intervals} + c${intervals} = ${depVariable[intervals]}`
    ];
    for (let i=2; i<= intervals; i++) {
        const fxnString1 = `${2 * indepVariable[i-1]} * a${i-1} + 1 * b${i-1} + -${2 * indepVariable[i-1]} * a${i} + -1 * b${i} = 0`;
        fxnContainer = [...fxnContainer, fxnString1];
    } 
    formMatrix(fxnContainer, equations, (matrix) => {
        const clonedMatrix = [...matrix];
        for (let i=0; i<matrix.length; i++) //deep cloning
            clonedMatrix[i] = [...matrix[i]];

        require('../regression/regressionUtils').gaussJordanElimination(clonedMatrix, clonedMatrix.length);
        console.log(clonedMatrix);
        callback(fxnContainer, matrix, clonedMatrix, null);
    });
}

const formMatrix = (fxnContainer, equations, callback) => {
    let matrix = [], tempArray = [], rhsArray = [], spt;
    for (let i=0; i<fxnContainer.length; i++) {
        const fxnTokens = fxnContainer[i].split(" ");
        tempArray = [...initializeRow(equations)];
        for (let j=0; j<fxnTokens.length; j++) {
            if (fxnTokens[j].includes('a')) {
                spt = fxnTokens[j].split("");
                if (spt[1] !== '1') {
                    const index = 2 + (3 * (parseInt(spt[1]) - 2));
                    tempArray[index] = parseFloat(fxnTokens[j-2]);
                }
            } else if (fxnTokens[j].includes('b')) {
                spt = fxnTokens[j].split("");
                const index = 0 + (3 * (parseInt(spt[1]) - 1));
                tempArray[index] = parseFloat(fxnTokens[j - 2]);
            } else if (fxnTokens[j].includes('c')) {
                spt = fxnTokens[j].split("");
                const index = 1 + (3 * (parseInt(spt[1]) - 1));
                tempArray[index] = 1;
            } else if (fxnTokens[j] === '=') {
                rhsArray = [...rhsArray, parseFloat(fxnTokens[j+1])];
            }
                //b=0, c=1, || a=2 b=3 c=4 || a=5 b=6 c=7 || a=8 b=9 c=10
              // 1    1       2   2   2      3   3   3      4   4   4
        }
        matrix[i] = tempArray;
        
    }
    for (let i=0; i<matrix.length; i++)
        matrix[i] = [...matrix[i], rhsArray[i]];
    callback(matrix);
}

const initializeRow = (equations) => {
    let array = [];
    for (let i=0; i<equations-1; i++)
        array = [...array, 0];
    return array;
}

module.exports = {
    quadraticInterpolate,
    formMatrix
}