CRM-LAVAGEMSOLAR
Sistema simples de gerenciamento de clientes e agendamentos para serviço de lavagem de placas solares. Permite cadastrar clientes, registrar históricos de agendamentos e gerenciar status de cada atendimento.

Sumário
Visão Geral
Estrutura de Pastas
Tecnologias Utilizadas
Como Executar
Endpoints Principais
Contato
Visão Geral
O CRM-LAVAGEMSOLAR é um projeto que serve como um pequeno CRM (Customer Relationship Management) voltado para serviços de limpeza de placas solares. Ele:

Lista Clientes (com nome, telefone, endereço, valor de serviço, etc.).
Cadastra Clientes (via formulário de criação).
Registra Histórico (adiciona e exclui registros de agendamento).
Gerencia Status (aguardando agendamento, limpeza efetuada, etc.).
A aplicação é dividida em front-end (HTML, CSS, JavaScript) e back-end (Node.js, Express, PostgreSQL).

Estrutura de Pastas
text
Copy
Edit
CRM-LAVAGEMSOLAR/
├── backend
│   ├── config
│   │   └── connectData.js        // Configurações de conexão ao banco
│   ├── controllers               // Lógica de cada recurso (CRUD de clientes, histórico)
│   │   ├── clientController.js
│   │   └── historicoController.js
│   ├── routes                    // Definições de rotas que chamam os controllers
│   │   ├── clientRoutes.js
│   │   └── historicoRoutes.js
│   ├── app.js                    // Arquivo principal do servidor Express
│   ├── package.json
│   └── package-lock.json
│
├── node_modules                  // Dependências instaladas pelo npm
│
└── public                        // Pasta servida estaticamente pelo Express
    ├── css
    │   └── style.css             // Estilos do front-end
    ├── icons                     // Ícones utilizados no front-end
    │   ├── aguardandoAgendamento.png
    │   ├── clienteNaoQuer.png
    │   ├── limpezaEfetuada.png
    │   ├── oportunidade.png
    │   ├── reagendado.png
    │   └── wpp.png
    ├── js
    │   ├── clientData.js
    │   ├── clientList.js
    │   ├── frontend.js
    │   └── novo.js
    ├── index.html                // Tela principal com iframe
    ├── clientData.html           // Tela de detalhes do cliente
    ├── clientList.html           // Tela de listagem e pesquisa de clientes
    ├── home.html
    ├── gestao.html
    ├── novo.html
    └── sobre.html
Método de Organização
Arquitetura em Camadas (inspirada em MVC):
Controllers: contêm a lógica de negócio (por exemplo, inserir, buscar, atualizar clientes).
Routes: definem as URLs/endpoints e chamam os métodos nos controllers.
Config: guarda configurações, como a conexão ao banco de dados.
Public: todos os arquivos de front-end (HTML, CSS, JS, imagens/ícones).
No app.js, usamos:

js
Copy
Edit
app.use(express.static(path.join(__dirname, '..', 'public')));
para servir todo o conteúdo estático da pasta public.

Tecnologias Utilizadas
Node.js e Express: para construir o servidor e gerenciar rotas.
PostgreSQL: como banco de dados para armazenar clientes e histórico.
HTML, CSS, JavaScript: para o front-end, consumindo a API via fetch().
Fetch API: para fazer requisições HTTP ao back-end.
Como Executar
Instale as dependências:

bash
Copy
Edit
cd CRM-LAVAGEMSOLAR/backend
npm install
Configure o banco:

Edite o arquivo connectData.js com suas credenciais (usuário, senha, host, porta, database).
Inicie o servidor:

bash
Copy
Edit
npm start
ou

bash
Copy
Edit
node app.js
Acesse a aplicação:
Abra o navegador em:

arduino
Copy
Edit
http://localhost:3000
Isso irá carregar o index.html (que está na pasta public).

Endpoints Principais
GET /clientes
Retorna todos os clientes cadastrados.

POST /clientes
Cria um novo cliente. O corpo da requisição deve conter dados como nome, celular, email, dataNasc, etc.

GET /historico/:cliente_id
Retorna o histórico de agendamentos de um cliente específico.

POST /historico
Cria um novo registro de histórico (agendamento) para um cliente.

DELETE /historico/:id
Exclui um registro de histórico específico.

Contato
Em caso de dúvidas ou sugestões, fique à vontade para abrir uma issue ou enviar um pull request neste repositório do GitHub.

Este projeto foi desenvolvido como um simples CRM para agendamento e registro de serviços de lavagem de placas solares, servindo como base de aprendizado em Node.js, Express e PostgreSQL.
