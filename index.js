const delimitadores = ['(', ')', '[', ']', '{', '}'];
const operadores = ['=', '!=', '>', '<', '>=', '<=', 'AND', 'OR', 'IN', 'NOT IN', '*'];
const palabrasReservadas = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'AND', 'OR', 'IN', 'NOT IN', 'INSERT', 'UPDATE',
    'DELETE', 'CREATE', 'ALTER', 'DROP', 'SET', 'VALUES', 'DISTINCT', 'AS', 'JOIN', 'INNER JOIN',
    'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'ON', 'GROUP BY', 'HAVING', 'CASE', 'WHEN', 'THEN',
    'ELSE', 'END', 'UNION', 'EXISTS'
];

function analizarQuery(query) {
    let tokens = [];
    let tokenActual = '';
    let dentroDeCadena = false;

    for (let i = 0; i < query.length; i++) {
        const caracter = query[i];

        if ((caracter === "'" || caracter === '"') && !dentroDeCadena) {
            // Inicia un string
            dentroDeCadena = true;
            tokenActual += caracter;
        } else if ((caracter === "'" || caracter === '"') && dentroDeCadena) {
            // Finaliza el string
            dentroDeCadena = false;
            tokenActual += caracter;
            tokens.push(`${tokenActual}: cadena`);
            tokenActual = '';
        } else if (dentroDeCadena) {
            // Si estamos dentro de un string agregar el caracter al token actual
            tokenActual += caracter;
        } else if (delimitadores.includes(caracter) || operadores.includes(caracter) || caracter === ' ' || caracter === '\t'
                    || caracter === '\n' || caracter === ',' || caracter === ';') {
            // Si encontramos un delimitador, operador o espacio fuera de una cadena
            if (tokenActual !== '') {
                tokens.push(obtenerTipoToken(tokenActual));
            }
            if (caracter === "'" || delimitadores.includes(caracter) || operadores.includes(caracter)) {
                tokens.push(`${caracter}: delimitador`);
            }
            tokenActual = '';
        } else {
            // Agregar el caracter al token actual
            tokenActual += caracter;
        }
    }

    // Agregar el ultimo token a la lista de tokens
    if (tokenActual !== '') {
        tokens.push(obtenerTipoToken(tokenActual));
    }
    return tokens;
}

function obtenerTipoToken(token) {
    if (palabrasReservadas.includes(token.toUpperCase())) {
        return `${token}: palabra reservada`;
    } else if (operadores.includes(token.toUpperCase())) {
        return `${token}: operador`;
    } else if (!isNaN(parseFloat(token)) && isFinite(token)) {
        return `${token}: numero`;
    } else {
        return `${token}: identificador`;
    }
}

const consultaSQL = 
`
SELECT * FROM usuarios WHERE nombre = 'Juan'
`;
const tokens = analizarQuery(consultaSQL);

console.log(`Consulta de entrada:\n${consultaSQL}`);
console.log("El lexico identifico los siguientes tokens:");
tokens.forEach(token => {
    console.log(token);
});
    