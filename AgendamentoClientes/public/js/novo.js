/* 
  //novo.js (antigo)
*/
document.addEventListener("DOMContentLoaded", () => {
    const btnGravar = document.querySelector(".btn_geral"); // Primeiro botão "Gravar"

    btnGravar.addEventListener("click", async () => {
        const cliente = {
            nome: document.getElementById("f_nome").value.trim(),
            celular: document.getElementById("f_celular").value.trim(),
            endereco: document.getElementById("f_endereco").value.trim(),
            cidade : document.getElementById("f_cidade").value.trim(),
            qntPlacas : document.getElementById("f_qntPlacas").value.trim(),
            valor : document.getElementById("f_valor").value.trim()
        };

        // Validação básica
        if (!cliente.nome || !cliente.celular || !cliente.endereco || !cliente.cidade || !cliente.qntPlacas || !cliente.valor) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/clientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                alert("Cliente cadastrado com sucesso!");
                // Limpa os campos após o cadastro
                document.querySelectorAll("input").forEach(input => input.value = "");
            } else {
                alert("Erro ao cadastrar cliente.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão com o servidor.");
        }
    });
});
