document.addEventListener("DOMContentLoaded", async () => {
    const listaClientes = document.getElementById("listaClientes");
    const inputPesquisa = document.getElementById("pesquisa");
    const btnPesquisar = document.getElementById("btn_pesquisar");
    const botoesFiltro = document.querySelectorAll(".filtro-btn");
    let clientes = [];

    const iconesStatus = {
        "pendente": "src/icons/aguardandoAgendamento.png",//aqui nao esta funcionando
        "confirmado": "src/icons/limpezaEfetuada.png",
        "concluido": "src/icons/reagendado.png",
        "cancelado": "src/icons/clienteNaoQuer.png",
        "aguardando agendamento": "src/icons/aguardando-agendamento.png",
        "cliente nao quer": "src/icons/cliente-nao-quer.png",
        "falou que quer fazer mais pra frente": "src/icons/mais-pra-frente.png",
        "nunca foi chamado": "src/icons/nunca-chamado.png",
        "efetuada a limpeza": "src/icons/limpezaEfetuada.png",
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
            const tr = document.createElement("tr");
            const statusLower = cliente.status_servico.toLowerCase();
            const icone = iconesStatus[statusLower]
                ? `<img src="${iconesStatus[statusLower]}" alt="${cliente.status_servico}" width="50">` //aqui preciso configurar no css
                : cliente.status_servico; // Se não houver ícone, exibe o próprio texto do status

            tr.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.endereco}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.quantidade_placas}</td>
                <td>${cliente.valor_servico}</td>
                <td>${cliente.valor_marcado}</td>
                <td>${cliente.proxima_data_agendamento}</td>
                <td>${"TESDT"}</td>
                <td>${icone}</td>
            `;

            // Evento de clique na linha
            tr.addEventListener("click", (event) => {
                const selection = window.getSelection();
                // Só abre a página se nenhum texto estiver selecionado
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
