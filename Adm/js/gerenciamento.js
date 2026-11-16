
const Janela = document.getElementById("Janela");
const formulario = document.getElementById("form-servico");

let servicoEditando = null;

// Abrir para adicionar
function novoServico() {
    servicoEditando = null;

    formulario.reset();

    document.getElementById("titulo-servico").textContent = "Novo serviço";

    Janela.style.display = "flex";
}

// Abrir para editar
function editarServico(botao) {
    servicoEditando = botao.closest(".servico");

    document.getElementById("nome").value =
        servicoEditando.querySelector("h2").textContent;

    document.getElementById("duracao").value =
        servicoEditando.querySelector("p").textContent.split(" · ")[0];

    document.getElementById("valor").value =
        servicoEditando.querySelector("p").textContent.split(" · ")[1];

    document.getElementById("disponivel").checked =
        servicoEditando.querySelector(".MineBotao input").checked;

    document.getElementById("titulo-servico").textContent = "Editar serviço";

    Janela.style.display = "flex";
}

// Fechar janela
function fecharJanela() {
    Janela.style.display = "none";
}

// Salvar serviço
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const duracao = document.getElementById("duracao").value;
    const valor = document.getElementById("valor").value;
    const disponivel = document.getElementById("disponivel").checked;

    if (servicoEditando) {
        servicoEditando.querySelector("h2").textContent = nome;

        servicoEditando.querySelector("p").textContent =
            duracao + " · " + valor;

        servicoEditando.querySelector(".MineBotao input").checked =
            disponivel;

    } else {
        const novo = document.createElement("article");

        novo.className = "servico";

        novo.innerHTML = `
            <div class="parte-superior">
                <div class="icone">✂</div>

                <label class="MineBotao">
                    <input type="checkbox" ${disponivel ? "checked" : ""}>
                    <span></span>
                </label>
            </div>

            <h2>${nome}</h2>

            <p>${duracao} · ${valor}</p>

            <div class="acoes">
                <button class="editar" onclick="editarServico(this)">
                    ✎ Editar
                </button>

                <button class="excluir" onclick="excluirServico(this)">
                    🗑
                </button>
            </div>
        `;

        document.getElementById("lista-servicos").appendChild(novo);
    }

    fecharJanela();
});

// Excluir serviço
function excluirServico(botao) {
    const servico = botao.closest(".servico");

    if (confirm("Deseja excluir este serviço?")) {
        servico.remove();
    }
}


// --> Murilo

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

    // o botão 🌓 troca entre claro e escuro
    document.addEventListener("DOMContentLoaded", function () {
        var botao = document.querySelector("[data-botao-tema]");

        if (!botao) {
            return;
        }

        botao.addEventListener("click", function () {
            var atual = document.documentElement.getAttribute("data-tema");
            var novo = atual === "escuro" ? "claro" : "escuro";

            aplicarTema(novo);
            guardarTema(novo);
        });
    });
})();

