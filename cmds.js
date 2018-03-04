const model = require('./model');

const {log, biglog, errorlog, colorize} = require("./out");



/**
 * Muestra la ayuda
 *
 * @oaram rl Objeto readline usado para implemental el CLI
 */

exports.helpCmd = rl =>
{
    log("Comandos");
    log(" h|help - Muestra esta ayuda");
    log(" list - Listar los quizzes existentes");
    log(" show <id> - Muestra la pregunta y la respuesta del quiz");
    log(" add - Añadir un nuevo quizz");
    log(" delete <id> - Borrar el quizz");
    log(" test <id> - Probar el quiz");
    log(" edit <id> - Editar el quiz");
    log(" p|play - Jugar a preguntas aleatorias");
    log(" credits - Creditos");
    log(" q|quit - Salir");
    rl.prompt();
};

/**
 *Lista los quizzes existentes
 */
exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]:  ${quiz.question}`);

    });


    rl.prompt();

};


/**
 *Muestra los quizzes existentes
 * @param id del quiz
 */

exports.showCmd = (rl,id) =>
{

    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

        } catch (error) {
            errorlog(error.message);
        }
    }


    rl.prompt();

};

/**
 *Añade un quiz nuevo
 * Pregunta interactivamente por la pregunta y por la respuesta
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question
 * es asíncrono
 * El prompt hay que sacarlo cuando ya se ha terminado la interaccion con
 * el usuario, es decir rl.prompt() se llama en la callback de la segunda
 * llamada a rl.question
 *
 * @param rl Objeto readline usado para implementar el CLI
 */

exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question =>{

        rl.question(colorize(' Introduzca la respuesta', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}:  ${question} ${colorize('=>', 'magenta')} ${answer} `);
            
            rl.prompt();
        });
    });
};

/**
 * Borra un quiz modelo
 *
 * @param id clave del quiz a borrar en el modelo
 * no me va bien
 */
exports.deleteCmd = (rl, id) =>
{

    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
    } else {
        try {
            model.deleteByIndex(id); //deleteByIndex a lo mejor no esta bien

        } catch (error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Editar un quiz modelo
 *
 * @param id clave del quiz a editar
 */
exports.editCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            }, 0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {
                    rl.write(quiz.answer)
                }, 0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();

                });
            });

        } catch (error) {
            errorlog(error.message);
            rl.prompt();
          }
       }
    };



    /**
     *Prueba el quiz
     *
     * @param id clave del quiz a probar
     */

    exports.testCmd = (rl, id) => {
        if (typeof id === "undefined") {
            errorlog(`Falta el parametro id.`);
            rl.prompt();
        } else {
            try {
                const quiz = model.getByIndex(id);
                rl.question(`${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, (answer) => {
                    if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                        log(` ${colorize('Correcto', 'magenta')}`);
                        biglog('Correcto', 'green');
                    } else {
                        log(` ${colorize('Incorrecto', 'magenta')}`);
                        biglog('Incorrecto', 'red');
                    }

                    rl.prompt();
                });

            } catch (error) {
                errorlog(error.message);
                rl.prompt();
            }
        }

    };

    /**
     * Pregunta todos los quizzes de forma aleatoria
     *
     * Se gana contestando a todos de forma acertada
     */
    exports.playCmd = rl => {

        let score = 0;
        let toBeResolved = [];
        let quizzes = model.getAll();

        for (let i = 0; i < quizzes.length; i++) {
            toBeResolved.push(i);
        }

        const playOne = () => {
            if (toBeResolved.length === 0) {
                log('No quedan más preguntas');
                fin();
                rl.prompt();
            }

            else {

                let id = Math.floor((Math.random() * toBeResolved.length));
                let quiz = quizzes[id];

                rl.question(`${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, (answer) => {
                    if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                        score++;
                        log(`CORRECTO - Lleva ${score} acierto/s.`);
                        toBeResolved.splice(id, 1);
                        quizzes.splice(id, 1);
                        playOne();

                    } else {
                        log(`INCORRECTO`);
                        fin();
                        rl.prompt();
                    }
                });
            }
        };



        /**
         * Borra quiz
         * @param rl
         * @param id
         */

        exports.deleteCmd = (rl, id) => {

            if (typeof id === "undefined") {
                errorlog(`Falta el parametro id`);
            } else {
                try {
                    model.deleteByIndex(id); //deleteByIndex a lo mejor no esta bien

                } catch (error) {
                    errorlog(error.message);
                }
            }

            rl.prompt();
        };

        const fin = () => {
            log(`Fin de examen. Aciertos:`);
            biglog(`${score}`);
        };

        playOne();
    };


    /**
     * Terminar el programa
     */
    exports.quitCmd = rl => {
        rl.close();
    };
    /**
     * Muestra el nombre de la autora
     */
    exports.creditsCmd = (rl) => {
        log('Autora de la practica');
        log('Angela Burgaleta Ledesma', 'blue');
        rl.prompt();
    };






