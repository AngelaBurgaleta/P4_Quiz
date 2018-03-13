const {models} = require('./model'); //Ahora esto nos pasa un objeto sequelize, una base de datos
const {log, biglog, errorlog, colorize} = require("./out");
const Sequelize = require ('sequelize');
exports.helpCmd = rl => {  //el tiene aquí puesto un rl. Tambien hay que cambiar los
//const por exports.
    log("Comandos:");
    log(" h|help - muestra esta ayuda");
    log("list - Listar los quizzes existentes");
    log("show <id> - Muestra la pregunta y respuesta del quiz indicado");
    log("add - añadir un nuevo quiz interactivamente");
    log("delete <id> - Borrar el quiz indicado");
    log("edit <id> - Editar el quiz indicado");
    log("test <id> - Probar el quiz indicado");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log("credits - ´Créditos ");
    log("q|quit - Salir del programa");
    rl.prompt();
}

//Hacemos una funcion que transforme rl.quiestion en una funcion basada en promesas:
const makeQuestion = (rl,text) =>{
    return new Sequelize.Promise ((resolve, reject) => { //Js 6 te da las promesas que se definen con "Promise", nosotros usamos BlueBird que se hace poniendo "Sequelize.Promise"
        rl.question(colorize(text, 'red'), answer => {
        resolve(answer.trim());
});
});
};
exports.addCmd = rl => { //mirar en el api como fuciona rl.question
    makeQuestion (rl, 'Introduzca una pregunta: ') //promesa que finaliza cuando la pregunta es introducida
        .then(q => {
        return makeQuestion(rl, 'Introduzca la respuesta: ')
            .then(a => { //esto se anida para tener acceso a la variable q
            return {question: q, answer: a};
});
})

.then(quiz => { //quiz es el valor pasado por la anterior promesa
        return models.quiz.create(quiz); //se añade a la base de datos
})
.then((quiz) => {
        log(`${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})

.catch(Sequelize.ValidationError, error => {
        errorlog ('El quiz es erróneo: ');
    error.errors.forEach(({message}) => errorlog (message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};
exports.listCmd = rl => {


    models.quiz.findAll() //Devuelve todos los quizzes(un array)
        .then(quizzes => { //Esto se puede hacer tanbien con .each
        quizzes.forEach(quiz => {   //For que imprime todas las preguntas
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
});
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();

});
};


const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if( typeof id === "undefined") {
        reject(new Error (`Falta el parametro <id>.`));//rechaza promesa por undefined
    }else{
        id = parseInt(id);
        if(Number.isNaN(id)) {
            reject(new Error (`El valor del parámetro <id> no es un número.`)); //reject es la razon por la que no se cumple la promesa
        }else{
            resolve(id); //resolver la promesa con el id que sea
        }
    }
});
};



exports.showCmd = (rl,id) => {

    validateId (id)
        .then(id => models.quiz.findById(id))
.then(quiz => {
        if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
    log (`[${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

};

exports.deleteCmd = (rl,id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

}
exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz=> {
        if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0); //El metodo wtite solo funciona si la salida estandar es un TTY, de ahí la comprobacion al principio de: process.stdout.isTTY
    return makeQuestion (rl, 'Introduzca la pregunta: ') //promesa que finaliza cuando la pregunta es introducida
        .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    return makeQuestion(rl, 'Introduzca la respuesta: ')
        .then(a => { //esto se anida para tener acceso a la variable q
        quiz.question = q;
    quiz.answer = a;
    return quiz;
});

});
})

.then(quiz => {
        return quiz.save(); //lo salvo en la base de datos
})
.then(quiz => {
        log(` Se ha cambiado el quiz: ${colorize(quiz.id, 'magenta')} por : ${question} ${colorize ('=>', 'magenta')} ${answer}`);
})

.catch(Sequelize.ValidationError, error => {
        errorlog ('El quiz es erróneo: ');
    error.errors.forEach(({message}) => errorlog (message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
})

};


exports.testCmd = (rl,id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz=> {
        if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }

    return makeQuestion (rl, quiz.question + " ") //promesa que finaliza cuando la pregunta es introducida
        .then(answer => {

        if(answer.toLowerCase().trim()===quiz.answer.toLowerCase().trim()){


        console.log("Correcta");


    }else{
        console.log("Incorrecta");
        //resolve();
    }


});
})
.catch(Sequelize.ValidationError, error => {
        errorlog ('El quiz es erróneo: ');
    error.errors.forEach(({message}) => errorlog (message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
})

};




exports.playCmd = rl =>{
    let score =0;
    let toBePlayed=[];

    const playone = () => {

        return Promise.resolve()
            .then (() => {

            if(toBePlayed.length<=0){
            console.log("final!");
            //resolve();
            return;
        }
        let pos =Math.floor(Math.random()*toBePlayed.length)
        let quiz = toBePlayed[pos];
        toBePlayed.splice(pos,1);

        return makeQuestion(rl, quiz.question +'? ')
            .then(answer => {

            if(answer.toLowerCase().trim()===quiz.answer.toLowerCase().trim()){

            score++;
            console.log("Correcta");
            return playone();

        }else{
            console.log("Incorrecta");
            //resolve();
        }
    })
    })
        //return new Sequelize.Promise((resolve,reject)=>{

        //})
    };



    models.quiz.findAll({raw: true})//raw devuelve un array mas pequeño que sin el
        .then(quizzes => {
        toBePlayed=quizzes;

})
.then(()=>{
        return playone();// con el return el catch se espera hasta que la promesa playone haya acabado(devuelve una promesa)
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        console.log('Fin.');
    console.log('Tu resultado es: ' + score);
    rl.prompt();
})
}


exports.creditsCmd = rl => {
    log("Autora de la práctica");
    log("Angela Burgaleta Ledesma");
    rl.prompt();

};

exports.quitCmd = rl => {
    rl.close();
    rl.prompt();

};