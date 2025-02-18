document.addEventListener("DOMContentLoaded", async () => {
    const listaClientes = document.getElementById("listaClientes");
    const inputPesquisa = document.getElementById("pesquisa");
    const btnPesquisar = document.getElementById("btn_pesquisar");
    const filtros = document.querySelectorAll(".filtro-btn");

    // Função para buscar clientes do servidor
    async function carregarClientes() {
        try {
            const response = await fetch("http://localhost:3000/clientes"); // Corrigido para /clientes
            if (!response.ok) throw new Error("Erro ao buscar clientes.");

            let clientes = await response.json();
            atualizarLista(clientes);
        } catch (error) {
            console.error("Erro:", error);
            listaClientes.innerHTML = "<li>Erro ao carregar clientes.</li>";
        }
    }

    // Função para atualizar a lista de clientes no HTML
    function atualizarLista(clientes) {
        listaClientes.innerHTML = ""; // Limpa a lista antes de renderizar
    
        clientes.forEach(cliente => {
            const li = document.createElement("li");
            li.textContent = `${cliente.nome} - ${cliente.id_cliente} - ${cliente.telefone} - Valor do servico: ${cliente.valor_servico}`;
            listaClientes.appendChild(li);
        });
    }    

    // Função para pesquisar clientes pelo nome
    async function pesquisarClientes() {
        const termo = inputPesquisa.value.toLowerCase();
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (!response.ok) throw new Error("Erro ao buscar clientes.");

            let clientes = await response.json();
            const filtrados = clientes.filter(cliente => 
                cliente.nome.toLowerCase().includes(termo)
            );
            atualizarLista(filtrados);
        } catch (error) {
            console.error("Erro:", error);
            listaClientes.innerHTML = "<li>Erro ao filtrar clientes.</li>";
        }
    }

    // Função para aplicar filtros
    async function filtrarClientes(filtro) {
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (!response.ok) throw new Error("Erro ao buscar clientes.");

            let clientes = await response.json();

            switch (filtro) {
                case "prioridade":
                    clientes.sort((a, b) => a.prioridade - b.prioridade);
                    break;
                case "recentes":
                    clientes.sort((a, b) => new Date(b.data_adicionado) - new Date(a.data_adicionado));
                    break;
                case "valor":
                    clientes.sort((a, b) => b.valor - a.valor);
                    break;
                case "limpeza":
                    clientes = clientes.filter(cliente => cliente.status === "limpeza efetuada");
                    break;
            }

            atualizarLista(clientes);
        } catch (error) {
            console.error("Erro:", error);
            listaClientes.innerHTML = "<li>Erro ao filtrar clientes.</li>";
        }
    }

    // Evento para pesquisar ao clicar no botão
    btnPesquisar.addEventListener("click", pesquisarClientes);

    // Evento para aplicar filtros ao clicar nos botões
    filtros.forEach(botao => {
        botao.addEventListener("click", () => {
            const filtro = botao.dataset.filtro;
            filtrarClientes(filtro);

            // Atualiza visualmente o botão ativo
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");
        });
    });

    // Carregar clientes ao iniciar a página
    carregarClientes();
});
