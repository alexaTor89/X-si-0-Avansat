
//dimensiune tabla de joc
var width = 600;
var height = 600;

//culorile folosite in joc
var culori = {
    gri: "rgb(125, 125, 125)", 
    negru: "rgb(8, 8, 8)", 
    galben: "rgb(214, 237, 23)", 
    albastru: "rgb(23, 237, 216)"};

//matricea de joc cu cele 9 table locale
var table = [

    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]

];

//un array simplu de 9 elemente, care este editat cand un jucator 
//castiga o tabla locala
var tablaPrincipala = [0, 0, 0, 0, 0, 0, 0, 0, 0];

//variabile pt a stoca pozitia mouse-ului si starea click-ului
var pozMouseX = 0;
var pozMouseY = 0;
var clicked = false;

var canvas = document.getElementById("canva");
var context = canvas.getContext("2d");

//variabile pt gestionarea jocul
var rand = 1;
var jucator = 1;
var ai = -1;
var tablaCurenta = -1;
var jocPornit = false;
var ture = 0; //nr de iteratii al alg minimax
var mutari = 0;
var schimba = 1;
var AIactiv = true;
var numeJucatori = ["Jucator", "A.I."];


//verifica conditia de castigare pt o tabla mica de joc
//returneaza 1 sau -1 daca un jucator a castigat, 
//returneaza 0 daca nimeni nu a castigat
function verificaConditiaCastigare(map) {
    const linii = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linii
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Coloane
        [0, 4, 8], [2, 4, 6] // Diagonale
    ];

    for (let i = 0; i < linii.length; i++) {
        const [a, b, c] = linii[i];
        if (Math.abs(map[a] + map[b] + map[c]) === 3) {
            return map[a];
        }
    }
    return 0;
}

//returneaza o valoare numerica a jocului in starea curenta
function evalueazaJoc(pozitie, tablaCurenta) {
    var evale = 0;
    var tablaPR = [];
    var evaluatorMul = [1.4, 1, 1.4, 1, 1.75, 1, 1.4, 1, 1.4];
    for (var eh = 0; eh < 9; eh++){
        evale += evaluarePatratReala(pozitie[eh])*1.5*evaluatorMul[eh];
        if(eh === tablaCurenta){
            evale += evaluarePatratReala(pozitie[eh])*evaluatorMul[eh];
        }
        var tmpEv = verificaConditiaCastigare(pozitie[eh]);
        evale -= tmpEv*evaluatorMul[eh];
        tablaPR.push(tmpEv);
    }
    evale -= verificaConditiaCastigare(tablaPR)*5000;
    evale += evaluarePatratReala(tablaPR)*150;
    return evale;
}

