// Configuração do Firebase do TESTE (participante)
const firebaseConfig = {
    apiKey: "AIzaSyCyH4CIG08T4bPDmYd5N-5Q1FSyTCMX_6I",
    authDomain: "teste-disc-bricobread.firebaseapp.com",
    projectId: "teste-disc-bricobread",
    storageBucket: "teste-disc-bricobread.firebasestorage.app",
    messagingSenderId: "827161354543",
    appId: "1:827161354543:web:d92fc84518f507e5f601da"
};

// Inicialize o Firebase e o Firestore (evita reinit)
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Elementos de UI
const homePage = document.getElementById('home-page');
const quizPage = document.getElementById('quiz-page');
const resultsPage = document.getElementById('results-page');
const infoForm = document.getElementById('info-form');
const quizForm = document.getElementById('quiz-form');
const questionsContainer = document.getElementById('questions-container');
const participantNameEl = document.getElementById('participant-name');
const profileTextEl = document.getElementById('profile-text');
const restartButton = document.getElementById('restart-button');

let userFullName = '';
let discChartInstance = null;

// Banco de perguntas (completo)
const discQuestions = [
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Determinado", profile: "D", explanation: "Você age com foco, firmeza e direcionamento para alcançar objetivos." },
            { text: "Confiante", profile: "I", explanation: "Demonstra convicção e segurança nas suas ações e ideias, inspirando os outros." },
            { text: "Consistente", profile: "S", explanation: "Você mantém um padrão regular e previsível de comportamento, valorizando a rotina." },
            { text: "Preciso", profile: "C", explanation: "Seu trabalho e atenção são focados nos detalhes, buscando a exatidão e a qualidade." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Apressado", profile: "D", explanation: "Tende a agir rapidamente e com urgência, querendo ver resultados logo." },
            { text: "Persuasivo", profile: "I", explanation: "Você tem facilidade em convencer os outros a concordar com suas ideias ou ponto de vista." },
            { text: "Metódico", profile: "S", explanation: "Prefere seguir um sistema, planos e procedimentos estabelecidos." },
            { text: "Cuidadoso", profile: "C", explanation: "Analisa a situação com atenção e evita riscos desnecessários." }
        ]
    },
    {
        question:"Selecione o que mais te descreve",
        options: [
            { text: "Competitivo", profile: "D", explanation: "Busca superar desafios e adversários, impulsionado pela vitória." },
            { text: "Político", profile: "I", explanation: "Possui habilidade para negociar e lidar com diferentes pessoas e opiniões." },
            { text: "Cooperativo", profile: "S", explanation: "Gosta de trabalhar em equipe, apoiando e buscando o consenso com os outros." },
            { text: "Diplomata", profile: "C", explanation: "Age com tato e discrição, buscando a harmonia e evitando conflitos." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Objetivo", profile: "D", explanation: "Foca no essencial e nos resultados, sem desviar-se para detalhes irrelevantes." },
            { text: "Exagerado", profile: "I", explanation: "Tende a amplificar ou superestimar fatos e emoções em suas narrativas." },
            { text: "Estável", profile: "S", explanation: "Você se mantém calmo e equilibrado, mesmo diante de pressões ou mudanças." },
            { text: "Exato", profile: "C", explanation: "Busca a precisão e a correção em todas as informações e tarefas." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Assertivo", profile: "D", explanation: "Comunica suas opiniões e necessidades de forma clara e direta." },
            { text: "Otimista", profile: "I", explanation: "Geralmente vê o lado positivo das situações e espera bons resultados." },
            { text: "Paciente", profile: "S", explanation: "Tem capacidade de esperar com calma, sem irritação ou ansiedade." },
            { text: "Prudente", profile: "C", explanation: "Pensa cuidadosamente antes de agir, evitando impulsividade e riscos." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Fazedor", profile: "D", explanation: "Orientado para a ação, você gosta de iniciar e concretizar tarefas rapidamente." },
            { text: "Inspirador", profile: "I", explanation: "Motiva os outros com entusiasmo e visão, estimulando a participação." },
            { text: "Persistente", profile: "S", explanation: "Mantém o esforço em algo, mesmo diante de dificuldades, até alcançar o objetivo." },
            { text: "Perfeccionista", profile: "C", explanation: "Busca a excelência e a ausência total de falhas em tudo que faz." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Agressivo", profile: "D", explanation: "Pode agir de forma impetuosa ou confrontadora para atingir seus fins." },
            { text: "Expansivo", profile: "I", explanation: "Gosta de compartilhar emoções e pensamentos, sendo muito aberto e comunicativo." },
            { text: "Possessivo", profile: "S", explanation: "Valoriza a manutenção do que possui, seja objetos ou relacionamentos, com forte apego." },
            { text: "Julgador", profile: "C", explanation: "Analisa e avalia criticamente situações e pessoas com base em critérios e regras." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Decidido", profile: "D", explanation: "Você faz escolhas e toma ações com firmeza e sem hesitação." },
            { text: "Flexível", profile: "I", explanation: "Adapta-se facilmente a novas ideias, planos ou mudanças de cenário." },
            { text: "Previsível", profile: "S", explanation: "Seus comportamentos e reações são consistentes, facilitando a antecipação de suas atitudes." },
            { text: "Sistemático", profile: "C", explanation: "Prefere uma abordagem organizada e lógica, seguindo um método definido." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Inovador", profile: "D", explanation: "Gosta de criar e implementar novas ideias, buscando soluções originais." },
            { text: "Comunicativo", profile: "I", explanation: "Tem grande facilidade e prazer em se expressar e interagir com outras pessoas." },
            { text: "Agradável", profile: "S", explanation: "Sua conduta é amigável e simpática, buscando manter um ambiente positivo." },
            { text: "Elegante", profile: "C", explanation: "Aprecia e busca a excelência e o refinamento, com bom gosto e apuro nos detalhes." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Autoritário", profile: "D", explanation: "Assume a liderança com firmeza, impondo decisões quando necessário." },
            { text: "Extravagante", profile: "I", explanation: "Comportamento vistoso ou exagerado, buscando chamar a atenção e ser notado." },
            { text: "Modesto", profile: "S", explanation: "Prefere manter-se discreto e humilde, sem buscar os holofotes para si." },
            { text: "Desconfiado", profile: "C", explanation: "Tende a questionar informações e intenções até que se provem verdadeiras ou seguras." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Enérgico", profile: "D", explanation: "Demonstra grande vigor e disposição para agir e realizar tarefas." },
            { text: "Entusiasmado", profile: "I", explanation: "Gosta de expressar grande alegria e interesse, contagiando os outros." },
            { text: "Calmo", profile: "S", explanation: "Você mantém a tranquilidade e a serenidade, mesmo em situações tensas." },
            { text: "Disciplinado", profile: "C", explanation: "Segue regras e padrões de conduta com rigor e autocontrole." }
        ]
    },
    {
        question: "Selecione o que mais te descreve", //Questão 12
        options: [
            { text: "Firme", profile: "D", explanation: "Age com solidez e convicção, mantendo sua posição e decisões." },
            { text: "Expressivo", profile: "I", explanation: "Manifesta suas emoções e ideias de forma clara e visível." },
            { text: "Amável", profile: "S", explanation: "Mostra simpatia, bondade e afeto no trato com as pessoas." },
            { text: "Formal", profile: "C", explanation: "Adere a protocolos e convenções, prezando a seriedade e o respeito às regras." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Visionário", profile: "D", explanation: "Tem a capacidade de antecipar o futuro e criar grandes objetivos." },
            { text: "Criativo", profile: "I", explanation: "Gosta de gerar novas ideias e soluções originais, pensando fora da caixa." },
            { text: "Ponderado", profile: "S", explanation: "Avalia as situações com calma e equilíbrio, evitando decisões precipitadas." },
            { text: "Detalhista", profile: "C", explanation: "Preocupa-se com os pormenores, observando e cuidando de cada pequena parte." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Egocêntrico", profile: "D", explanation: "Tem forte foco em si mesmo, nas próprias necessidades e desejos." },
            { text: "Tagarela", profile: "I", explanation: "Gosta muito de conversar e expressar-se verbalmente, podendo falar em excesso." },
            { text: "Acomodado", profile: "S", explanation: "Prefere o conforto e a rotina, evitando esforços extras ou mudanças drásticas." },
            { text: "Retraído", profile: "C", explanation: "Tende a ser reservado e pouco expansivo em situações sociais ou novas." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Inspira confiança", profile: "D", explanation: "Suas atitudes e comunicação geram credibilidade e segurança nos outros." },
            { text: "Convincente", profile: "I", explanation: "Você é capaz de fazer os outros acreditarem em suas propostas ou pontos de vista." },
            { text: "Compreensivo", profile: "S", explanation: "Tem facilidade em entender os sentimentos e as perspectivas dos outros." },
            { text: "Pontual", profile: "C", explanation: "Preza a chegada e a entrega de tarefas no horário exato e combinado." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Intimidade", profile: "D", explanation: "Gosta de estabelecer conexões diretas e profundas nos relacionamentos." },
            { text: "Sem cerimônia", profile: "I", explanation: "Você se expressa de forma descontraída e informal, sem muitas formalidades." },
            { text: "Reservado", profile: "S", explanation: "Prefere manter seus sentimentos e pensamentos guardados, sem grande exposição." },
            { text: "Intransigente", profile: "C", explanation: "Você não cede facilmente em seus princípios ou opiniões, mantendo-se firme." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Vigoroso", profile: "D", explanation: "Apresenta grande força e energia em suas ações e esforços." },
            { text: "Caloroso", profile: "I", explanation: "Demonstra afeto, entusiasmo e acolhimento nas interações sociais." },
            { text: "Gentil", profile: "S", explanation: "Trata os outros com delicadeza, cortesia e atenção." },
            { text: "Preocupado", profile: "C", explanation: "Tende a se focar nos detalhes e possíveis problemas, com grande atenção para o que pode dar errado." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Ousado", profile: "D", explanation: "Gosta de correr riscos e agir com coragem diante de desafios." },
            { text: "Sedutor", profile: "I", explanation: "Tem charme e habilidade para atrair e encantar pessoas, buscando influenciá-las." },
            { text: "Harmonizador", profile: "S", explanation: "Busca resolver conflitos e manter a paz e o equilíbrio nas relações." },
            { text: "Cauteloso", profile: "C", explanation: "Age com muita prudência, examinando bem as situações para evitar erros ou perigos." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Força de vontade", profile: "D", explanation: "Possui uma determinação inabalável para atingir seus objetivos." },
            { text: "Espontâneo", profile: "I", explanation: "Age de forma natural e imediata, sem muita preparação ou hesitação." },
            { text: "Satisfeito", profile: "S", explanation: "Você se contenta com a situação atual e não busca grandes mudanças." },
            { text: "Conservador", profile: "C", explanation: "Prefere seguir tradições e manter o que já é conhecido e testado." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Exigente", profile: "D", explanation: "Estabelece altos padrões para si e para os outros, buscando performance máxima." },
            { text: "Sociável", profile: "I", explanation: "Gosta de interagir com muitas pessoas e de participar de grupos sociais." },
            { text: "Leal", profile: "S", explanation: "Você é fiel e dedicado às pessoas e aos compromissos que assume." },
            { text: "Rigoroso", profile: "C", explanation: "Aplica regras e métodos de forma estrita, buscando conformidade total." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Pioneiro", profile: "D", explanation: "Gosta de ser o primeiro a fazer algo, explorando novas áreas e ideias." },
            { text: "Divertido", profile: "I", explanation: "Você tem bom humor e facilidade para tornar os ambientes mais alegres e leves." },
            { text: "Tranquilo", profile: "S", explanation: "Mantém a calma e a serenidade, sem se perturbar facilmente." },
            { text: "Convencional", profile: "C", explanation: "Prefere seguir normas e padrões aceitos, evitando o incomum ou o inovador." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Ambicioso", profile: "D", explanation: "Busca grandes conquistas e crescimento profissional ou pessoal." },
            { text: "Radiante", profile: "I", explanation: "Você irradia alegria e entusiasmo, contagiando as pessoas ao redor." },
            { text: "Regulado", profile: "S", explanation: "Prefere ter as coisas organizadas e sob controle, seguindo um plano." },
            { text: "Calculista", profile: "C", explanation: "Analisa friamente as situações, buscando a lógica e os resultados objetivos." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Inquisitivo", profile: "D", explanation: "Faz perguntas, explora e investiga para obter mais informações e clareza." },
            { text: "Oferecido", profile: "I", explanation: "Gosta de se dispor a ajudar ou participar, mesmo sem ser solicitado formalmente." },
            { text: "Rígido Consigo", profile: "S", explanation: "Define padrões elevados e cobra muito de si mesmo, buscando a autodisciplina." },
            { text: "Cético", profile: "C", explanation: "Você tende a duvidar ou questionar fatos e ideias até que sejam comprovados." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Audacioso", profile: "D", explanation: "Não tem medo de arriscar e tomar iniciativas corajosas." },
            { text: "Extrovertido", profile: "I", explanation: "Aberto, comunicativo e voltado para interações sociais e o mundo exterior." },
            { text: "Casual", profile: "S", explanation: "Prefere um estilo de vida descontraído e informal, sem muitas preocupações." },
            { text: "Meticuloso", profile: "C", explanation: "Presta atenção extrema aos detalhes, buscando a perfeição em cada etapa." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Direto", profile: "D", explanation: "Sua comunicação é clara, franca e sem rodeios, indo direto ao ponto." },
            { text: "Prolixo", profile: "I", explanation: "Você fala muito e com riqueza de detalhes, às vezes de forma excessiva." },
            { text: "Moderado", profile: "S", explanation: "Prefere o caminho do meio, evitando extremos e excessos em suas ações." },
            { text: "Processual", profile: "C", explanation: "Valoriza a ordem e a sequência correta das etapas para realizar algo." }
        ]
    },
    {
        question: "Selecione o que mais te descreve",
        options: [
            { text: "Ter controle", profile: "D", explanation: "Gosta de gerenciar situações e pessoas, exercendo influência direta." },
            { text: "Ser reconhecido", profile: "I", explanation: "Sua motivação vem da aprovação e dos elogios dos outros." },
            { text: "Ter estabilidade", profile: "S", explanation: "Busca segurança, rotina e um ambiente sem grandes mudanças." },
            { text: "Estar correto", profile: "C", explanation: "Preocupação em fazer tudo de forma impecável e sem erros." }
        ]
    }
];

// Renderiza as perguntas
function renderQuestions() {
    questionsContainer.innerHTML = '';
    discQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `<p>${index + 1}. ${q.question}</p>`;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        q.options.forEach((opt, optIndex) => {
            const radioId = `q${index}_opt${optIndex}`;
            optionsDiv.innerHTML += `
                <label for="${radioId}">
                    <input type="radio" id="${radioId}" name="question${index}" value="${opt.profile}" required>
                    <span class="option-main-text">${opt.text}</span> <!-- Texto principal da opção -->
                    ${opt.explanation ? `<span class="option-explanation">${opt.explanation}</span>` : ''}
                </label>
            `;
        });

        questionDiv.appendChild(optionsDiv);
        questionsContainer.appendChild(questionDiv);
    });
}

// Navegação: início do teste
infoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userFullName = document.getElementById('full-name').value.trim();
    if (!userFullName) return;
    homePage.classList.remove('active');
    quizPage.classList.add('active');
    renderQuestions();
});

// Finalizar teste
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateResults();
    quizPage.classList.remove('active');
    resultsPage.classList.add('active');
});

// Recomeçar
restartButton.addEventListener('click', () => {
    resultsPage.classList.remove('active');
    homePage.classList.add('active');
    document.getElementById('full-name').value = '';
    document.getElementById('email').value = '';
    quizForm.reset();
    if (discChartInstance) {
        discChartInstance.destroy();
        discChartInstance = null;
    }
    profileTextEl.textContent = '';
    participantNameEl.textContent = '';
});

// Calcula e exibe
function calculateResults() {
    const formData = new FormData(quizForm);
    const profiles = { 'D': 0, 'I': 0, 'S': 0, 'C': 0 };

    for (const [, value] of formData.entries()) {
        if (profiles.hasOwnProperty(value)) profiles[value]++;
    }

    displayResults(profiles);
    saveResultsToFirebase(profiles);
}

// Salva no Firestore
function saveResultsToFirebase(profiles) {
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('full-name').value.trim();
    const timestamp = new Date().toISOString();

    db.collection("resultadosDISC").add({
        nome: name,
        email: email,
        dominancia: profiles.D,
        influencia: profiles.I,
        estabilidade: profiles.S,
        conformidade: profiles.C,
        data: timestamp
    })
    .then((docRef) => {
        console.log("Documento salvo com ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Erro ao adicionar documento: ", error);
    });
}

// Exibe o gráfico + texto
function displayResults(profiles) {
    participantNameEl.textContent = `Resultado do Teste DISC - BricoBread de ${userFullName}`;

    const labels = ['Dominância (D)', 'Influência (I)', 'Estabilidade (S)', 'Conformidade (C)'];
    const data = [profiles.D, profiles.I, profiles.S, profiles.C];
    const backgroundColors = ['#a30000', '#2980b9', '#2ecc71', '#555'];

    const ctx = document.getElementById('disc-chart').getContext('2d');

    if (discChartInstance) discChartInstance.destroy();

    discChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Número de Respostas',
                data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 26, title: { display: true, text: 'Número de Respostas' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    const predominantProfile = Object.keys(profiles).reduce((a, b) => profiles[a] > profiles[b] ? a : b);
    let profileDescription = '';
    switch (predominantProfile) {
        case 'D':
            profileDescription = `O seu perfil predominante é Dominância. Pessoas com este perfil tendem a ser diretas, orientadas para resultados e gostam de assumir o controle. São motivadas por desafios e por alcançar metas de forma rápida e eficiente.`;
            break;
        case 'I':
            profileDescription = `O seu perfil predominante é Influência. Você tende a ser extrovertido, comunicativo e persuasivo. É motivado por reconhecimento social e por influenciar positivamente as pessoas ao seu redor.`;
            break;
        case 'S':
            profileDescription = `O seu perfil predominante é Estabilidade. Este perfil se destaca pela calma, paciência e consistência. Você valoriza a segurança, a colaboração em equipe e prefere ambientes de trabalho estáveis e previsíveis.`;
            break;
        case 'C':
            profileDescription = `O seu perfil predominante é Conformidade. Você é uma pessoa analítica, detalhista e focada em qualidade. A sua motivação é fazer o trabalho de forma correta, seguindo procedimentos e buscando a precisão em tudo o que faz.`;
            break;
    }
    profileTextEl.innerHTML = profileDescription;
}