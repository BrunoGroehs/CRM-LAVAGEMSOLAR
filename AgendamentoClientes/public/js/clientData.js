document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get("nome");
  const telefone = params.get("telefone");
  const valorServico = params.get("valor_servico");
  const status_servico_id = params.get("status_servico_id");
  const id_cliente = params.get("id_cliente");

  // Preencher dados existentes
  preencherDadosCliente({ nome, telefone, valorServico, status_servico_id, id_cliente });

  // Configurar o link do WhatsApp
  configurarWhatsAppLink(telefone);

  // Carregar histórico do cliente
  carregarHistorico(id_cliente);

  // Torna as funções acessíveis globalmente para uso em onclick inline
  window.salvarAgendamento = salvarAgendamento;
  window.salvarInformacoesCliente = salvarInformacoesCliente;
  window.salvarTudo = salvarTudo;
});

// Função para preencher os dados do cliente na interface
function preencherDadosCliente({ nome, telefone, valorServico, status_servico_id, id_cliente }) {
  document.getElementById("nome-cliente").textContent = nome || "Nome não informado";
  document.getElementById("id_cliente").textContent = id_cliente || "N/A";
  document.getElementById("telefone").textContent = telefone || "Telefone não informado";
  document.getElementById("valor_marcado").textContent = valorServico || "0,00";

  const statusSelect = document.getElementById("status-cliente");
  if (status_servico_id && [...statusSelect.options].some(option => option.value === status_servico_id)) {
    statusSelect.value = status_servico_id;
  } else {
    statusSelect.value = "";
  }
}

// Função para configurar o link do WhatsApp
function configurarWhatsAppLink(telefone) {
  const whatsappLink = `https://api.whatsapp.com/send?phone=${telefone}&text=mensagem%20de%20teste`;
  const whatsappAnchor = document.getElementById("whatsapp-link");
  if (whatsappAnchor) {
    whatsappAnchor.href = whatsappLink;
  }
}

// Função para carregar o histórico do cliente
function carregarHistorico(clienteId) {
  fetch(`http://localhost:3000/historico/${clienteId}`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar histórico");
      return response.json();
    })
    .then(data => {
      const historicoContainer = document.getElementById("conteudo-historico");
      historicoContainer.innerHTML = "";
      data.forEach(item => adicionarItemHistorico(historicoContainer, item));
    })
    .catch(error => {
      console.error("Erro ao carregar histórico:", error);
      showToast("Erro ao carregar histórico.", "error");
    });
}

// Função para adicionar um item ao histórico
function adicionarItemHistorico(container, item) {
  const dataHistorico = new Date(item.data_historico).toLocaleString("pt-BR");
  const formattedValor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor);
  const p = document.createElement("p");
  p.textContent = `${dataHistorico}: ${formattedValor} - ${item.descricao}`;
  p.style.cursor = "pointer";
  p.setAttribute("data-id", item.id);
  p.addEventListener("click", () => abrirPopup(item.id));
  container.appendChild(p);
}

// Função para abrir o pop-up de confirmação de exclusão
function abrirPopup(historicoId) {
  const overlay = document.createElement("div");
  overlay.id = "popup-overlay";
  overlay.style = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); display: flex;
    justify-content: center; align-items: center; z-index: 1000;
  `;

  const popup = document.createElement("div");
  popup.id = "popup-excluir";
  popup.style = `
    background-color: #fff; padding: 20px; border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.25);
  `;
  popup.innerHTML = `
    <p>Deseja excluir este registro?</p>
    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
      <button id="btn-excluir">Excluir</button>
      <button id="btn-cancelar">Cancelar</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById("btn-excluir").addEventListener("click", () => excluirHistorico(historicoId));
  document.getElementById("btn-cancelar").addEventListener("click", fecharPopup);
}

// Função para fechar o pop-up
function fecharPopup() {
  const overlay = document.getElementById("popup-overlay");
  if (overlay) overlay.remove();
}

// Função para excluir um registro do histórico
function excluirHistorico(historicoId) {
  fetch(`http://localhost:3000/historico/${historicoId}`, { method: "DELETE" })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao excluir histórico");
      return response.json();
    })
    .then(() => {
      fecharPopup();
      const clienteId = document.getElementById("id_cliente").textContent;
      carregarHistorico(clienteId);
      showToast("Histórico excluído com sucesso.", "success");
    })
    .catch(error => {
      console.error("Erro ao excluir histórico:", error);
      showToast("Erro ao excluir histórico.", "error");
    });
}