//algoritm minimax
function miniMax(pozitie, tablaDeJoc, adancime, alpha, beta, maximJucator) {
    ture++;

    var jocTmp = -1;

    var calcEval = evalueazaJoc(pozitie, tablaDeJoc);
    if(adancime <= 0 || Math.abs(calcEval) > 5000) {
        return {"mE": calcEval, "tP": jocTmp};
    }
    if(tablaDeJoc !== -1 && verificaConditiaCastigare(pozitie[tablaDeJoc]) !== 0){
        tablaDeJoc = -1;
    }
    if(tablaDeJoc !== -1 && !pozitie[tablaDeJoc].includes(0)){
        tablaDeJoc = -1;
    }
    if(maximJucator){
        var maxEval = -Infinity;
        for(var mm = 0; mm < 9; mm++){
            var evalut = -Infinity;
            if(tablaDeJoc === -1){
                for(var trr = 0; trr < 9; trr++){
                    if(verificaConditiaCastigare(pozitie[mm]) === 0){
                        if(pozitie[mm][trr] === 0){
                            pozitie[mm][trr] = ai;
                            evalut = miniMax(pozitie, trr, adancime-1, alpha, beta, false).mE;
                            pozitie[mm][trr] = 0;
                        }
                        if(evalut > maxEval){
                            maxEval = evalut;
                            jocTmp = mm;
                        }
                        alpha = Math.max(alpha, evalut);
                    }
                }
                if(beta <= alpha){
                    break;
                }
            }else{
                if(pozitie[tablaDeJoc][mm] === 0){
                    pozitie[tablaDeJoc][mm] = ai;
                    evalut = miniMax(pozitie, mm, adancime-1, alpha, beta, false);
                    pozitie[tablaDeJoc][mm] = 0;
                }
                var blop = evalut.mE;
                if(blop > maxEval){
                    maxEval = blop;
                    jocTmp = evalut.tP;
                }
                alpha = Math.max(alpha, blop);
                if(beta <= alpha){
                    break;
                }
            }
        }
        return {"mE": maxEval, "tP": jocTmp};
    }else{
        var minEval = Infinity;
        for(var mm = 0; mm < 9; mm++){
            var evalua = Infinity;
            if(tablaDeJoc === -1){
                for(var trr = 0; trr < 9; trr++){
                    if(verificaConditiaCastigare(pozitie[mm]) === 0){
                        if(pozitie[mm][trr] === 0){
                            pozitie[mm][trr] = jucator;
                            evalua = miniMax(pozitie, trr, adancime-1, alpha, beta, true).mE;
                            pozitie[mm][trr] = 0;
                        }
                        if(evalua < minEval){
                            minEval = evalua;
                            jocTmp = mm;
                        }
                        beta = Math.min(beta, evalua);
                    }
                }
                if(beta <= alpha){
                    break;
                }
            }else{
                if(pozitie[tablaDeJoc][mm] === 0){
                    pozitie[tablaDeJoc][mm] = jucator;
                    evalua = miniMax(pozitie, mm, adancime-1, alpha, beta, true);
                    pozitie[tablaDeJoc][mm] = 0;
                }
                var blep = evalua.mE;
                if(blep < minEval){
                    minEval = blep;
                    jocTmp = evalua.tP;
                }
                beta = Math.min(beta, blep);
                if(beta <= alpha){
                    break;
                }
            }
        }
        return {"mE": minEval, "tP": jocTmp};
    }
}


