const matrixOps = require('../matrix/matrixOperations');

const augMatrix = (matrix, callback) => {
    const N = matrix.length;    //row
    const gaussMatrix = gaussJordanElimination(matrix, N);
    const solutionSet = backwardSubstitution(gaussMatrix, N);
    
    evaluateFunctionString(solutionSet, (functionString, evaluator) => {
        callback(gaussMatrix, functionString, evaluator);
    });
};

const gaussJordanElimination = (augmentedMatrix, N) => {
    for (let i=0; i<N; i++){
        // pivot(augmentedMatrix, i);
        matrixOps.rowDivision(augmentedMatrix, i, augmentedMatrix[i][i]);
        for (let j=0; j<N; j++) {
            if (i !== j) {
                let NR;
                matrixOps.rowMultiplication(augmentedMatrix, i, augmentedMatrix[j][i], vectorRow => {
                    NR = vectorRow;
                });
                matrixOps.rowSubtraction(augmentedMatrix, j, NR);
            }
        }
    }
    return augmentedMatrix;
}; 

const pivot = (matrix, index) => {
    let largest, whichIndex; 
    for (let i=0; i<matrix.length-1; i++) {
        if(matrix[i][index] > matrix[i+1][index]) {
            largest = matrix[i][index];
            whichIndex = i;
        } else {
            largest = matrix[i+1][index];
            whichIndex = i+1;
        }
    }
    const temp = [...matrix[whichIndex]];
    matrix[whichIndex] = matrix[index];
    matrix[index] = temp;
};

const backwardSubstitution = (matrix, N) => {
    let solutionSet = [];

    for (let i=N-1; i>=0; i--) {
        solutionSet = [matrix[i][N], ...solutionSet];
    }
    return solutionSet;
};

const evaluateFunctionString = (solutionSet, callback) => {
    let functionString = "f(x) = ";
    let functionEvaluator = "function(x) { return ";
    for (let i=solutionSet.length-1; i>=0; i--) {
        if (i !== 0) {
            functionString = functionString + (solutionSet[i] + ` * ${i === 1 ? 'x' : `x^${i}`} + `);
            functionEvaluator = functionEvaluator + (solutionSet[i] + ` * ${i === 1 ? 'x' : `Math.pow(x,${i})`} + `);
        } else {
            functionString = functionString + (solutionSet[i]);
            functionEvaluator = functionEvaluator + (solutionSet[i]) + '; }';
        }
            
    }

    const evaluator = eval("("+functionEvaluator+")");
    callback(functionString, evaluator);
}

module.exports = {
    augMatrix,
    gaussJordanElimination
}