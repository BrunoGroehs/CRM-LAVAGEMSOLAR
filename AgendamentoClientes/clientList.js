document.addEventListener("DOMContentLoaded", async () => {
    const listaClientes = document.getElementById("listaClientes");
    const inputPesquisa = document.getElementById("pesquisa");
    const btnPesquisar = document.getElementById("btn_pesquisar");
    const botoesFiltro = document.querySelectorAll(".filtro-btn");
    let clientes = [];

    const iconesStatus = {//PRECISO ARRUMAR AQUI
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
            const statusServico = cliente.status_servico && cliente.status_servico.descricao
                ? cliente.status_servico.descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                : "";

            const statusId = cliente.status_servico_id ? String(cliente.status_servico_id) : "";

            const icone = iconesStatus[statusServico] || iconesStatus[statusId]
                ? `<img src="${iconesStatus[statusServico] || iconesStatus[statusId]}" alt="${statusServico}" width="50">`
                : "Sem status";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.endereco}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.quantidade_placas}</td>
                <td>${cliente.valor_servico}</td>
                <td>${cliente.valor_marcado}</td>
                <td>${cliente.proxima_data_agendamento}</td>
                <td>${cliente.data_marcada}</td>
                <td>${icone}</td>
            `;

            tr.addEventListener("click", (event) => {
                const selection = window.getSelection();
                if (selection.toString().length === 0) {
                    abrirNovaPagina(cliente);
                }
            });

            tbody.appendChild(tr);
        });
    }

    function abrirNovaPagina(cliente) {
        const url = `clientData.html?nome=${encodeURIComponent(cliente.nome)}&id_cliente=${encodeURIComponent(cliente.id_cliente)}&telefone=${encodeURIComponent(cliente.telefone)}&valor_servico=${encodeURIComponent(cliente.valor_servico)}`;
        window.location.href = url;
    }

    async function pesquisarClientes() {
        const termo = inputPesquisa.value.toLowerCase();
        const filtrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(termo));
        atualizarLista(filtrados);
    }

    function filtrarClientes(filtro) {
        let clientesFiltrados = [...clientes];

        switch (filtro) {
            case "prioridade":
                clientesFiltrados.sort((a, b) => a.prioridade - b.prioridade);
                break;
            case "recentes":
                clientesFiltrados.sort((a, b) => new Date(b.data_adicionado) - new Date(a.data_adicionado));
                break;
            case "valor":
                clientesFiltrados.sort((a, b) => b.valor_servico - a.valor_servico);
                break;
            case "limpeza":
                clientesFiltrados = clientesFiltrados.filter(cliente => cliente.limpeza_efetuada);
                break;
            case "recontato":
                clientesFiltrados = clientesFiltrados.filter(cliente => cliente.efetuar_recontato);
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