//evalueaza tabla de joc intr-un mod eficient
function evaluarePatratReala(poz){
    var evaluare = 0;
    var puncte = [0.2, 0.17, 0.2, 0.17, 0.22, 0.17, 0.2, 0.17, 0.2];

    for(var bw in poz){
        evaluare -= poz[bw]*puncte[bw];
    }
    var a = 2;
    if (poz[0] + poz[1] + poz[2] === a || 
        poz[3] + poz[4] + poz[5] === a || 
        poz[6] + poz[7] + poz[8] === a) {
        evaluare -= 6;
    }
    if (poz[0] + poz[3] + poz[6] === a || 
        poz[1] + poz[4] + poz[7] === a || 
        poz[2] + poz[5] + poz[8] === a) {
        evaluare -= 6;
    }
    if (poz[0] + poz[4] + poz[8] === a || 
        poz[2] + poz[4] + poz[6] === a) {
        evaluare -= 7;
    }
    a = -1;
    if ((poz[0] + poz[1] === 2*a && poz[2] === -a) || 
        (poz[1] + poz[2] === 2*a && poz[0] === -a) || 
        (poz[0] + poz[2] === 2*a && poz[1] === -a) || 
        (poz[3] + poz[4] === 2*a && poz[5] === -a) || 
        (poz[3] + poz[5] === 2*a && poz[4] === -a) || 
        (poz[5] + poz[4] === 2*a && poz[3] === -a) || 
        (poz[6] + poz[7] === 2*a && poz[8] === -a) || 
        (poz[6] + poz[8] === 2*a && poz[7] === -a) || 
        (poz[7] + poz[8] === 2*a && poz[6] === -a) || 
        (poz[0] + poz[3] === 2*a && poz[6] === -a) || 
        (poz[0] + poz[6] === 2*a && poz[3] === -a) || 
        (poz[3] + poz[6] === 2*a && poz[0] === -a) || 
        (poz[1] + poz[4] === 2*a && poz[7] === -a) || 
        (poz[1] + poz[7] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[7] === 2*a && poz[1] === -a) || 
        (poz[2] + poz[5] === 2*a && poz[8] === -a) || 
        (poz[2] + poz[8] === 2*a && poz[5] === -a) || 
        (poz[5] + poz[8] === 2*a && poz[2] === -a) || 
        (poz[0] + poz[4] === 2*a && poz[8] === -a) || 
        (poz[0] + poz[8] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[8] === 2*a && poz[0] === -a) || 
        (poz[2] + poz[4] === 2*a && poz[6] === -a) || 
        (poz[2] + poz[6] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[6] === 2*a && poz[2] === -a)){
        evaluare-=9;
    }
    a = -2;
    if (poz[0] + poz[1] + poz[2] === a || 
        poz[3] + poz[4] + poz[5] === a || 
        poz[6] + poz[7] + poz[8] === a) {
        evaluare += 6;
    }
    if (poz[0] + poz[3] + poz[6] === a || 
        poz[1] + poz[4] + poz[7] === a || 
        poz[2] + poz[5] + poz[8] === a) {
        evaluare += 6;
    }
    if (poz[0] + poz[4] + poz[8] === a || 
        poz[2] + poz[4] + poz[6] === a) {
        evaluare += 7;
    }
    a = 1;
    if ((poz[0] + poz[1] === 2*a && poz[2] === -a) || 
        (poz[1] + poz[2] === 2*a && poz[0] === -a) || 
        (poz[0] + poz[2] === 2*a && poz[1] === -a) || 
        (poz[3] + poz[4] === 2*a && poz[5] === -a) || 
        (poz[3] + poz[5] === 2*a && poz[4] === -a) || 
        (poz[5] + poz[4] === 2*a && poz[3] === -a) || 
        (poz[6] + poz[7] === 2*a && poz[8] === -a) || 
        (poz[6] + poz[8] === 2*a && poz[7] === -a) ||
        (poz[7] + poz[8] === 2*a && poz[6] === -a) || 
        (poz[0] + poz[3] === 2*a && poz[6] === -a) || 
        (poz[0] + poz[6] === 2*a && poz[3] === -a) || 
        (poz[3] + poz[6] === 2*a && poz[0] === -a) || 
        (poz[1] + poz[4] === 2*a && poz[7] === -a) || 
        (poz[1] + poz[7] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[7] === 2*a && poz[1] === -a) || 
        (poz[2] + poz[5] === 2*a && poz[8] === -a) || 
        (poz[2] + poz[8] === 2*a && poz[5] === -a) || 
        (poz[5] + poz[8] === 2*a && poz[2] === -a) || 
        (poz[0] + poz[4] === 2*a && poz[8] === -a) || 
        (poz[0] + poz[8] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[8] === 2*a && poz[0] === -a) || 
        (poz[2] + poz[4] === 2*a && poz[6] === -a) || 
        (poz[2] + poz[6] === 2*a && poz[4] === -a) || 
        (poz[4] + poz[6] === 2*a && poz[2] === -a)){
        evaluare+=9;
    }
    evaluare -= verificaConditiaCastigare(poz)*12;
    return evaluare;
}

