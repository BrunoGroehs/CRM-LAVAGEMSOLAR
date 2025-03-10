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
    
    // Torna a função salvarTudo acessível globalmente para o onclick inline
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
          historicoContainer.appendChild(p);
        });
      })
      .catch(error => {
        console.error("Erro ao carregar histórico:", error);
        showToast("Erro ao carregar histórico.", "error");
      });
  }
    
  // Função para adicionar um novo registro de histórico
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
          // Insere o novo registro no início do container
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
    
  // Função chamada ao clicar em "Salvar Tudo"
  function salvarTudo() {
    const id_cliente = document.getElementById("id_cliente").textContent;
    const descricaoAgendamento = document.getElementById("descricao-agendamento").value;
    const valorAgendamento = document.getElementById("valor-agendamento").value;
    const dataAgendamento = document.getElementById("data-agendamento").value;
    
    if (!descricaoAgendamento.trim() || !valorAgendamento.trim() || !dataAgendamento.trim()) {
      showToast("Por favor, preencha a data, valor e descrição.", "error");
      return;
    }
    
    adicionarHistorico(id_cliente, descricaoAgendamento, valorAgendamento, dataAgendamento);
  }
    
  // Função para exibir um toast na tela
  function showToast(message, type) {
    // Cria o container do toast se não existir
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      document.body.appendChild(toastContainer);
    }
    
    // Cria o elemento do toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`; // Classes "toast" e "error" ou "success" para estilos diferenciados
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Remove o toast após 3 segundos
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 3000);
  }
  