// Função para adicionar um novo registro de histórico (agendamento)
function adicionarHistorico(clienteId, descricao, valor, dataAgendamento) {
  fetch("http://localhost:3000/historico", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cliente_id: clienteId, descricao, valor, data_historico: dataAgendamento })
  })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao adicionar histórico");
      return response.json();
    })
    .then(data => {
      if (data.historico) {
        const historicoContainer = document.getElementById("conteudo-historico");
        adicionarItemHistorico(historicoContainer, data.historico);
        showToast("Histórico adicionado com sucesso.", "success");
      } else {
        console.error("Erro ao adicionar histórico:", data.error);
        showToast("Erro ao adicionar histórico.", "error");
      }
    })
    .catch(error => {
      console.error("Erro ao adicionar histórico:", error);
      showToast("Erro ao adicionar histórico.", "error");
    });
}

// Funções para salvar informações do cliente e agendamentos
function salvarAgendamento() {
  const id_cliente = document.getElementById("id_cliente").textContent;
  const descricaoAgendamento = document.getElementById("descricao-agendamento").value.trim();
  const valorAgendamento = document.getElementById("valor-agendamento").value.trim();
  let dataAgendamento = document.getElementById("data-agendamento").value.trim();

  // Verifica se todos os campos estão preenchidos
  if (!descricaoAgendamento || !valorAgendamento || !dataAgendamento) {
    showToast("Preencha todos os campos do agendamento!", "error");
    return;
  }

  // Converte a string da data em um objeto Date e transforma em ISO
  const data = new Date(dataAgendamento);
  if (isNaN(data.getTime())) {
    showToast("Data inválida! Verifique o formato.", "error");
    return;
  }
  dataAgendamento = data.toISOString();

  let payload = {
    data_marcada: dataAgendamento
  };

  console.log("Teste Payload", payload);

  fetch(`http://localhost:3000/clientes/${id_cliente}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error("Resposta do servidor:", text);
          throw new Error("Erro ao salvar informações do cliente.");
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Resposta do servidor:", data);
      showToast("Informações do cliente salvas com sucesso!", "success");
    })
    .catch(error => {
      console.error("Erro ao salvar cliente:", error);
      showToast("Erro ao salvar informações do cliente.", "error");
    });

  adicionarHistorico(id_cliente, descricaoAgendamento, valorAgendamento, dataAgendamento);
}

function salvarInformacoesCliente() {
  const params = new URLSearchParams(window.location.search);
  const proximaDataAgendamento = params.get("proxima_data_agendamento");

  const tempoRecontatoInput = document.getElementById("tempo-recontato").value;

  let novaDataAgendamento = proximaDataAgendamento;

  if (proximaDataAgendamento && tempoRecontatoInput) {
    const dias = parseInt(tempoRecontatoInput, 10);
    let data = new Date(proximaDataAgendamento);
    data.setDate(data.getDate() + dias);
    novaDataAgendamento = data.toISOString();
  }

  const id_cliente = document.getElementById("id_cliente").textContent;
  const statusCliente = document.getElementById("status-cliente").value;

  let payload = {
    status_cliente: statusCliente,
    proxima_data_agendamento: novaDataAgendamento
  };

  payload.tempo_recontato = tempoRecontatoInput ? tempoRecontatoInput : null;

  console.log("Payload que será enviado:", payload);

  fetch(`http://localhost:3000/clientes/${id_cliente}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error("Resposta do servidor:", text);
          throw new Error("Erro ao salvar informações do cliente.");
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Resposta do servidor:", data);
      showToast("Informações do cliente salvas com sucesso!", "success");
    })
    .catch(error => {
      console.error("Erro ao salvar cliente:", error);
      showToast("Erro ao salvar informações do cliente.", "error");
    });
}

function salvarTudo() {
  salvarAgendamento();
  salvarInformacoesCliente();
}

// Função para exibir um toast na tela
function showToast(message, type) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style = `
      position: fixed; top: 20px; right: 20px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style = `
    margin-top: 10px; padding: 10px 20px; border-radius: 5px;
    background-color: ${type === "success" ? "#4CAF50" : "#f44336"};
    color: #fff;
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
