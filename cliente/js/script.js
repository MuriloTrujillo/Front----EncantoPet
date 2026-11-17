
/*  Memória  */

//  os nomes (chaves) usados no localStorage e no sessionStorage, onde as informações ficam guardadas
var GAVETA_TEMA = "encanto-tema";
var GAVETA_DADOS = "encanto-agendamento";

// se o navegador não consegguir guardar as informações, vai pra nessa memória aqui

var memoria = {};

// esse aqui pega algo q eu guardei. "tipo" é armazenamento local 
function pegar(tipo, nome) {
  try {
    return window[tipo].getItem(nome);
  } catch (erro) {
    return memoria[nome] || null;
  }
}

// armazena algo no storage (localStorage ou sessionStorage)
function guardar(tipo, nome, valor) {
  try {
    window[tipo].setItem(nome, valor);
  } catch (erro) {
    memoria[nome] = valor;
  }
}


// TEMA CLARO / ESCURO 🌓

// coloca o tema lá no <html>
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
}

// se o usuário que está acessando o site já escolheu um dos temas antes, sempre vai usar ele
// se ele(a) nunca escolheu nehum dos temas, usa o do sistema dela (seja do celular, tablet, ipad, ou pc) (claro ou escuro)
var temaSalvo = pegar("localStorage", GAVETA_TEMA);
var sistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
aplicarTema(temaSalvo || (sistemaEscuro ? "escuro" : "claro"));


function trocarTema() {
  var atual = document.documentElement.getAttribute("data-tema");
  var novo = atual === "escuro" ? "claro" : "escuro";
  aplicarTema(novo);
  guardar("localStorage", GAVETA_TEMA, novo);
}


/* DADOS DAS ETAPAS */

// pega tudo que já foi guardado (nome, pet, serviço...)
function pegarDados() {
  var texto = pegar("sessionStorage", GAVETA_DADOS);
  return texto ? JSON.parse(texto) : {};
}

// junta oq q vc acabou de preencher com o que já tinha antes
function guardarDados(novos) {
  var dados = pegarDados();
  Object.assign(dados, novos);
  guardar("sessionStorage", GAVETA_DADOS, JSON.stringify(dados));
}

// lê o que a pessoa preencheu no formulário
function lerFormulario(formulario) {
  var dados = {};

  Array.from(formulario.elements).forEach(function (campo) {
    if (!campo.name) {
      return;
    }

    if (campo.type === "checkbox") {
      // ppossibilidade de escolher diferentes serviços
      dados[campo.name] = dados[campo.name] || [];
      if (campo.checked) {
        dados[campo.name].push(campo.value);
      }
    } else if (campo.type === "radio") {
      // horário: só um marcado
      if (campo.checked) {
        dados[campo.name] = campo.value;
      }
    } else {
      // o resto (nome, telefone, data...) 
      dados[campo.name] = campo.value;
    }
  });

  return dados;
}

//os campos já aparecem preenchidos de novo msm se voltar
function preencherFormulario(formulario) {
  var dados = pegarDados();

  Array.from(formulario.elements).forEach(function (campo) {
    var valor = dados[campo.name];
    if (!campo.name || valor === undefined) {
      return;
    }

    if (campo.type === "checkbox") {
      campo.checked = valor.indexOf(campo.value) !== -1;
    } else if (campo.type === "radio") {
      campo.checked = valor === campo.value;
    } else {
      campo.value = valor;
    }
  });
}

// o aviso embaixo do formulário 
function mostrarAviso(formulario, mensagem) {
  var aviso = formulario.querySelector(".aviso");
  if (aviso) {
    aviso.textContent = mensagem;
    aviso.hidden = false;
  }
}

// 1. guarda o que foi preenchido
// 2. vai pra próxima página (a que tá no data-proxima do formulário)

function configurarFormularios() {
  document.querySelectorAll("form").forEach(function (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();   // não deixa a página recarregar sozinha

      var proxima = formulario.getAttribute("data-proxima");

      // formulário sem data-proxima (o do ADM) só mostra o aviso
      if (!proxima) {
        mostrarAviso(formulario, formulario.getAttribute("data-aviso"));
        return;
      }

  // na pg de serviços, pelo menos um tem que ser selecionado

      var lista = formulario.querySelector(".lista-servicos");
      if (lista && !lista.querySelector("input:checked")) {
        mostrarAviso(formulario, "Escolha pelo menos um serviço para continuar.");
        return;
      }

      guardarDados(lerFormulario(formulario));
      window.location.href = proxima;   // abre na mesma aba
    });
  });
}


/* CONFIRMAÇÃO  */

// observação com mais letras que isso (ou com enter) aparece num cardzinho embaixo do título
var LIMITE_OBSERVACAO = 20;

function formatarData(texto) {
  var partes = texto.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function preencherResumo() {
  var dados = pegarDados();

  document.querySelectorAll("[data-resumo]").forEach(function (item) {
    var nome = item.getAttribute("data-resumo");
    var valor = dados[nome];

    if (typeof valor === "string") {
      valor = valor.trim();   // só espaços ou enter também conta como vazio
    }
    if (Array.isArray(valor)) {
      valor = valor.join(", ");   // serviços ="Banho, Hidratação"
    }
    if (nome === "data" && valor) {
      valor = formatarData(valor);
    }

    // se não tiver nada, mostra o texto do data-vazio (ex.: "Nenhuma observação presente") ou um traço
    item.textContent = valor || item.getAttribute("data-vazio") || "—";

    // observação grande: avisa o CSS (pela classe) pra mostrar num card
    if (nome === "observacoes") {
      var grande = valor && (valor.length > LIMITE_OBSERVACAO || valor.indexOf("\n") !== -1);
      item.parentElement.classList.toggle("observacao-grande", !!grande);
    }
  });
}


/* Abertura do site */

// atualiza preenchendo os campos da página que tá aberta
function atualizarPagina() {
  document.querySelectorAll("form[data-proxima]").forEach(preencherFormulario);
  preencherResumo();
}

document.addEventListener("DOMContentLoaded", function () {
  // os botões 🌓 trocam o tema (coloquei em todas as páginas)
  document.querySelectorAll("[data-botao-tema]").forEach(function (botao) {
    botao.addEventListener("click", trocarTema);
  });

  // página de agendamento não deixa escolher um dia que já foi
  var campoData = document.querySelector('input[type="date"]');
  if (campoData) {
    // "sv-SE" aprendi com meu tio pra data sair como 2026-10-20 (ano-mês-dia) no horário daqui
    campoData.min = new Date().toLocaleDateString("sv-SE");
  }

  configurarFormularios();
  atualizarPagina();
});

// Murilo Trujillo