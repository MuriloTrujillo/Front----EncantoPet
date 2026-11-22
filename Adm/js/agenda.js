
(function () {
    var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
                 "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    var DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    var DIAS_LONGOS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
                       "quinta-feira", "sexta-feira", "sábado"];
    var LETRAS = ["D", "S", "T", "Q", "Q", "S", "S"];

    var PETS = ["Thor", "Luna", "Mel", "Bob", "Nina", "Rex", "Mia", "Toby", "Bela", "Fred"];
    var TUTORES = ["Maria Souza", "João Lima", "Ana Costa", "Carlos Dias",
                   "Paula Reis", "Lucas Prado", "Rita Melo", "Pedro Alves"];
    var SERVICOS = ["Banho", "Banho e tosa", "Somente tosa", "Tosa higiênica",
                    "Hidratação", "Corte de unhas"];
    var HORAS = ["08:30", "09:00", "10:30", "11:00", "13:00", "14:30", "15:00", "16:30"];


    /* Funções de data */

    function dois(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    // data em texto "2026-11-15" ( vai achar o dia dos EVENTOS)
    function chave(d) {
        return d.getFullYear() + "-" + dois(d.getMonth() + 1) + "-" + dois(d.getDate());
    }

    function daChave(k) {
        var p = k.split("-");
        return new Date(+p[0], +p[1] - 1, +p[2]);
    }

    function somarDias(d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    function maiuscula(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function escolher(lista, semente) {
        return lista[((semente % lista.length) + lista.length) % lista.length];
    }

    var agora = new Date();
    var hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());


    /* Agendamentos de exemplo */

    function porHora(a, b) {
        return a.hora < b.hora ? -1 : 1;
    }

    function gerarEventos() {
        var mapa = {};

        // hoje 
        mapa[chave(hoje)] = [
            { hora: "09:00", pet: "Thor", servico: "Banho e tosa", tutor: "Maria Souza", status: "confirmado" },
            { hora: "10:30", pet: "Luna", servico: "Hidratação", tutor: "João Lima", status: "confirmado" },
            { hora: "13:00", pet: "Mel", servico: "Corte de unhas", tutor: "Ana Costa", status: "aguardando" },
            { hora: "15:00", pet: "Bob", servico: "Tosa higiênica", tutor: "Carlos Dias", status: "confirmado" }
        ];

        // outros dias: 
        for (var dist = -45; dist <= 90; dist++) {
            var dia = somarDias(hoje, dist);

            if (dist === 0 || dia.getDay() === 0) {
                continue;
            }

            var quantos = (((dist * 7) % 5) + 5) % 5;
            var inicio = ((dist % 4) + 4) % 4;
            var lista = [];

            for (var i = 0; i < quantos; i++) {
                var semente = dist * 11 + i * 5;

                lista.push({
                    hora: HORAS[(inicio + i * 2) % HORAS.length],
                    pet: escolher(PETS, semente),
                    servico: escolher(SERVICOS, semente + 3),
                    tutor: escolher(TUTORES, semente + 1),
                    status: (dist > 0 && semente % 4 === 0) ? "aguardando" : "confirmado"
                });
            }

            if (lista.length) {
                lista.sort(porHora);
                mapa[chave(dia)] = lista;
            }
        }

        return mapa;
    }

    var EVENTOS = gerarEventos();

    function eventosDoDia(d) {
        return EVENTOS[chave(d)] || [];
    }

    function rotuloStatus(status) {
        return status === "confirmado" ? "Confirmado" : "Aguardando";
    }

    function linhaAgenda(e) {
        return '<li><span class="hora">' + e.hora + '</span>' +
               '<span class="info"><b>' + e.pet + '</b>' + e.servico + ' · ' + e.tutor + '</span>' +
               '<span class="status ' + e.status + '">' + rotuloStatus(e.status) + '</span></li>';
    }


    /* Card de do dia  */

    function mostrarHoje() {
        var lista = eventosDoDia(hoje);
        var confirmados = lista.filter(function (e) { return e.status === "confirmado"; }).length;
        var aguardando = lista.length - confirmados;
        var resumo;

        if (!lista.length) {
            resumo = "Nenhum agendamento para hoje.";
        } else {
            resumo = lista.length + (lista.length === 1 ? " agendamento" : " agendamentos") +
                     " · " + confirmados + (confirmados === 1 ? " confirmado" : " confirmados");

            if (aguardando) {
                resumo += " · " + aguardando + (aguardando === 1 ? " aguardando" : " aguardando");
            }
        }

        document.getElementById("hoje-dia").textContent = hoje.getDate();
        document.getElementById("hoje-sem").textContent = maiuscula(DIAS_LONGOS[hoje.getDay()]);
        document.getElementById("hoje-mes").textContent = MESES[hoje.getMonth()] + " de " + hoje.getFullYear();
        document.getElementById("hoje-resumo").textContent = resumo;

        document.getElementById("hoje-lista").innerHTML = lista.length
            ? lista.map(linhaAgenda).join("")
            : '<li class="vazio">Nada marcado para hoje.</li>';
    }


    /*  Calendário  */

    var corpo = document.getElementById("cal-corpo");
    var titulo = document.getElementById("cal-titulo");
    var detalhe = document.getElementById("cal-detalhe");

    var vista = "mes";        // "semana", "mes" ou "ano"
    var ref = hoje;           // data de referência que o calendário está mostrando
    var selecionado = null;   // dia clicado na visão do mês

    function tituloAtual() {
        if (vista === "mes") {
            return maiuscula(MESES[ref.getMonth()]) + " de " + ref.getFullYear();
        }

        if (vista === "ano") {
            return "" + ref.getFullYear();
        }

        var inicio = somarDias(ref, -ref.getDay());
        var fim = somarDias(inicio, 6);

        if (inicio.getFullYear() !== fim.getFullYear()) {
            return inicio.getDate() + " de " + MESES[inicio.getMonth()] + " de " + inicio.getFullYear() +
                   " a " + fim.getDate() + " de " + MESES[fim.getMonth()] + " de " + fim.getFullYear();
        }

        if (inicio.getMonth() !== fim.getMonth()) {
            return inicio.getDate() + " de " + MESES[inicio.getMonth()] +
                   " a " + fim.getDate() + " de " + MESES[fim.getMonth()] + " de " + fim.getFullYear();
        }

        return inicio.getDate() + " a " + fim.getDate() + " de " + MESES[fim.getMonth()] + " de " + fim.getFullYear();
    }

    function htmlMes() {
        var ano = ref.getFullYear();
        var mes = ref.getMonth();
        var primeiro = new Date(ano, mes, 1);
        var diasNoMes = new Date(ano, mes + 1, 0).getDate();
        var semanas = Math.ceil((primeiro.getDay() + diasNoMes) / 7);
        var inicio = somarDias(primeiro, -primeiro.getDay());
        var html = '<div class="mes-grade">';

        DIAS_CURTOS.forEach(function (nome) {
            html += '<div class="mes-cab">' + nome + '</div>';
        });

        for (var i = 0; i < semanas * 7; i++) {
            var d = somarDias(inicio, i);
            var k = chave(d);
            var lista = eventosDoDia(d);
            var classe = "dia" +
                (d.getMonth() !== mes ? " fora" : "") +
                (k === chave(hoje) ? " e-hoje" : "") +
                (k === selecionado ? " selecionado" : "");

            html += '<button type="button" class="' + classe + '" data-dia="' + k + '" aria-label="' +
                    d.getDate() + ' de ' + MESES[d.getMonth()] + ', ' + lista.length +
                    (lista.length === 1 ? ' agendamento' : ' agendamentos') + '">' +
                    '<span class="num">' + d.getDate() + '</span>';

            lista.slice(0, 2).forEach(function (e) {
                html += '<span class="chip ' + e.status + '">' + e.hora + ' ' + e.pet + '</span>';
            });

            if (lista.length > 2) {
                html += '<span class="mais">+' + (lista.length - 2) + ' mais</span>';
            }

            if (lista.length) {
                html += '<span class="contagem">' + lista.length + '</span>';
            }

            html += '</button>';
        }

        return html + '</div>';
    }

    function htmlSemana() {
        var inicio = somarDias(ref, -ref.getDay());
        var html = '<div class="semana-grade">';

        for (var i = 0; i < 7; i++) {
            var d = somarDias(inicio, i);
            var lista = eventosDoDia(d);

            html += '<div class="semana-dia' + (chave(d) === chave(hoje) ? ' e-hoje' : '') + '">' +
                    '<div class="semana-nome">' + DIAS_CURTOS[d.getDay()] + ' <b>' + d.getDate() + '</b></div>';

            if (!lista.length) {
                html += '<p class="vazio">Sem agendamentos</p>';
            }

            lista.forEach(function (e) {
                html += '<div class="semana-item ' + e.status + '"><b>' + e.hora + ' · ' + e.pet + '</b>' +
                        '<small>' + e.servico + '</small></div>';
            });

            html += '</div>';
        }

        return html + '</div>';
    }

    function htmlAno() {
        var ano = ref.getFullYear();
        var html = '<div class="ano-grade">';

        for (var m = 0; m < 12; m++) {
            var primeiro = new Date(ano, m, 1);
            var diasNoMes = new Date(ano, m + 1, 0).getDate();

            html += '<div class="mini"><button type="button" class="mini-titulo" data-mes="' + m + '">' +
                    maiuscula(MESES[m]) + '</button><div class="mini-grade">';

            LETRAS.forEach(function (letra) {
                html += '<span class="mini-sem">' + letra + '</span>';
            });

            for (var vazio = 0; vazio < primeiro.getDay(); vazio++) {
                html += '<span></span>';
            }

            for (var dia = 1; dia <= diasNoMes; dia++) {
                var d = new Date(ano, m, dia);
                var classe = "mini-dia" +
                    (chave(d) === chave(hoje) ? " e-hoje" : "") +
                    (eventosDoDia(d).length ? " tem" : "");

                html += '<button type="button" class="' + classe + '" data-dia="' + chave(d) + '">' + dia + '</button>';
            }

            html += '</div></div>';
        }

        return html + '</div>';
    }

    // embaixo do mês: os agendamentos do dia
    function mostrarDetalhe() {
        if (vista !== "mes" || !selecionado) {
            detalhe.hidden = true;
            return;
        }

        var d = daChave(selecionado);
        var lista = eventosDoDia(d);

        detalhe.innerHTML = '<h3>' + maiuscula(DIAS_LONGOS[d.getDay()]) + ', ' + d.getDate() + ' de ' +
                            MESES[d.getMonth()] + '</h3>' +
                            '<ul class="hoje-lista">' +
                            (lista.length ? lista.map(linhaAgenda).join("") : '<li class="vazio">Nenhum agendamento neste dia.</li>') +
                            '</ul>';
        detalhe.hidden = false;
    }

    function desenhar() {
        titulo.textContent = tituloAtual();

        Array.prototype.forEach.call(document.querySelectorAll("[data-vista]"), function (botao) {
            botao.setAttribute("aria-pressed", botao.getAttribute("data-vista") === vista ? "true" : "false");
        });

        corpo.innerHTML = vista === "mes" ? htmlMes() : (vista === "semana" ? htmlSemana() : htmlAno());
        mostrarDetalhe();
    }

    function mover(direcao) {
        if (vista === "mes") {
            ref = new Date(ref.getFullYear(), ref.getMonth() + direcao, 1);
        } else if (vista === "semana") {
            ref = somarDias(ref, 7 * direcao);
        } else {
            ref = new Date(ref.getFullYear() + direcao, 0, 1);
        }

        desenhar();
    }

    function mudarVista(nova) {
        // mostra a semana do dia (ou a de atual, se for o mês atual)
        if (nova === "semana") {
            if (selecionado) {
                ref = daChave(selecionado);
            } else if (ref.getFullYear() === hoje.getFullYear() && ref.getMonth() === hoje.getMonth()) {
                ref = hoje;
            }
        }

        vista = nova;
        desenhar();
    }

    // calendário: um dia (mês e ano)
    corpo.addEventListener("click", function (evento) {
        var mes = evento.target.closest("[data-mes]");

        if (mes) {
            ref = new Date(ref.getFullYear(), +mes.getAttribute("data-mes"), 1);
            vista = "mes";
            selecionado = null;
            desenhar();
            return;
        }

        var dia = evento.target.closest("[data-dia]");

        if (dia) {
            var k = dia.getAttribute("data-dia");
            var data = daChave(k);

            selecionado = k;

            if (vista === "ano" || data.getMonth() !== ref.getMonth()) {
                ref = data;
                vista = "mes";
            }

            desenhar();

            var novo = corpo.querySelector('[data-dia="' + k + '"]');
            if (novo) {
                novo.focus();
            }
        }
    });

    document.getElementById("cal-anterior").addEventListener("click", function () { mover(-1); });
    document.getElementById("cal-proximo").addEventListener("click", function () { mover(1); });

    document.getElementById("cal-hoje").addEventListener("click", function () {
        ref = hoje;
        selecionado = null;
        desenhar();
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-vista]"), function (botao) {
        botao.addEventListener("click", function () {
            mudarVista(botao.getAttribute("data-vista"));
        });
    });

    mostrarHoje();
    desenhar();
})();