function joc(){
    context.fillStyle = culori.gri;
    context.fillRect(0, 0, width, height);
    context.lineWidth = 3;
    var marimePatrat = width/4;

    if(rand === -1 && jocPornit && AIactiv){
        console.log("Start AI");
        miscareIdeala = -1;
        scorIdeal = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];
        ture = 0; 
        var count = 0;
        for(var bt = 0; bt < table.length; bt++){
            if(verificaConditiaCastigare(table[bt]) === 0){
                table[bt].forEach((v) => (v === 0 && count++));
            }
        }
        if(tablaCurenta === -1 || verificaConditiaCastigare(table[tablaCurenta]) !== 0){
            var salvatMm;

            console.log("Remaining: " + count);
            if(mutari < 10) {
                salvatMm = miniMax(table, -1, Math.min(4, count), -Infinity, Infinity, true);
            }else if(mutari < 18){
                salvatMm = miniMax(table, -1, Math.min(5, count), -Infinity, Infinity, true);
            }else{
                salvatMm = miniMax(table, -1, Math.min(6, count), -Infinity, Infinity, true);
            }
            console.log(salvatMm.tP);
            tablaCurenta = salvatMm.tP;
        }
        for (var i = 0; i < 9; i++) {
            if (table[tablaCurenta][i] === 0) {
                miscareIdeala = i;
                break;
            }
        }
        if(miscareIdeala !== -1) { 
            for (var a = 0; a < 9; a++) {
                if (table[tablaCurenta][a] === 0) {
                    scorIdeal[a] = 45;
                }
            }
            for(var b = 0; b < 9; b++){
                if(verificaConditiaCastigare(table[tablaCurenta]) === 0){
                    if (table[tablaCurenta][b] === 0) {
                        table[tablaCurenta][b] = ai;
                        var salvatMm;
                        if(mutari < 20){
                            salvatMm = miniMax(table, b, Math.min(5, count), -Infinity, Infinity, false);
                        }else if(mutari < 32){
                            console.log("DEEP SEARCH");
                            salvatMm = miniMax(table, b, Math.min(6, count), -Infinity, Infinity, false);
                        }else{
                            console.log("ULTRA DEEP SEARCH");
                            salvatMm = miniMax(table, b, Math.min(7, count), -Infinity, Infinity, false);
                        }
                        console.log(salvatMm);
                        var score2 = salvatMm.mE;
                        table[tablaCurenta][b] = 0;
                        scorIdeal[b] += score2;
                    }
                }
            }
            console.log(scorIdeal);
            for(var i in scorIdeal){
                if(scorIdeal[i] > scorIdeal[miscareIdeala]){
                    miscareIdeala = i;
                }
            }
            if(table[tablaCurenta][miscareIdeala] === 0){
                table[tablaCurenta][miscareIdeala] = ai;
                tablaCurenta = miscareIdeala;
            }
            console.log(evalueazaJoc(table, tablaCurenta));
        }
        rand = -rand;
    }
    marimeForma = marimePatrat/6;

    if(clicked === true && jocPornit) {
        for (var i in table) {
            if(tablaCurenta !== -1){
                i = tablaCurenta;
                if(tablaPrincipala[tablaCurenta] !== 0) {
                    continue;
                }
            }
            for (var j in table[i]) {
                if(table[i][j] === 0) {
                    if (pozMouseX > (width / 3 - marimePatrat) / 2 + marimePatrat / 6 - marimeForma + (j % 3) * marimePatrat / 3 + 
                        (i % 3) * width / 3 && pozMouseX < (width / 3 - marimePatrat) / 2 + marimePatrat / 6 + marimeForma + 
                        (j % 3) * marimePatrat / 3 + (i % 3) * width / 3) {
                        if (pozMouseY > (width / 3 - marimePatrat) / 2 + marimePatrat / 6 - marimeForma + Math.floor(j / 3) * marimePatrat / 3 + 
                            Math.floor(i / 3) * width / 3 && pozMouseY < (width / 3 - marimePatrat) / 2 + marimePatrat / 6 + marimeForma + 
                            Math.floor(j / 3) * marimePatrat / 3 + Math.floor(i / 3) * width / 3) {
                            table[i][j] = rand;
                            tablaCurenta = j;
                            rand = -rand;
                            mutari++;
                            break;
                        }
                    }
                }
            }
        }
    }
    //deseneaza 
    marimePatrat = width/4;
    var marimeForma = width/36;

    context.strokeStyle = culori.negru;
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(width/3, 0);
    context.lineTo(width/3, width);
    context.stroke();

    context.beginPath();
    context.moveTo(width/3*2, 0);
    context.lineTo(width/3*2, width);
    context.stroke();

    context.beginPath();
    context.moveTo(0, width/3);
    context.lineTo(width, width/3);
    context.stroke();

    context.beginPath();
    context.moveTo(0, width/3*2);
    context.lineTo(width, width/3*2);
    context.stroke();

    context.lineWidth = 3;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            context.beginPath();
            context.moveTo(i*width/3 + (width/3-marimePatrat)/2 + marimePatrat/3, j*width/3 + (width/3 - marimePatrat)/2);
            context.lineTo(i*width/3 + (width/3-marimePatrat)/2 + marimePatrat/3, j*width/3 + (width/3 - marimePatrat)/2 + marimePatrat);
            context.stroke();

            context.beginPath();
            context.moveTo(i*width/3 + (width/3-marimePatrat)/2 + marimePatrat*2/3, j*width/3 + (width/3 - marimePatrat)/2);
            context.lineTo(i*width/3 + (width/3-marimePatrat)/2 + marimePatrat*2/3, j*width/3 + (width/3 - marimePatrat)/2 + marimePatrat);
            context.stroke();

            context.beginPath();
            context.moveTo(i*width/3 + (width/3 - marimePatrat)/2, j*width/3 + (width/3-marimePatrat)/2 + marimePatrat/3);
            context.lineTo(i*width/3 + (width/3 - marimePatrat)/2 + marimePatrat, j*width/3 + (width/3-marimePatrat)/2 + marimePatrat/3);
            context.stroke();

            context.beginPath();
            context.moveTo(i*width/3 + (width/3 - marimePatrat)/2, j*width/3 + (width/3-marimePatrat)/2 + marimePatrat*2/3);
            context.lineTo(i*width/3 + (width/3 - marimePatrat)/2 + marimePatrat, j*width/3 + (width/3-marimePatrat)/2 + marimePatrat*2/3);
            context.stroke();
        }
    }
    context.lineWidth = 5;

    for(var i in table){
        if(tablaPrincipala[i] === 0) {
            if (verificaConditiaCastigare(table[i]) !== 0) {
                tablaPrincipala[i] = verificaConditiaCastigare(table[i]);
            }
        }
        for(var j in table[i]){
            if(table[i][j] === 1*schimba){
                context.strokeStyle = culori.albastru;
                context.beginPath();
                context.moveTo((width/3-marimePatrat)/2 + marimePatrat/6 - marimeForma + (j%3)*marimePatrat/3 + (i%3)*width/3, (width/3 - marimePatrat)/2 + marimePatrat/6 - marimeForma + Math.floor(j/3)*marimePatrat/3 + Math.floor(i/3)*width/3);
                context.lineTo((width/3-marimePatrat)/2 + marimePatrat/6 + marimeForma + (j%3)*marimePatrat/3 + (i%3)*width/3, (width/3 - marimePatrat)/2 + marimePatrat/6 + marimeForma + Math.floor(j/3)*marimePatrat/3 + Math.floor(i/3)*width/3);
                context.stroke();

                context.beginPath();
                context.moveTo((width/3-marimePatrat)/2 + marimePatrat/6 - marimeForma + (j%3)*marimePatrat/3 + (i%3)*width/3, (width/3 - marimePatrat)/2 + marimePatrat/6 + marimeForma + Math.floor(j/3)*marimePatrat/3 + Math.floor(i/3)*width/3);
                context.lineTo((width/3-marimePatrat)/2 + marimePatrat/6 + marimeForma + (j%3)*marimePatrat/3 + (i%3)*width/3, (width/3 - marimePatrat)/2 + marimePatrat/6 - marimeForma + Math.floor(j/3)*marimePatrat/3 + Math.floor(i/3)*width/3);
                context.stroke();
            }else if(table[i][j] === -1*schimba){
                context.strokeStyle = culori.galben;
                context.beginPath();
                context.ellipse((width/3-marimePatrat)/2 + marimePatrat/6 + (j%3)*marimePatrat/3 + (i%3)*width/3, (width/3 - marimePatrat)/2 + marimePatrat/6 + Math.floor(j/3)*marimePatrat/3 + Math.floor(i/3)*width/3, marimeForma*1.1, marimeForma*1.1, 0, 0, Math.PI*2);
                context.stroke();
            }
        }
    }
    if(jocPornit){
        if (verificaConditiaCastigare(tablaPrincipala) !== 0) {
            jocPornit = false;
            document.getElementById("meniuCastig").removeAttribute("hidden");
            if(verificaConditiaCastigare(tablaPrincipala) === 1){
                document.getElementById("rezultat").innerHTML = numeJucatori[0] + " a castigat!";
            }else{
                document.getElementById("rezultat").innerHTML = numeJucatori[1] + " a castigat!";
            }
        }
        var countw = 0;
        for(var bt = 0; bt < table.length; bt++){
            if(verificaConditiaCastigare(table[bt]) === 0){
                table[bt].forEach((v) => (v === 0 && countw++));
            }
        }
        if(countw === 0){
            jocPornit = false;
            document.getElementById("meniuCastig").removeAttribute("hidden");
            document.getElementById("rezultat").innerHTML = "ESTE EGALITATE!";
        }
    }
    marimeForma = marimePatrat/3;
    context.lineWidth = 20;
    
    for(var j in tablaPrincipala){
        if(tablaPrincipala[j] === 1*schimba){
            context.strokeStyle = culori.albastru;
            context.beginPath();
            context.moveTo(width/6 - marimeForma + (j%3)*width/3, width/6 - marimeForma + Math.floor(j/3)*width/3);
            context.lineTo(width/6 + marimeForma + (j%3)*width/3, width/6 + marimeForma + Math.floor(j/3)*width/3);
            context.stroke();

            context.beginPath();
            context.moveTo(width/6 - marimeForma + (j%3)*width/3, width/6 + marimeForma + Math.floor(j/3)*width/3);
            context.lineTo(width/6 + marimeForma + (j%3)*width/3, width/6 - marimeForma + Math.floor(j/3)*width/3);
            context.stroke();
        }else if(tablaPrincipala[j] === -1*schimba){
            context.strokeStyle = culori.galben;
            context.beginPath();
            context.ellipse(width/6 + (j%3)*width/3, width/6 + Math.floor(j/3)*width/3, marimeForma*1.1, marimeForma*1.1, 0, 0, Math.PI*2);
            context.stroke();
        }
    }

    if(tablaPrincipala[tablaCurenta] !== 0 || !table[tablaCurenta].includes(0)){tablaCurenta = -1;}

    //arata tabla printr-o culoare mai transparenta pe care trebuie jucat
    context.fillStyle = culori.albastru;
    context.globalAlpha = 0.2;
    context.fillRect(width/3*(tablaCurenta%3), width/3*Math.floor(tablaCurenta/3), width/3, width/3);
    context.globalAlpha = 1;
    clicked = false;

}

