document.addEventListener("DOMContentLoaded", () => {
    const btnGravar = document.querySelector(".btn_geral"); // Primeiro botão "Gravar"

    btnGravar.addEventListener("click", async () => {
        const cliente = {
            // id: document.getElementById("f_id").value.trim(),
            nome: document.getElementById("f_nome").value.trim(),
            celular: document.getElementById("f_celular").value.trim(),
            email: document.getElementById("f_email").value.trim(),
            dataNasc: document.getElementById("f_dataNasc").value.trim()
        };

        // Validação básica
        if (!cliente.nome || !cliente.celular || !cliente.email) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/contatos", {
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
