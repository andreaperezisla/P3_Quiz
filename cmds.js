
const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.helpCmd = rl => {
    log("Commandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show<id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quizz interactivamente.");
    log(" delete<id> - Borrar el quiz indicado.");
    log(" edit<id> - Editar el quiz indicado.");
    log(" test<id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {

        log(`  [${colorize(id,'magenta')}]: ${quiz.question}`);
    });

    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */

exports.showCmd = (rl,id) => {

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(`[${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }


    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asincrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 *es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question,answer);
            log(` ${colorize('Se ha añadido', 'magenta')}:  ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });

};

/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a borrar en el modelo.
 */

exports.deleteCmd = (rl,id) => {

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }


    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 *  Hay que recordar que el funcionamiento de la funcion rl.question es asincrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 *es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */

exports.editCmd = (rl,id) => {
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz= model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id,question,answer);
                    log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a probar.
 */

exports.testCmd = (rl,id) => {
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz= model.getByIndex(id);
            const pregunta =quiz.question;


            rl.question((`${colorize(pregunta, 'red')}${colorize("?", 'red')}`), respuesta => {
                resp=respuesta.toLowerCase().trim();


                if (resp===quiz.answer.toLowerCase().trim()){
                    log('Su respuesta es:');
                    biglog('Correcta', 'green');
                    rl.prompt();
                }else{
                    log('Su respuesta es:');
                    biglog('Incorrecta', 'red');
                    rl.prompt();
                }
                });
        }catch(error){
            errorlog(error.message);
            rl.prompt();

        }
    }

};


/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.playCmd = rl => {

    let score = 0;
    let porResolver = []; //id de las preguntas existentes
    let array = model.getAll();

    var i;
    for(i=0; i<array.length; i++){
        porResolver.push(i);
    }


    const playOne = () => {
        if (porResolver.length === 0) {
            log('No queda nada por resolver');
            log(`Fin del examen. Aciertos:`);
            biglog(score,'magenta');
            rl.prompt();

        } else {
            let id =Math.floor(Math.random()*porResolver.length);

            const quiz = array[id];
            const pregunta= quiz.question;

            rl.question((`${colorize(pregunta, 'red')}${colorize("?", 'red')}`), respuesta => {
                resp=respuesta.toLowerCase().trim();


                if (resp===quiz.answer.toLowerCase().trim()){
                    score = score +1;
                    log(`CORRECTO - Lleva ${score} aciertos.`);
                    porResolver.splice(id,1);
                    array.splice(id,1);
                    playOne();

                }else{
                    log('INCORRECTO.');
                    log('Fin del examen. Aciertos:');
                    biglog(score, 'magenta');
                    rl.prompt();
                }
            });

            // aqui hago la pregunta como en test
            // miro si es respuesta correcta
            // si es ta bien-- mensaje y score+1 TENGO QUE VOLVER A PREGUNTAR (AL IF)
            //llamar a la funcion playone();
            //si esta mal-- mensaje score y prompt


        }

    }
       // llamar a playone(); para que empieze el proceso
        playOne();
};

/**
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Andrea Perez Isla','green');
    log('Virginia Blanco Ravena','green');
    rl.prompt();
};

/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.quitCmd = rl => {
    rl.close();
};
