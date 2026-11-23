
const API_URL = "https://rickandmortyapi.com/api/character";

// ELEMENTOS HTML

const cardsContainer = document.getElementById("cards-container");
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");

const botaoAnterior = document.getElementById("pagina-anterior");
const botaoProxima = document.getElementById("pagina-proxima");
const indicadorPagina = document.getElementById("indicador-pagina");


// CONTROLE DA PAGINAÇÃO

let paginaAtual = 1;
let totalPaginas = 1;

let proximaUrl = null;
let anteriorUrl = null;
let carregando = false;

// FUNÇÃO PARA CARREGAR OS PERSONAGENS

async function carregarPersonagens(url = API_URL) {
    if (carregando) return;

    carregando = true;

    atualizarPaginacao();
    cardsContainer.innerHTML = "<p>Carregando personagens...</p>";

    try {

        // REALIZANDO A REQUISIÇÃO

        const resposta = await fetch(url);

        // VERIFICANDO ERROS HTTP

      
if (resposta.status === 429) {

    throw new Error(
        "A API recebeu muitas solicitações. Aguarde um pouco antes de tentar novamente."
    );

}

if (resposta.status === 404) {

    throw new Error(
        "Nenhum personagem encontrado. Tente outro nome."
    );

}

if (!resposta.ok) {

    throw new Error(
        "Erro no servidor. Código: " + resposta.status
    );

}


        // CONVERTENDO A RESPOSTA PARA JSON

        const dados = await resposta.json();


        // ATUALIZANDO AS INFORMAÇÕES DA PAGINAÇÃO

        const urlConsultada = new URL(url);

        paginaAtual = Number(
            urlConsultada.searchParams.get("page") || 1
        );

        totalPaginas = dados.info.pages;

        proximaUrl = dados.info.next;
        anteriorUrl = dados.info.prev;


        // LIMPANDO OS CARDS ANTERIORES

        cardsContainer.innerHTML = "";


        // PERCORRENDO OS PERSONAGENS

        dados.results.forEach(function(personagem) {

            // CRIANDO O CARD

            const card = document.createElement("div");
            card.classList.add("card");


            // CRIANDO O NOME

            const nomePersonagem = document.createElement("h3");

            nomePersonagem.textContent = personagem.name;


            // CRIANDO A IMAGEM

            const imagem = document.createElement("img");

            imagem.src = personagem.image;
imagem.alt = personagem.name;
imagem.loading = "lazy";

// CASO A IMAGEM NÃO CARREGUE

imagem.onerror = function() {
    imagem.alt = "Imagem indisponível";
    imagem.style.display = "none";
};


            // CRIANDO O STATUS

            const status = document.createElement("p");

            let situacao = personagem.status;

            if (situacao === "Alive") {
                situacao = "Vivo";

            } else if (situacao === "Dead") {
                situacao = "Morto";

            } else {
                situacao = "Desconhecido";
            }

            status.textContent = "Status: " + situacao;


            // ADICIONANDO AS CLASSES DO STATUS

            status.classList.add("status");

            status.classList.add(
                "status-" + personagem.status.toLowerCase()
            );


            // ADICIONANDO OS ELEMENTOS AO CARD

            card.appendChild(nomePersonagem);
            card.appendChild(imagem);
            card.appendChild(status);


            // ADICIONANDO O CARD AO HTML

            cardsContainer.appendChild(card);

        });


        // ATUALIZANDO OS BOTÕES

        atualizarPaginacao();


    } catch (erro) {

        console.error("Erro ao carregar personagens:", erro);

        cardsContainer.innerHTML = "";

        const mensagem = document.createElement("p");
        mensagem.classList.add("mensagem");

        
if (erro instanceof TypeError) {

    mensagem.textContent =
        "Falha na comunicação com a API. Pode ser uma instabilidade, bloqueio temporário ou problema de CORS. Tente novamente em alguns minutos.";

} else {

    mensagem.textContent = erro.message;

}


        cardsContainer.appendChild(mensagem);

        proximaUrl = null;
        anteriorUrl = null;

        atualizarPaginacao();

    }
    finally {

    carregando = false;

    atualizarPaginacao();

}

}


// FUNÇÃO PARA ATUALIZAR A PAGINAÇÃO

function atualizarPaginacao() {

    indicadorPagina.textContent =
        `Página ${paginaAtual} de ${totalPaginas}`;

    botaoAnterior.disabled = carregando || !anteriorUrl;

    botaoProxima.disabled = carregando || !proximaUrl;

}


// EVENTO DA BARRA DE PESQUISA

formBusca.addEventListener("submit", function(event) {

    event.preventDefault();

    const nomeBusca = campoBusca.value.trim();

    // CRIANDO A URL DA PESQUISA

    const url = new URL(API_URL);

    if (nomeBusca !== "") {
        url.searchParams.set("name", nomeBusca);
    }

    // TODA NOVA PESQUISA COMEÇA NA PRIMEIRA PÁGINA

    carregarPersonagens(url.toString());

});


// BOTÃO DE PÁGINA ANTERIOR

botaoAnterior.addEventListener("click", function() {

    if (anteriorUrl) {
        carregarPersonagens(anteriorUrl);
    }

});


// BOTÃO DE PRÓXIMA PÁGINA

botaoProxima.addEventListener("click", function() {

    if (proximaUrl) {
        carregarPersonagens(proximaUrl);
    }

});


// CARREGAMENTO INICIAL

carregarPersonagens();

