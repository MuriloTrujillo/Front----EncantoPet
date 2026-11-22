const Janela = document.getElementById("Janela");
const formulario = document.getElementById("form-servico");


let servicoEditando = null;
let serviceList = []

// Abrir para adicionar
function novoServico() {
    servicoEditando = null;
    formulario.reset();
    document.getElementById("titulo-servico").textContent = "Novo serviço";
    Janela.style.display = "flex";
};

// Abrir para editar
function editarServico(botao) {
    servicoEditando = botao.closest(".servico");
    document.getElementById("nome").value = servicoEditando.querySelector("h2").textContent;
    document.getElementById("duracao").value = servicoEditando.querySelector("p").textContent.split(" · ")[0].replace(" min", "");
    document.getElementById("valor").value = servicoEditando.querySelector("p").textContent.split(" · ")[1];
    document.getElementById("disponivel").checked = servicoEditando.querySelector(".MineBotao input").checked;
    document.getElementById("titulo-servico").textContent = "Editar serviço";
    Janela.style.display = "flex";
    
}

// Fechar janela
function fecharJanela() {
    Janela.style.display = "none";
}

// Salvar serviço
formulario.addEventListener("submit", async function(event) {
    event.preventDefault();
    const { createServices, updateServices } = await import("../../cliente/js/api.js");
    const nome = document.getElementById("nome").value;
    const duracao = document.getElementById("duracao").value;
    const valor = document.getElementById("valor").value;
    const disponivel = document.getElementById("disponivel").checked;

    if (servicoEditando) {
      const formatValue = Number(valor.replace("R$ ", "").trim())
      const payload = { name: nome, value: formatValue, duration: Number(duracao), isActive: disponivel}
      const response = await updateServices(servicoEditando.dataset.id, payload);
      if (response.erro) {
        return alert(`Erro ao criar serviço - ${response.message}`);
      }
      refreshServices();
    } else {
      const response = await createServices(nome, valor, duracao);
      if (response.erro) {
        return alert(`Erro ao criar serviço - ${response.message}`);
      }
      refreshServices();
    }

    fecharJanela();
});

// Excluir serviço
async function excluirServico(botao) {
  const { deleteServices } = await import("../../cliente/js/api.js");
  const servico = botao.closest(".servico");
  if (confirm("Deseja excluir este serviço?")) {
      const response = await deleteServices(servico.dataset.id)
      if(response.error){
        return alert(`Erro ao apagar serviço - ${response.message}`)
      }
      servico.remove();
  }
};

// #region Leonardo Sousa
const servicesContainer = document.getElementById("lista-servicos");
const serviceComponent = document.getElementById("service-component").content;
const renderServices = () => {
  if(servicesContainer && serviceComponent){
    servicesContainer.replaceChildren()
    serviceList.forEach( service => {
      const clone = serviceComponent.cloneNode(true)
      const title = clone.querySelector("#title")
      const info = clone.querySelector("#infos")
      const isActive = clone.querySelector("#is-active")

      clone.querySelector(".servico").dataset.id = service._id
      title.textContent = service.name
      info.textContent = `${service.duration} min · R$ ${service.value.toFixed(2)}`
      isActive.checked = service.isActive

      servicesContainer.appendChild(clone)
    })
  }
}

const refreshServices = async () => {
  const { getAllServices } = await import("../../cliente/js/api.js");
  const response = await getAllServices();
  if (response.error) {
    return (servicesContainer.innerHTML =
      '<div style="width: 100%" class="servico">Nenhum serviço criado.<div>');
  }
  serviceList = response.data;

  renderServices()
};

const changeServiceStatus = async (toggle) => {
  const { updateServices } = await import("../../cliente/js/api.js");
  const service = toggle.closest(".servico");
  const response = await updateServices(service.dataset.id, {isActive: toggle.checked});
  if (response.erro) {
    alert(`Erro ao atualizar o status de serviço - ${response.message}`);
    return refreshServices()
  }
};

(async () => {
  refreshServices()
})();
// #endregion 


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

