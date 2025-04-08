document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:3000/clientes");
        if (!response.ok) throw new Error("Erro ao buscar clientes.");
        const clientes = await response.json();

        const today = new Date();
        const overdueClients = clientes.filter(cliente => {
            const recontactDate = new Date(cliente.proxima_data_agendamento);
            return recontactDate < today && !isNaN(recontactDate);
        });

        const executedClients = clientes.filter(cliente => cliente.status_servico_id === 5);

        document.getElementById("overdue-count").textContent = overdueClients.length;
        document.getElementById("executed-count").textContent = executedClients.length;

        const iconesStatus = {
            "1": { src: "./icons/novo.png", title: "Novo" },
            "2": { src: "./icons/chamado.png", title: "Chamado" },
            "3": { src: "./icons/emContato.png", title: "Em contato" },
            "4": { src: "./icons/agendado.png", title: "Agendado" },
            "5": { src: "./icons/concluido.png", title: "Concluído" },
        };

        // Populate overdue clients modal
        const overdueList = document.querySelector("#overdue-list tbody");
        overdueClients.forEach(cliente => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <a href="https://api.whatsapp.com/send?phone=${cliente.telefone}" target="_blank">
                        <img src="./icons/wpp.png" alt="WhatsApp" width="30">
                    </a>
                </td>
                <td>${cliente.nome}</td>
                <td>${cliente.endereco || "Sem endereço"}</td>
                <td>${cliente.telefone || "Sem telefone"}</td>
                <td>${cliente.quantidade_placas || "N/A"}</td>
                <td>${cliente.valor_servico || "N/A"}</td>
                <td>${new Date(cliente.proxima_data_agendamento).toLocaleDateString("pt-BR")}</td>
                <td>
                    <img src="${iconesStatus[cliente.status_servico_id]?.src}" 
                         alt="${iconesStatus[cliente.status_servico_id]?.title}" 
                         title="${iconesStatus[cliente.status_servico_id]?.title}" 
                         width="30">
                </td>
            `;
            row.addEventListener("click", () => openClientData(cliente));
            overdueList.appendChild(row);
        });

        // Populate executed services modal
        const executedList = document.querySelector("#executed-list tbody");
        executedClients.forEach(cliente => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${new Date(cliente.data_marcada).toLocaleDateString("pt-BR") || "N/A"}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.quantidade_placas || "N/A"}</td>
                <td>${cliente.valor_servico || "N/A"}</td>
                <td>
                    <img src="${iconesStatus[cliente.status_servico_id]?.src}" 
                         alt="${iconesStatus[cliente.status_servico_id]?.title}" 
                         title="${iconesStatus[cliente.status_servico_id]?.title}" 
                         width="30">
                </td>
            `;
            row.addEventListener("click", () => openClientData(cliente)); // Added click event for executed services
            executedList.appendChild(row);
        });

        // Calculate clients marked for the week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

        const weeklyClients = clientes.filter(cliente => {
            const markedDate = new Date(cliente.data_marcada);
            return (
                cliente.status_servico_id === 4 && // Status "marcado"
                markedDate >= startOfWeek &&
                markedDate <= endOfWeek
            );
        });

        const weeklyTotal = weeklyClients.reduce((sum, cliente) => sum + (cliente.valor_marcado || 0), 0);

        document.getElementById("weekly-clients").textContent = weeklyClients.length;
        document.getElementById("weekly-total").textContent = weeklyTotal.toFixed(2);

        // Display total number of clients
        document.getElementById("total-clients").textContent = clientes.length;

        // Add event listeners for modal open/close
        document.getElementById("div1").addEventListener("click", openOverdueModal);
        document.getElementById("div2").addEventListener("click", openExecutedModal);
        document.getElementById("div4").addEventListener("click", () => {
            window.location.href = "clientList.html"; // Redirect to clientList.html
        });
        document.querySelectorAll(".close").forEach(closeButton => {
            closeButton.addEventListener("click", () => {
                document.querySelectorAll(".modal").forEach(modal => modal.style.display = "none");
            });
        });
    } catch (error) {
        console.error("Erro ao carregar dados dos clientes:", error);
    }
});

function openOverdueModal() {
    document.getElementById("overdue-modal").style.display = "block";
}

function openExecutedModal() {
    document.getElementById("executed-modal").style.display = "block";
}

function openClientData(cliente) {
    const url = `clientData.html?nome=${encodeURIComponent(cliente.nome)}&id_cliente=${encodeURIComponent(cliente.id_cliente)}&telefone=${encodeURIComponent(cliente.telefone)}&valor_servico=${encodeURIComponent(cliente.valor_servico)}&status_servico_id=${encodeURIComponent(cliente.status_servico_id)}&proxima_data_agendamento=${encodeURIComponent(cliente.proxima_data_agendamento)}`;
    window.location.href = url;
}
