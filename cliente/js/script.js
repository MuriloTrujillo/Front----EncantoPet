/*  Memória  */

import { createSchedule, listScheduleDay, login, getAllSchedule } from "./api.js";

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
    formulario.addEventListener("submit", async function (evento) {
      evento.preventDefault(); // não deixa a página recarregar sozinha

      if(formulario.id == "form-login"){
        const email = formulario.querySelector("#adm-email").value;
        const password = formulario.querySelector("#adm-senha").value;

        const response = await login(email, password)

        if(response.error){
          return mostrarAviso(formulario, response.message.split(" - ")[2])
        }
        
        return window.location.href = "../../Adm/pages/painel.html"
      }

      // Trata os demais formularios
      var proxima = formulario.getAttribute("data-proxima");
      // formulário sem data-proxima (o do ADM) só mostra o aviso
      if (!proxima) {
        mostrarAviso(formulario, formulario.getAttribute("data-aviso"));
        return;
      }

      // na pg de serviços, pelo menos um tem que ser selecionado
      var lista = formulario.querySelector(".lista-servicos");
      if (lista && !lista.querySelector("input:checked")) {
        mostrarAviso(
          formulario,
          "Escolha pelo menos um serviço para continuar.",
        );
        return;
      }
      guardarDados(lerFormulario(formulario));

      

      if (formulario.getAttribute("data-proxima") == "confirmacao.html") {
        const data = sessionStorage.getItem("encanto-agendamento");
        const response = await createSchedule(data);

        if( !response.error ){
          window.location.href = proxima;
        }
      } else {
        window.location.href = proxima; // abre na mesma aba
      }
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
      valor = valor.join(", "); // serviços ="Banho, Hidratação"
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

// Dynamic data
async function renderAvailableHours() {
  const hoursOptions = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  const hoursContainer = document.querySelector(".lista-horarios");
  const hourComponent = document.querySelector(".horario");

  if (!hoursContainer) {
    return;
  }

  // Selected date
  let currentSelectedDay = JSON.parse(
    sessionStorage.getItem("encanto-agendamento"),
  ).data;
  let unavailableHours = await listScheduleDay(currentSelectedDay);

  document
    .querySelector("#schedule-date")
    .addEventListener("change", async (e) => {
      console.log(e.target.valueAsDate?.toISOString());
      unavailableHours = await listScheduleDay(
        e.target.valueAsDate?.toISOString(),
      );

      hoursContainer.replaceChildren();
      hoursOptions.forEach((hoursOption) => {
        const clone = hourComponent.cloneNode(true);
        clone.querySelector("input").value = hoursOption;
        clone.querySelector("span").textContent = hoursOption;

        unavailableHours.schedules.map((scheduleDay) => {
          if (hoursOption == scheduleDay.hour) {
            clone.style = "opacity: 50%; pointer-events: none";
            return hoursContainer.appendChild(clone);
          }
        });

        hoursContainer.appendChild(clone);
      });
    });

  hoursContainer.replaceChildren();
  hoursOptions.forEach((hoursOption) => {
    const clone = hourComponent.cloneNode(true);
    clone.querySelector("input").value = hoursOption;
    clone.querySelector("span").textContent = hoursOption;

    unavailableHours.schedules.map((scheduleDay) => {
      if (hoursOption == scheduleDay.hour) {
        clone.style = "opacity: 50%; pointer-events: none";
        return hoursContainer.appendChild(clone);
      }
    });

    hoursContainer.appendChild(clone);
  });
}

function renderNextSchedules (data) {
  const nextScheduleContainer = document.querySelector("#next-schedule")
  const scheduleComponent = document.querySelector("#next-schedule-adm-tamplate").content
  
  data.forEach( schedule => {
    const clone = scheduleComponent.cloneNode(true)
    const date = new Date(schedule.date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    
    const hour = clone.querySelector(".hora")
    const info = clone.querySelector(".info")
    const status = clone.querySelector(".status")
    const statusRecord = { pending: "Aguardando", confirmed: "Confirmado", completed: "Completo", canceled: "Cancelado" }

    hour.textContent = date.split(",")[1].slice(0,6)
    info.innerHTML = `
      <b>${schedule.petId.name}</b> 
      ${schedule.servicos.map( service => service.name).join(" | ")} · ${schedule.clientId.name}</span>
    `
    status.textContent = `${statusRecord[schedule.status]}`
    status.className = `status ${statusRecord[schedule.status].toLowerCase()}`
    nextScheduleContainer.appendChild(clone)
  })
  
}

async function admScheduleDay() {
  const nextScheduleContainer = document.querySelector("#next-schedule")
  
  if(nextScheduleContainer){
    const today = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const schedules = await getAllSchedule().then( res => res.schedules )
    const todaySchedules = schedules.filter( schedule => {
      const scheduleDate = new Date(schedule.date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }).split(",")[0]
      return scheduleDate == today.split(",")[0]
    })
    console.log(schedules)
    console.log(todaySchedules)

    renderNextSchedules(todaySchedules)
  }
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

  // Call dynamics datas
  renderAvailableHours();
  admScheduleDay();

  configurarFormularios();
  atualizarPagina();
});

// Murilo Trujillo
