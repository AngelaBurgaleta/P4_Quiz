
const figlet = require('figlet');
const chalk = require('chalk');
/**
 * Dar color a un string.
 *
 * @param msg Es string al que hay que dar color
 * @param color El color del que se quiere pintar
 * @returns {string} Devuelve el string con el msg a color
 */

const colorize = (msg, color) => {

    if(typeof color !== "undefined"){
        msg=chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribe un msg de log
 *
 * @oaram msg El string a escribir
 * @param color Color del texto
 */

const log = (msg, color) => {
    console.log(colorize(msg, color));
};

/**
 * Escribe un msg de log grande
 *
 * @param msg El string
 * @param color Color del texto
 */
const biglog = (msg, color) =>{
    log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};




/**
 * Escribe el msg de error emsg
 *
 * @param emsg Texto del msg de error
 */

const errorlog = (emsg) => {
    console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"),"bgYellow")}`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};