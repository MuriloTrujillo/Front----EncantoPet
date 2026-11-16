
(function () {
    var GAVETA_TEMA = "encanto-tema";

    // se o navegador não guardar, o tema só vale até fechar a página
    function pegarTema() {
        try {
            return localStorage.getItem(GAVETA_TEMA);
        } catch (erro) {
            return null;
        }
    }

    function guardarTema(tema) {
        try {
            localStorage.setItem(GAVETA_TEMA, tema);
        } catch (erro) {}
    }

    // coloca o tema lá no <html>
    function aplicarTema(tema) {
        document.documentElement.setAttribute("data-tema", tema);
    }

    // usa o tema que a pessoa escolheu; se nunca escolheu, usa o do sistema que a pessoa utiliza no seu aparelho
    var sistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    aplicarTema(pegarTema() || (sistemaEscuro ? "escuro" : "claro"));

    document.addEventListener("DOMContentLoaded", function () {
        // botão 🌓: troca entre claro e escuro
        var botao = document.querySelector("[data-botao-tema]");

        if (botao) {
            botao.addEventListener("click", function () {
                var atual = document.documentElement.getAttribute("data-tema");
                var novo = atual === "escuro" ? "claro" : "escuro";

                aplicarTema(novo);
                guardarTema(novo);
            });
        }

        // data atual, ex.: "sábado, 14 de novembro"
        var data = document.getElementById("data-hoje");

        if (data) {
            var hoje = new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });

            data.textContent = "Hoje é " + hoje + ". Aqui está o resumo do seu pet shop.";
        }
    });
})();