function gasesteCoordonate(mouseEvent)
{
    var rect = canvas.getBoundingClientRect();
    pozMouseX = mouseEvent.clientX - rect.left;
    pozMouseY = mouseEvent.clientY - rect.top;
}

function click(){
    clicked = true;
}
document.getElementById("canva").onmousemove = gasesteCoordonate;
document.getElementById("canva").onclick = click;

function startJoc(type){
    table = [

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]

    ];
    tablaPrincipala = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    mutari = 0;
    tablaCurenta = -1;

    if(type === 0){
        AIactiv = true;
        jocPornit = true;
        numeJucatori[0] = "Jucator";
        numeJucatori[1] = "A.I.";
    }else{
        AIactiv = false;
        jocPornit = true;
        schimba = 1;
        numeJucatori[0] = "Jucatorul 1";
        numeJucatori[1] = "Jucatorul 2";
    }
    document.getElementById("meniuStart").setAttribute("hidden", "hidden");
    document.getElementById("meniuTura").setAttribute("hidden", "hidden");
}

function setJoc(type){
    if(type === 0){
        rand = 1;
        schimba = 1;
    }else{
        rand = -1;
        schimba = -1;
    }
    startJoc(0);
}

function meniu(){
        // Resetează valorile inițiale ale matricelor
        table = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        tablaPrincipala = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        mutari = 0;
        tablaCurenta = -1;

    document.getElementById("meniuStart").removeAttribute("hidden");
    document.getElementById("meniuTura").setAttribute("hidden", "hidden");
    document.getElementById("meniuCastig").setAttribute("hidden", "hidden");
}

function alegeRandul(){
    document.getElementById("meniuStart").setAttribute("hidden", "hidden");
    document.getElementById("meniuTura").removeAttribute("hidden");
}
function repetaDes() {
    joc();
    requestAnimationFrame(repetaDes);
}
requestAnimationFrame(repetaDes);