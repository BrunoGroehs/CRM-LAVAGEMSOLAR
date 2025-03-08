document.addEventListener("DOMContentLoaded", async () => {
    const listaClientes = document.getElementById("listaClientes");
    const inputPesquisa = document.getElementById("pesquisa");
    const btnPesquisar = document.getElementById("btn_pesquisar");
    const botoesFiltro = document.querySelectorAll(".filtro-btn");
    let clientes = [];

    const iconesStatus = {
        "1": "src/icons/aguardandoAgendamento.png",
        "2": "src/icons/clienteNaoQuer.png",
        "3": "src/icons/reagendado.png",
        "4": "src/icons/aguardandoAgendamento.png",
        "5": "src/icons/limpezaEfetuada.png",
    };

    async function carregarClientes() {
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (!response.ok) throw new Error("Erro ao buscar clientes.");
            clientes = await response.json();
            atualizarLista(clientes);
        } catch (error) {
            console.error("Erro:", error);
        }
    }

    function atualizarLista(clientesFiltrados) {
        const tbody = document.querySelector("#listaClientes tbody");
        tbody.innerHTML = "";

        clientesFiltrados.forEach(cliente => {
            // Trata o status para buscar o ícone correspondente
            const statusServico = cliente.status_servico && cliente.status_servico.descricao
                ? cliente.status_servico.descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                : "";
            const statusId = cliente.status_servico_id ? String(cliente.status_servico_id) : "";
            const iconeStatus = (iconesStatus[statusServico] || iconesStatus[statusId])
                ? `<img src="${iconesStatus[statusServico] || iconesStatus[statusId]}" alt="${statusServico}" width="50">`
                : "Sem status";

            // Utiliza os campos atualizados de telefone e endereço
            const whatsappLink = `https://api.whatsapp.com/send?phone=${cliente.telefone_cliente}&text=mensagem%20de%20teste`;
            const whatsappIcon = `<a href="${whatsappLink}" target="_blank" onclick="event.stopPropagation()">
                                      <img src="src/icons/wpp.png" alt="WhatsApp" width="50">
                                  </a>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${whatsappIcon}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cidade || "Sem endereço"}</td>
                <td>${cliente.telefone || "Sem telefone"}</td>
                <td>${cliente.quantidade_placas}</td>
                <td>${cliente.valor_servico}</td>
                <td>${cliente.valor_marcado}</td>
                <td>${new Date(cliente.proxima_data_agendamento).toLocaleDateString("pt-BR")}</td>
                <td>${new Date(cliente.data_marcada).toLocaleDateString("pt-BR")}</td>
                <td>${iconeStatus}</td>
            `;

            // Evento para redirecionar à página de detalhes (exceto quando o ícone é clicado)
            tr.addEventListener("click", (event) => {
                if (window.getSelection().toString().length === 0) {
                    abrirNovaPagina(cliente);
                }
            });

            tbody.appendChild(tr);
        });
    }

    function abrirNovaPagina(cliente) {
        const url = `clientData.html?nome=${encodeURIComponent(cliente.nome)}&id_cliente=${encodeURIComponent(cliente.id_cliente)}&telefone=${encodeURIComponent(cliente.telefone_cliente)}&valor_servico=${encodeURIComponent(cliente.valor_servico)}`;
        window.location.href = url;
    }

    async function pesquisarClientes() {
        const termo = inputPesquisa.value.toLowerCase();
        const filtrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(termo));
        atualizarLista(filtrados);
    }

    // Estado para controle da alternância de ordenação para os filtros que ordenam
    let toggleOrders = {
        valor: 'desc',
        limpeza: 'asc',
        recontato: 'asc'
    };

    function filtrarClientes(filtro) {
        let clientesFiltrados = [...clientes];

        switch (filtro) {
            case "valor":
                // Ordena com base no campo valor_servico.
                if (toggleOrders.valor === 'asc') {
                    clientesFiltrados.sort((a, b) => a.valor_servico - b.valor_servico);
                    toggleOrders.valor = 'desc';
                } else {
                    clientesFiltrados.sort((a, b) => b.valor_servico - a.valor_servico);
                    toggleOrders.valor = 'asc';
                }
                break;
            case "limpeza":
                // Filtra registros que possuem data_marcada (indicando que a limpeza foi efetuada)
                clientesFiltrados = clientesFiltrados.filter(cliente => cliente.data_marcada);
                // Ordena com base na data_marcada, alternando entre ascendente e descendente
                if (toggleOrders.limpeza === 'asc') {
                    clientesFiltrados.sort((a, b) => new Date(a.data_marcada) - new Date(b.data_marcada));
                    toggleOrders.limpeza = 'desc';
                } else {
                    clientesFiltrados.sort((a, b) => new Date(b.data_marcada) - new Date(a.data_marcada));
                    toggleOrders.limpeza = 'asc';
                }
                break;
            case "recontato":
                /* Ordena considerando:
                   - Se a limpeza foi efetuada (data_marcada existe), utiliza essa data;
                   - Caso contrário, utiliza a proxima_data_agendamento.
                   A ordenação alterna entre ascendente e descendente a cada clique. */
                if (toggleOrders.recontato === 'asc') {
                    clientesFiltrados.sort((a, b) => {
                        let dataA = a.data_marcada ? new Date(a.data_marcada) : new Date(a.proxima_data_agendamento);
                        let dataB = b.data_marcada ? new Date(b.data_marcada) : new Date(b.proxima_data_agendamento);
                        return dataA - dataB;
                    });
                    toggleOrders.recontato = 'desc';
                } else {
                    clientesFiltrados.sort((a, b) => {
                        let dataA = a.data_marcada ? new Date(a.data_marcada) : new Date(a.proxima_data_agendamento);
                        let dataB = b.data_marcada ? new Date(b.data_marcada) : new Date(b.proxima_data_agendamento);
                        return dataB - dataA;
                    });
                    toggleOrders.recontato = 'asc';
                }
                break;
            default:
                break;
        }
        atualizarLista(clientesFiltrados);
    }

    btnPesquisar.addEventListener("click", pesquisarClientes);

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            const filtro = botao.getAttribute("data-filtro");
            filtrarClientes(filtro);
        });
    });

    carregarClientes();
});
