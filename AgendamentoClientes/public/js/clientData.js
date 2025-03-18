document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get("nome");
  const telefone = params.get("telefone");
  const valorServico = params.get("valor_servico");
  const status_servico_id = params.get("status_servico_id");
  const id_cliente = params.get("id_cliente");
  
  // Preencher dados existentes
  document.getElementById("nome-cliente").textContent = nome || "Nome não informado";
  document.getElementById("id_cliente").textContent = id_cliente || "N/A";
  document.getElementById("telefone").textContent = telefone || "Telefone não informado";
  document.getElementById("valor_marcado").textContent = valorServico || "0,00";
  
  // Selecionar o status conforme o valor vindo da URL (ou manter a opção padrão)
  const statusSelect = document.getElementById("status-cliente");
  if (status_servico_id && [...statusSelect.options].some(option => option.value === status_servico_id)) {
    statusSelect.value = status_servico_id;
  } else {
    statusSelect.value = "";
  }
  
  // Configurar o link do WhatsApp com o telefone do cliente
  const whatsappLink = `https://api.whatsapp.com/send?phone=${telefone}&text=mensagem%20de%20teste`;
  const whatsappAnchor = document.getElementById("whatsapp-link");
  if (whatsappAnchor) {
    whatsappAnchor.href = whatsappLink;
  }
  
  // Carregar histórico do cliente
  carregarHistorico(id_cliente);
  
  // Torna as funções acessíveis globalmente para uso em onclick inline
  window.salvarAgendamento = salvarAgendamento;
  window.salvarInformacoesCliente = salvarInformacoesCliente;
  window.salvarTudo = salvarTudo;
});

// Função para carregar o histórico do cliente
function carregarHistorico(clienteId) {
  fetch(`http://localhost:3000/historico/${clienteId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar histórico");
      }
      return response.json();
    })
    .then(data => {
      const historicoContainer = document.getElementById("conteudo-historico");
      historicoContainer.innerHTML = "";
      data.forEach(item => {
        const dataHistorico = new Date(item.data_historico).toLocaleString("pt-BR");
        const formattedValor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor);
        const p = document.createElement("p");
        p.textContent = `${dataHistorico}: ${formattedValor} - ${item.descricao}`;
        p.style.cursor = "pointer";
        p.setAttribute("data-id", item.id);
        // Ao clicar, abre o pop-up para confirmar exclusão
        p.addEventListener("click", () => {
          abrirPopup(item.id);
        });
        historicoContainer.appendChild(p);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar histórico:", error);
      showToast("Erro ao carregar histórico.", "error");
    });
}

// Função para abrir o pop-up de confirmação de exclusão
function abrirPopup(historicoId) {
  const overlay = document.createElement("div");
  overlay.id = "popup-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";
  
  const popup = document.createElement("div");
  popup.id = "popup-excluir";
  popup.style.backgroundColor = "#fff";
  popup.style.padding = "20px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.25)";
  popup.innerHTML = `
    <p>Deseja excluir este registro?</p>
    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
      <button id="btn-excluir">Excluir</button>
      <button id="btn-cancelar">Cancelar</button>
    </div>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  document.getElementById("btn-excluir").addEventListener("click", () => {
    excluirHistorico(historicoId);
  });
  document.getElementById("btn-cancelar").addEventListener("click", fecharPopup);
}

// Função para fechar o pop-up
function fecharPopup() {
  const overlay = document.getElementById("popup-overlay");
  if (overlay) {
    overlay.remove();
  }
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
      if (!response.ok) {
        throw new Error("Erro ao adicionar histórico");
      }
      return response.json();
    })
    .then(data => {
      if (data.historico) {
        const historicoContainer = document.getElementById("conteudo-historico");
        const dataHistorico = new Date(data.historico.data_historico).toLocaleString("pt-BR");
        const formattedValor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.historico.valor);
        const p = document.createElement("p");
        p.textContent = `${dataHistorico}: ${formattedValor} - ${data.historico.descricao}`;
        p.style.cursor = "pointer";
        p.setAttribute("data-id", data.historico.id);
        p.addEventListener("click", () => {
          abrirPopup(data.historico.id);
        });
        historicoContainer.insertBefore(p, historicoContainer.firstChild);
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


// Função para salvar apenas o agendamento (dentro da div Novo Agendamento)
function salvarAgendamento() {
  const id_cliente = document.getElementById("id_cliente").textContent;
  const descricaoAgendamento = document.getElementById("descricao-agendamento").value;
  const valorAgendamento = document.getElementById("valor-agendamento").value;
  const dataAgendamento = document.getElementById("data-agendamento").value;

  if (!descricaoAgendamento.trim() || !valorAgendamento.trim() || !dataAgendamento.trim()) {
    showToast("Preencha todos os campos do agendamento!", "error");
    return;
  }

  adicionarHistorico(id_cliente, descricaoAgendamento, valorAgendamento, dataAgendamento);
}

// Função para salvar apenas as informações do cliente (dentro da div Informações do Cliente)
function salvarInformacoesCliente() {
  console.log("id_cliente");
  const id_cliente = document.getElementById("id_cliente").textContent;
  const statusCliente = document.getElementById("status-cliente").value;
  const tempoRecontato = document.getElementById("tempo-recontato").value;
  
  // Exibir os valores para conferir se estão corretos
  console.log("ID do cliente:", id_cliente);
  console.log("Status do cliente:", statusCliente);
  console.log("Tempo para recontato:", tempoRecontato);
  
  // Cria o objeto payload com o status do cliente
  let payload = {
    status_cliente: statusCliente
  };

  // Se o usuário tiver selecionado um tempo, adiciona no payload.
  // Caso contrário, podemos enviar null (se o backend esperar isso) ou omitir o campo
  if (tempoRecontato) {
    payload.tempo_recontato = tempoRecontato;
  } else {
    payload.tempo_recontato = null; // ajuste conforme o que o seu backend espera
  }
  
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
        // Tenta ler a resposta para ver mais detalhes do erro
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


// Função para salvar tudo junto
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
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "20px";
    toastContainer.style.right = "20px";
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.marginTop = "10px";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  toast.style.color = "#fff";
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
