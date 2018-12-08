const polynomialRegression = (depVariableVector, indepVariableVector, degreeOfPolynomial, callback) => {
    if (degreeOfPolynomial < 1) 
        callback(null, null, null, 'Degree should be greater than zero!');
    if (depVariableVector.length !== indepVariableVector.length)
        callback(null, null, null, 'The length of the x and y variables should be equal!');
    
    let dataPoints = depVariableVector.length;
    let tempArray = [], rhsArray = [];

    for (let i=0; i<degreeOfPolynomial+1; i++) {
        let startingExponent = i;
        for (let j=0; j<degreeOfPolynomial+2; j++) {
            let sum = 0;
            if (i===0 && j===0) {
                tempArray = [...tempArray, dataPoints];
                startingExponent += 1;
            } else {
                if (j !== degreeOfPolynomial + 1) {
                    for (let summation=0; summation < dataPoints; summation++) {
                        sum += Math.pow(parseInt(indepVariableVector[summation]), startingExponent);
                    }
                    tempArray = [...tempArray, sum];
                    startingExponent += 1;
                } else { //RHS
                    if (i===0 && j===degreeOfPolynomial+1) { //x is just 1
                        for (let summation=0; summation < dataPoints; summation++) {
                            sum += parseInt(depVariableVector[summation]);
                        }
                        rhsArray = [...rhsArray, sum];
                    } else {
                        for (let summation=0; summation < dataPoints; summation++) {
                            sum += (Math.pow(parseInt(indepVariableVector[summation]), i) * parseInt(depVariableVector[summation]));
                        }
                        rhsArray = [...rhsArray, sum];
                    }
                }
            }
        }
    }
    const matrix = twoDimensional(tempArray, rhsArray);
    require('./regressionUtils').augMatrix(matrix, (gaussMatrix, functionString, evaluator) => {
        callback(gaussMatrix, functionString, evaluator, null);
    });
      
}

const twoDimensional = (tempArray, rhsArray) => {
    let matrix = [], temp = [], index = 0;
    for (let i=0; i<tempArray.length; i+=Math.sqrt(tempArray.length)) {
        for (let j=i; j<i+Math.sqrt(tempArray.length); j++) {
            temp = [...temp, tempArray[j]];
            if (j+1 === i+Math.sqrt(tempArray.length))
                temp = [...temp, rhsArray[index]];
        }
        matrix[index] = temp;
        index++;
        temp = [];
    }
    return matrix;
}

module.exports = {
    polynomialRegression
}