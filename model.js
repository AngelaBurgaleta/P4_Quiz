const fs = require("fs");

//Nombre del fichero donde se guardan las preguntas
//Es un fichero de texto con el JSON de quizzes
const DB_FILENAME = "quizzes.json";



//Modelo de datos
//
//En esta variable se mantienen todos los quizzes existentes.
//es un array de objetos, donde cada objeto tiene los atributos en cuestion
//y answer para guardar el texto de la pregunta y la respueta
let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    }
];

/**
 * Este metodo carga el contenido del fichero DB en la variable quizzes.
 * Su formato es JSON.
 * La primera vez que se ejecute el metodo, el fichero DB no existe
 * y se produce un error ENOENT. En este caso se salva el contenido inicial
 * almacenado en quizzes.
 * Si se produce otro tipo de error, se lanza una excepción que aborta
 * la ejecución del programa
 */

const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if(err)
        {
            if(err.code === "ENOENT"){
                save(); //valores iniciales
                return;
            }
            throw err;
        }

        let json = JSON.parse(data);

        if(json){
            quizzes=json;
        }
    });
};

/**
 * Guarda las preguntas en un fichero
 *
 * Guarda en formato JSON el valor de quizzes en el fichero DB
 * Si se produce algun error lanza excepción que abortará la ejecución
 * del programa
 */
const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
        if(err) throw err;
        });
};




/**
 * Devuelve el numero total de preguntas existentes
 *
 * @returns {number} total de preguntas existentes
 */
exports.count = () => quizzes.length;

/**
 * Añade un nuevo quiz
 *
 * @param question String con la respuesta
 * @param answer String con la respuesta
 */
exports.add = (question, answer) =>{

    quizzes.push({
        question: (question||"").trim(), //trim para quitar espacio por delante y por detras
        answer:(answer||"").trim()
    });
    save();
};

/**
 * Actualiza el quiz situado en la posicion index
 *
 * @param id Clave que identifica el quiz a actualizar
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */
exports.update = (id, question, answer) => {

    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido`);
    }
    quizzes.splice(id, 1, {
        question: (question||"").trim(), //trim para quitar espacio por delante y por detras
        answer:(answer||"").trim()
    });
    save();
};


/**
 * Devuelve todos los quizzes
 *
 * Devuelve un clon del valor guardado en la variable quizzes, es decir
 * devuelve un objeto nuevo con todas las preguntas existentes
 * para clonar quizzes se usa strigify + parse
 *
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 * Devuelve un clon del quiz almacenado en la posicion dada
 *
 * Para clonar el quiz se usa stringify + parse
 *
 * @param id Clave que identifica el quiz a devolver
 * @param {question, answer} Devuelve el objeto quiz de la posicion dada
 */


exports.getByIndex = id => {

    const quiz = quizzes[id];
    if(typeof  quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido`);

    }

    return JSON.parse(JSON.stringify(quiz));
};

/**
 * Elimina el quiz situado en la posicion dada
 *
 * @param id Clave que identifica el quiz a borrar
 */

exports.deleteByIndex = id => {

    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido`);
    }
    quizzes.splice(id, 1);
    save();
};

//carga los quizzes almacenados en DB
load();