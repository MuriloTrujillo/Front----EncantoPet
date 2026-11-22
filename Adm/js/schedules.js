
import { getAllSchedule } from "../../cliente/js/api.js";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho","julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const DIAS_LONGOS = [ "domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

const STATUS_RECORD = {pending: "Aguardando",confirmed: "Confirmado",completed: "Completo",canceled: "Cancelado"};

(async () => {
  const today = new Date();
  let skipDays = 0;

  const scheduleContainer = document.querySelector("#hoje-lista");
  const scheduleTemplate = document.querySelector("#next-schedule-adm-tamplate");

  if (!scheduleContainer || !scheduleTemplate) return;

  function getDateKey(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  
  function getSelectedDate() {
    const [year, month, day] = getDateKey(today)
      .split("-")
      .map(Number);

    const selectedDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    selectedDate.setUTCDate(
      selectedDate.getUTCDate() + skipDays
    );

    return selectedDate;
  }

  
  function renderHeader(selectedDate) {
    document.getElementById("hoje-dia").textContent = selectedDate.getUTCDate();
    document.getElementById("hoje-sem").textContent = DIAS_LONGOS[selectedDate.getUTCDay()];
    document.getElementById("hoje-mes").textContent = `${MESES[selectedDate.getUTCMonth()]} de ${selectedDate.getUTCFullYear()}`;
  }


  function renderNextSchedules(data) {
    scheduleContainer.replaceChildren();

    if (!data.length) {
      scheduleContainer.innerHTML =
        '<li class="vazio">Nada marcado para este dia.</li>';
      return;
    }

    data.forEach(schedule => {
      const clone = scheduleTemplate.content.cloneNode(true);

      const hour = clone.querySelector(".hora");
      const info = clone.querySelector(".info");
      const status = clone.querySelector(".status");

      const scheduleHour = new Date(schedule.date)
        .toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });

      hour.textContent = scheduleHour;

      const petName = schedule.petId?.name ?? "Pet não informado";
      const clientName = schedule.clientId?.name ?? "Cliente não informado";

      const services = (schedule.servicos ?? [])
        .map(service => service.name)
        .join(" | ");

      const petNameElement = document.createElement("b");
      petNameElement.textContent = petName;

      info.replaceChildren(
        petNameElement,
        document.createTextNode(` ${services} · ${clientName}`)
      );

      status.textContent = STATUS_RECORD[schedule.status] ?? schedule.status;
      status.className = `status ${STATUS_RECORD[schedule.status].toLowerCase()}`;
      scheduleContainer.appendChild(clone);
    });
  }


  function renderResume(schedules) {
    const dayResume = Object.keys(STATUS_RECORD).map(status => {
      const length = schedules.filter(schedule => schedule.status === status).length;
      return `${length} ${STATUS_RECORD[status]}`;
    });

    document.getElementById("hoje-resumo").textContent = dayResume.join(" · ");
  }

  try {
    const response = await getAllSchedule();
    const schedules = response.schedules ?? [];

    function updateSchedules() {
      const selectedDate = getSelectedDate();

      const selectedDateKey = [
        selectedDate.getUTCFullYear(),
        String(selectedDate.getUTCMonth() + 1).padStart(2, "0"),
        String(selectedDate.getUTCDate()).padStart(2, "0")
      ].join("-");

      const daySchedules = schedules.filter(schedule => {
        return getDateKey(new Date(schedule.date)) === selectedDateKey;
      });

      daySchedules.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      renderHeader(selectedDate);
      renderResume(daySchedules);
      renderNextSchedules(daySchedules);
    }

    // Primeira renderização
    updateSchedules();

    // Próximo dia
    document.querySelector("#skip-date-proximo")
      ?.addEventListener("click", () => {
        skipDays++;
        updateSchedules();
      });

    // Dia anterior
    document.querySelector("#skip-date-anterior")
      ?.addEventListener("click", () => {
        skipDays--;
        updateSchedules();
      });

  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);

    scheduleContainer.innerHTML =
      '<li class="vazio">Erro ao carregar agendamentos.</li>';
  }
})();
