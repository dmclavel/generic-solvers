const rowDivision = (matrix, row, divisor) => {
    for (let i=0; i<matrix[row].length; i++) {
        if (i+1 === matrix[row].length) 
            matrix[row][i] = (matrix[row][i]/divisor);
        else
            matrix[row][i] = matrix[row][i]/divisor;
    }
};

const rowMultiplication = (matrix, row, factor, callback) => {
    const clonedMatrix = cloneMatrix(matrix);
    for (let i=0; i<matrix[row].length; i++) {
        clonedMatrix[row][i] = clonedMatrix[row][i] * factor;
    }
    callback([...clonedMatrix[row]]);
};

const rowSubtraction = (matrix, row, vector) => {
    for (let i=0; i < matrix[row].length; i++) {
        if (i+1 === matrix[row].length) 
            matrix[row][i] = (matrix[row][i] - vector[i]);
        else 
            matrix[row][i] = matrix[row][i] - vector[i];
    }
};

const cloneMatrix = matrix => {
    let clonedMatrix = [], temp = [];
    for (let i=0; i<matrix.length; i++) {
        for (let j=0; j<matrix[0].length; j++) {
            temp = [...temp, matrix[i][j]];
        }
        clonedMatrix[i] = temp;
        temp = [];
    }
    return clonedMatrix;
};

module.exports = {
    rowDivision,
    rowMultiplication,
    rowSubtraction
}