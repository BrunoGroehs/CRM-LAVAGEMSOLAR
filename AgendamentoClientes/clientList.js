document.addEventListener("DOMContentLoaded", async () => {
    const listaClientes = document.getElementById("listaClientes");
    const inputPesquisa = document.getElementById("pesquisa");
    const btnPesquisar = document.getElementById("btn_pesquisar");
    const filtros = document.querySelectorAll(".filtro-btn");

    async function carregarClientes() {
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (!response.ok) throw new Error("Erro ao buscar clientes.");
            let clientes = await response.json();
            atualizarLista(clientes);
        } catch (error) {
            console.error("Erro:", error);
        }
    }

    function atualizarLista(clientes) {
        const tbody = document.querySelector("#listaClientes tbody");
        tbody.innerHTML = "";

        clientes.forEach(cliente => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.id_cliente}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.valor_servico}</td>
            `;
            tr.addEventListener("click", () => abrirPopUp(cliente));
            tbody.appendChild(tr);
        });
    }

    function abrirPopUp(cliente) {
        const popup = window.open("", "popup", "width=400,height=400");
        popup.document.write(`
            <html>
            <head>
                <title>Detalhes do Cliente</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { margin-top: 0; }
                    p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <h2>Detalhes do Cliente</h2>
                <p><strong>Nome:</strong> ${cliente.nome}</p>
                <p><strong>ID:</strong> ${cliente.id_cliente}</p>
                <p><strong>Telefone:</strong> ${cliente.telefone}</p>
                <p><strong>Valor do Serviço:</strong> ${cliente.valor_servico}</p>
                <button onclick="window.close()">Fechar</button>
            </body>
            </html>
        `);
    }

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
        }
    }

    btnPesquisar.addEventListener("click", pesquisarClientes);

    filtros.forEach(botao => {
        botao.addEventListener("click", () => {
            const filtro = botao.dataset.filtro;
            filtrarClientes(filtro);
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");
        });
    });

    carregarClientes();
});
