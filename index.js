const readline = require('readline');
const fs = require('fs').promises; // Utiliza promesas para fs para simplificar el manejo asincrónico
const filePath = 'sqlkeywords.txt';
const delimitadores = ['(', ')', '[', ']', '{', '}'];
const operadores = ['=', '!=', '>', '<', '>=', '<=', 'AND', 'OR', 'IN', 'NOT IN', '*'];
const palabrasReservadas = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'AND', 'OR', 'IN', 'NOT IN', 'INSERT', 'UPDATE',
    'DELETE', 'CREATE', 'ALTER', 'DROP', 'SET', 'VALUES', 'DISTINCT', 'AS', 'JOIN', 'INNER JOIN',
    'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'ON', 'GROUP BY', 'HAVING', 'CASE', 'WHEN', 'THEN',
    'ELSE', 'END', 'UNION', 'EXISTS'
];
const tokensNum = [];

async function analizarQuery(query) {
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
            tokensNum.push(`${tokenActual} = > 2222`); // numero 2222 para cadenas
            tokens.push(`${tokenActual}: cadena`);
            tokenActual = '';
        } else if (dentroDeCadena) {
            // Si estamos dentro de un string agregar el caracter al token actual
            tokenActual += caracter;
        } else if (delimitadores.includes(caracter) || operadores.includes(caracter) || caracter === ' ' || caracter === '\t'
            || caracter === '\n' || caracter === ',' || caracter === ';') {
            // Si encontramos un delimitador, operador o espacio fuera de una cadena
            if (tokenActual !== '') {
                tokens.push(await obtenerTipoToken(tokenActual));
            }
            if (caracter === "'" || delimitadores.includes(caracter) || operadores.includes(caracter)) {
                await obtenerTokenNum(caracter);
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
        tokens.push(await obtenerTipoToken(tokenActual));
    }
    return tokens;
}

async function obtenerTokenNum(token) {
    const lines = (await fs.readFile(filePath, 'utf-8')).split('\n');

    lines.forEach((line, index) => {
        if (line.trim()) {
            line = line.replace(/\s/g, ''); // regex para eliminar espacios vacios
            lineNum = line.split(':')[0];
            lineSymbol = line.split(':')[1];
            lineToken = '';
            lineToken = line.split(':')[1].replace(/\,|"/g, ''); // regex para eliminar "" y coma si el token NO es un simbolo
            if (lineSymbol === token) { // si es un simbolo lo guardamos de una
                tokensNum.push(`${token} = > ${lineNum}`);
            } else if (lineToken === token) { // si no es un simbolo se guarda el token sin comillas ni comas
                tokensNum.push(`${token} = > ${lineNum}`);
            }
        }
    });
}

async function obtenerTipoToken(token) {
    if (palabrasReservadas.includes(token.toUpperCase())) {
        await obtenerTokenNum(token);
        return `${token}: palabra reservada`;
    } else if (operadores.includes(token.toUpperCase())) {
        await obtenerTokenNum(token);
        return `${token}: operador`;
    } else if (!isNaN(parseFloat(token)) && isFinite(token)) {
        tokensNum.push(`${token} = > 1111`); //numero 1111 para valores numericos
        return `${token}: numero`;
    } else {
        tokensNum.push(`${token} = > 999`); // numero 999 para identificadores
        return `${token}: identificador`;
    }
}

async function guardarTokensNumericos() {
    try {
        const result = tokensNum.join('\n');
        await fs.writeFile('tokenNumerico.txt', result);
        console.log('Tokens numericos guardados en tokenNumerico.txt');
    } catch (error) {
        console.error('Error al guardar los tokens numericos:', error);
    }
}

async function main() {
    const consultaSQL = `
        SELECT * FROM usuarios WHERE nombre = 'Juan' 15.5
    `;
    const tokens = await analizarQuery(consultaSQL);
    console.log(`Consulta de entrada:\n${consultaSQL}`);
    console.log("El lexico identifico los siguientes tokens:");
    tokens.forEach((token)=>
        console.log('\t'+token));
    console.log('\nTambien se identificaron los siguientes tokens numericos:');
    tokensNum.forEach(t => console.log('\t'+t));
    await guardarTokensNumericos(); // funcion para guardar los tokens numericos
}

main();