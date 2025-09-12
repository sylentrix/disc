// START OF FILE script.js

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
const questionCardContainer = document.getElementById('question-card-container');
const participantNameEl = document.getElementById('participant-name');
const profileTextEl = document.getElementById('profile-text');
const restartButton = document.getElementById('restart-button');

// Novos botões de voltar específicos para o quiz e resultados
const quizBackButton = document.getElementById('quiz-back-button');
const resultsBackToQuizButton = document.getElementById('results-back-to-quiz-button');

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Canvas para os gráficos
const discBarChartCtx = document.getElementById('disc-bar-chart')?.getContext('2d');
const discRadarChartCtx = document.getElementById('disc-radar-chart')?.getContext('2d');

let userFullName = '';
let userEmail = '';
let discBarChartInstance = null; // Renomeado para não conflitar
let discRadarChartInstance = null; // Novo para o radar chart
let currentQuestionIndex = 0;
let userAnswers = []; // Para armazenar o perfil selecionado para cada pergunta

// Mapeamento de cores para os perfis (ajustado para ser usado diretamente)
const profileColors = {
    'D': '#a30000', // Vermelho para Dominância
    'I': '#2980b9', // Azul para Influência
    'S': '#318a20ff', // Verde para Estabilidade
    'C': '#555'     // Cinza escuro para Conformidade
};


// Dados de prós e contras para cada perfil DISC
const profileDetails = {
    'D': {
        description: `O seu perfil predominante é Dominância. Pessoas com este perfil tendem a ser diretas, orientadas para resultados e gostam de assumir o controle. São motivadas por desafios e por alcançar metas de forma rápida e eficiente.`,
        pros: [
            "Direto e objetivo, focado em resultados.",
            "Liderança natural, toma decisões rápidas.",
            "Ousado e corajoso para enfrentar desafios.",
            "Proativo e inovador."
        ],
        cons: [
            "Pode ser impaciente ou agressivo.",
            "Exigente demais consigo e com os outros.",
            "Pode ignorar detalhes importantes.",
            "Insensível ou pouco diplomático."
        ],
        generalDescription: "objetividade, orientação a resultados, rapidez e busca por controle."
    },
    'I': {
        description: `O seu perfil predominante é Influência. Você tende a ser extrovertido, comunicativo e persuasivo. É motivado por reconhecimento social e por influenciar positivamente as pessoas ao seu redor.`,
        pros: [
            "Altamente comunicativo e persuasivo.",
            "Otimista, entusiasmado e inspirador.",
            "Excelente em networking e fazer conexões.",
            "Motiva e engaja outras pessoas com carisma."
        ],
        cons: [
            "Pode ser desorganizado e disperso.",
            "Foca demais na popularidade e aprovação.",
            "Tendência a falar em excesso ou superficialmente.",
            "Distrai-se facilmente de detalhes e processos."
        ],
        generalDescription: "comunicação envolvente, otimismo e alta energia social."
    },
    'S': {
        description: `O seu perfil predominante é Estabilidade. Este perfil se destaca pela calma, paciência e consistência. Você valoriza a segurança, a colaboração em equipe e prefere ambientes de trabalho estáveis e previsíveis.`,
        pros: [
            "Paciente, consistente e confiável.",
            "Leal, busca harmonia e colaboração em equipe.",
            "Bom ouvinte e oferece apoio ao time.",
            "Calmo e estável, mesmo sob pressão."
        ],
        cons: [
            "Resistente a mudanças e novidades.",
            "Lento para se adaptar a novas situações.",
            "Pode ser possessivo (com pessoas ou ideias).",
            "Averso a riscos e pode evitar confrontos."
        ],
        generalDescription: "calma, paciência, consistência e busca por colaboração."
    },
    'C': {
        description: `O seu perfil predominante é Conformidade. Você é uma pessoa analítica, detalhista e focada em qualidade. A sua motivação é fazer o trabalho de forma correta, seguindo procedimentos e buscando a precisão em tudo o que faz.`,
        pros: [
            "Preciso, detalhista e altamente analítico.",
            "Focado em qualidade, exatidão e padrões.",
            "Sistemático, organizado e metódico.",
            "Diplomático e cauteloso em suas decisões."
        ],
        cons: [
            "Pode ser excessivamente crítico (de si e com os outros).",
            "Tendência a duvidar e questionar tudo.",
            "Indeciso devido à busca incessante por perfeição.",
            "Rígido com regras e procedimentos, pouco flexível."
        ],
        generalDescription: "precisão, atenção aos detalhes, análise crítica e busca pela qualidade."
    }
};

const textosDISC = {
  singles: {
    D: "Seu perfil é fortemente de Dominância.",
    I: "Seu perfil é predominantemente de Influência. Você se destaca pela comunicação envolvente, otimismo e alta energia social. Gosta de persuadir e inspirar as pessoas, buscando reconhecimento e interação. Em síntese, você é uma pessoa que naturalmente cativa e mobiliza.",
    S: "Seu perfil é predominantemente de Estabilidade. Você é calmo, paciente e valoriza a consistência e a cooperação. Prefere ambientes previsíveis e busca a harmonia em suas interações. Em síntese, você é um pilar de confiança e suporte para a equipe.",
    C: "Seu perfil é predominantemente de Conformidade. Você se caracteriza pela precisão, atenção aos detalhes e busca incessante pela qualidade. Valoriza a lógica, segue padrões e procedimentos, e é motivado por fazer as coisas corretamente. Em síntese, você é um guardião da excelência e da exatidão."
  },
  combos: {
    DI: "A combinação de Dominância e Influência o torna um líder carismático e realizador. Você toma decisões com agilidade e entusiasmo, sendo capaz de inspirar e persuadir equipes para alcançar resultados ambiciosos. Sua energia contagiante é uma força motriz, mas é crucial balancear a busca por novas ideias com o foco na execução detalhada para evitar dispersão.",
    DS: "A Dominância combinada com a Estabilidade resulta em um perfil de liderança consistente e confiável. Você busca resultados com firmeza, mas de forma paciente e harmoniosa, valorizando a segurança da equipe. É um líder que impulsiona o progresso, mantendo o ambiente de trabalho coeso e previsível, embora possa resistir a mudanças bruscas.",
    DC: "Este perfil une a assertividade da Dominância com a precisão da Conformidade. Você é um executor focado em resultados de alta qualidade, garantindo que as metas sejam alcançadas com rigor e exatidão. Sua liderança é estratégica e analítica, mas é importante evitar a paralisia por excesso de análise e manter a flexibilidade quando necessário.",
    ID: "A combinação de Dominância e Influência o torna um líder carismático e realizador. Você toma decisões com agilidade e entusiasmo, sendo capaz de inspirar e persuadir equipes para alcançar resultados ambiciosos. Sua energia contagiante é uma força motriz, mas é crucial balancear a busca por novas ideias com o foco na execução detalhada para evitar dispersão.", // mesmo de DI
    IS: "A Influência em conjunto com a Estabilidade forma um perfil empático e colaborador, ideal para construir e manter relações. Você cativa as pessoas com seu otimismo, ao mesmo tempo em que oferece suporte e busca a harmonia no grupo. É um comunicador nato que promove um ambiente de confiança, mas precisa ter atenção para não evitar confrontos importantes em prol da paz.",
    IC: "A união de Influência e Conformidade cria um comunicador persuasivo e detalhista. Você inspira confiança e engajamento, ao mesmo tempo em que fundamenta suas ideias em dados e lógica rigorosa. Sua habilidade em apresentar propostas com clareza e precisão é valiosa, porém, pode ser desafiador equilibrar a busca por aprovação social com a crítica analítica.",
    SD: "A Dominância combinada com a Estabilidade resulta em um perfil de liderança consistente e confiável. Você busca resultados com firmeza, mas de forma paciente e harmoniosa, valorizando a segurança da equipe. É um líder que impulsiona o progresso, mantendo o ambiente de trabalho coeso e previsível, embora possa resistir a mudanças bruscas.", // mesmo de DS
    SI: "A Influência em conjunto com a Estabilidade forma um perfil empático e colaborador, ideal para construir e manter relações. Você cativa as pessoas com seu otimismo, ao mesmo tempo em que oferece suporte e busca a harmonia no grupo. É um comunicador nato que promove um ambiente de confiança, mas precisa ter atenção para não evitar confrontos importantes em prol da paz.", // mesmo de IS
    SC: "A Estabilidade combinada com a Conformidade resulta em um perfil focado em consistência, qualidade e processos. Você é um profissional confiável, metódico e extremamente preciso, garantindo a execução impecável de tarefas e o cumprimento de padrões. Sua dedicação à excelência é um trunfo, mas a aversão a riscos e a busca por perfeição podem atrasar a tomada de decisões ou a inovação.",
    CD: "Este perfil une a assertividade da Dominância com a precisão da Conformidade. Você é um executor focado em resultados de alta qualidade, garantindo que as metas sejam alcançadas com rigor e exatidão. Sua liderança é estratégica e analítica, mas é importante evitar a paralisia por excesso de análise e manter a flexibilidade quando necessário.", // mesmo de DC
    CI: "A união de Influência e Conformidade cria um comunicador persuasivo e detalhista. Você inspira confiança e engajamento, ao mesmo tempo em que fundamenta suas ideias em dados e lógica rigorosa. Sua habilidade em apresentar propostas com clareza e precisão é valiosa, porém, pode ser desafiador equilibrar a busca por aprovação social com a crítica analítica.", // mesmo de IC
    CS: "A Estabilidade combinada com a Conformidade resulta em um perfil focado em consistência, qualidade e processos. Você é um profissional confiável, metódico e extremamente preciso, garantindo a execução impecável de tarefas e o cumprimento de padrões. Sua dedicação à excelência é um trunfo, mas a aversão a riscos e a busca por perfeição podem atrasar a tomada de decisões ou a inovação." // mesmo de SC
  }
};


// Banco de perguntas (completo)
const discQuestions = [
    { question: "Selecione o que mais te descreve", options: [{ text: "Determinado", profile: "D", explanation: "Você age com foco, firmeza e direcionamento para alcançar objetivos." }, { text: "Confiante", profile: "I", explanation: "Demonstra convicção e segurança nas suas ações e ideias, inspirando os outros." }, { text: "Consistente", profile: "S", explanation: "Você mantém um padrão regular e previsível de comportamento, valorizando a rotina." }, { text: "Preciso", profile: "C", explanation: "Seu trabalho e atenção são focados nos detalhes, buscando a exatidão e a qualidade." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Apressado", profile: "D", explanation: "Tende a agir rapidamente e com urgência, querendo ver resultados logo." }, { text: "Persuasivo", profile: "I", explanation: "Você tem facilidade em convencer os outros a concordar com suas ideias ou ponto de vista." }, { text: "Metódico", profile: "S", explanation: "Prefere seguir um sistema, planos e procedimentos estabelecidos." }, { text: "Cuidadoso", profile: "C", explanation: "Analisa a situação com atenção e evita riscos desnecessários." }] },
    { question:"Selecione o que mais te descreve", options: [{ text: "Competitivo", profile: "D", explanation: "Busca superar desafios e adversários, impulsionado pela vitória." }, { text: "Político", profile: "I", explanation: "Possui habilidade para negociar e lidar com diferentes pessoas e opiniões." }, { text: "Cooperativo", profile: "S", explanation: "Gosta de trabalhar em equipe, apoiando e buscando o consenso com os outros." }, { text: "Diplomata", profile: "C", explanation: "Age com tato e discrição, buscando a harmonia e evitando conflitos." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Objetivo", profile: "D", explanation: "Foca no essencial e nos resultados, sem desviar-se para detalhes irrelevantes." }, { text: "Exagerado", profile: "I", explanation: "Tende a amplificar ou superestimar fatos e emoções em suas narrativas." }, { text: "Estável", profile: "S", explanation: "Você se mantém calmo e equilibrado, mesmo diante de pressões ou mudanças." }, { text: "Exato", profile: "C", explanation: "Busca a precisão e a correção em todas as informações e tarefas." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Assertivo", profile: "D", explanation: "Comunica suas opiniões e necessidades de forma clara e direta." }, { text: "Otimista", profile: "I", explanation: "Geralmente vê o lado positivo das situações e espera bons resultados." }, { text: "Paciente", profile: "S", explanation: "Tem capacidade de esperar com calma, sem irritação ou ansiedade." }, { text: "Prudente", profile: "C", explanation: "Pensa cuidadosamente antes de agir, evitando impulsividade e riscos." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Fazedor", profile: "D", explanation: "Orientado para a ação, você gosta de iniciar e concretizar tarefas rapidamente." }, { text: "Inspirador", profile: "I", explanation: "Motiva os outros com entusiasmo e visão, estimulando a participação." }, { text: "Confiante", profile: "S", explanation: "Mantém o esforço em algo, mesmo diante de dificuldades, até alcançar o objetivo." }, { text: "Perfeccionista", profile: "C", explanation: "Busca a excelência e a ausência total de falhas em tudo que faz." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Agressivo", profile: "D", explanation: "Pode agir de forma impetuosa ou confrontadora para atingir seus fins." }, { text: "Expansivo", profile: "I", explanation: "Gosta de compartilhar emoções e pensamentos, sendo muito aberto e comunicativo." }, { text: "Possessivo", profile: "S", explanation: "Valoriza a manutenção do que possui, seja objetos ou relacionamentos, com forte apego." }, { text: "Julgador", profile: "C", explanation: "Analisa e avalia criticamente situações e pessoas com base em critérios e regras." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Decidido", profile: "D", explanation: "Você faz escolhas e toma ações com firmeza e sem hesitação." }, { text: "Flexível", profile: "I", explanation: "Adapta-se facilmente a novas ideias, planos ou mudanças de cenário." }, { text: "Previsível", profile: "S", explanation: "Seus comportamentos e reações são consistentes, facilitando a antecipação de suas atitudes." }, { text: "Sistemático", profile: "C", explanation: "Prefere uma abordagem organizada e lógica, seguindo um método definido." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Inovador", profile: "D", explanation: "Gosta de criar e implementar novas ideias, buscando soluções originais." }, { text: "Comunicativo", profile: "I", explanation: "Tem grande facilidade e prazer em se expressar e interagir com outras pessoas." }, { text: "Agradável", profile: "S", explanation: "Sua conduta é amigável e simpática, buscando manter um ambiente positivo." }, { text: "Elegante", profile: "C", explanation: "Aprecia e busca a excelência e o refinamento, com bom gosto e apuro nos detalhes." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Autoritário", profile: "D", explanation: "Assume a liderança com firmeza, impondo decisões quando necessário." }, { text: "Extravagante", profile: "I", explanation: "Comportamento vistoso ou exagerado, buscando chamar a atenção e ser notado." }, { text: "Modesto", profile: "S", explanation: "Prefere manter-se discreto e humilde, sem buscar os holofotes para si." }, { text: "Desconfiado", profile: "C", explanation: "Tende a questionar informações e intenções até que se provem verdadeiras ou seguras." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Enérgico", profile: "D", explanation: "Demonstra grande vigor e disposição para agir e realizar tarefas." }, { text: "Entusiasmado", profile: "I", explanation: "Gosta de expressar grande alegria e interesse, contagiando os outros." }, { text: "Calmo", profile: "S", explanation: "Você mantém a tranquilidade e a serenidade, mesmo em situações tensas." }, { text: "Disciplinado", profile: "C", explanation: "Segue regras e padrões de conduta com rigor e autocontrole." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Firme", profile: "D", explanation: "Age com solidez e convicção, mantendo sua posição e decisões." }, { text: "Expressivo", profile: "I", explanation: "Manifesta suas emoções e ideias de forma clara e visível." }, { text: "Amável", profile: "S", explanation: "Mostra simpatia, bondade e afeto no trato com as pessoas." }, { text: "Formal", profile: "C", explanation: "Adere a protocolos e convenções, prezando a seriedade e o respeito às regras." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Visionário", profile: "D", explanation: "Tem a capacidade de antecipar o futuro e criar grandes objetivos." }, { text: "Criativo", profile: "I", explanation: "Gosta de gerar novas ideias e soluções originais, pensando fora da caixa." }, { text: "Ponderado", profile: "S", explanation: "Avalia as situações com calma e equilíbrio, evitando decisões precipitadas." }, { text: "Detalhista", profile: "C", explanation: "Preocupa-se com os pormenores, observando e cuidando de cada pequena parte." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Egocêntrico", profile: "D", explanation: "Tem forte foco em si mesmo, nas próprias necessidades e desejos." }, { text: "Tagarela", profile: "I", explanation: "Gosta muito de conversar e expressar-se verbalmente, podendo falar em excesso." },
    { text: "Acomodado", profile: "S", explanation: "Prefere o conforto e a rotina, evitando esforços extras ou mudanças drásticas." }, { text: "Retraído", profile: "C", explanation: "Tende a ser reservado e pouco expansivo em situações sociais ou novas." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Inspira confiança", profile: "D", explanation: "Suas atitudes e comunicação geram credibilidade e segurança nos outros." }, { text: "Convincente", profile: "I", explanation: "Você é capaz de fazer os outros acreditarem em suas propostas ou pontos de vista." }, { text: "Compreensivo", profile: "S", explanation: "Tem facilidade em entender os sentimentos e as perspectivas dos outros." }, { text: "Pontual", profile: "C", explanation: "Preza a chegada e a entrega de tarefas no horário exato e combinado." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Intimidade", profile: "D", explanation: "Gosta de estabelecer conexões diretas e profundas nos relacionamentos." }, { text: "Sem cerimônia", profile: "I", explanation: "Você se expressa de forma descontraída e informal, sem muitas formalidades." }, { text: "Reservado", profile: "S", explanation: "Prefere manter seus sentimentos e pensamentos guardados, sem grande exposição." }, { text: "Intransigente", profile: "C", explanation: "Você não cede facilmente em seus princípios ou opiniões, mantendo-se firme." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Vigoroso", profile: "D", explanation: "Apresenta grande força e energia em suas ações e esforços." }, { text: "Caloroso", profile: "I", explanation: "Demonstra afeto, entusiasmo e acolhimento nas interações sociais." }, { text: "Gentil", profile: "S", explanation: "Trata os outros com delicadeza, cortesia e atenção." }, { text: "Preocupado", profile: "C", explanation: "Tende a se focar nos detalhes e possíveis problemas, com grande atenção para o que pode dar errado." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Ousado", profile: "D", explanation: "Gosta de correr riscos e agir com coragem diante de desafios." }, { text: "Sedutor", profile: "I", explanation: "Tem charme e habilidade para atrair e encantar pessoas, buscando influenciá-las." }, { text: "Harmonizador", profile: "S", explanation: "Busca resolver conflitos e manter a paz e o equilíbrio nas relações." }, { text: "Cauteloso", profile: "C", explanation: "Age com muita prudência, examinando bem as situações para evitar erros ou perigos." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Força de vontade", profile: "D", explanation: "Possui uma determinação inabalável para atingir seus objetivos." }, { text: "Espontâneo", profile: "I", explanation: "Age de forma natural e imediata, sem muita preparação ou hesitação." }, { text: "Satisfeito", profile: "S", explanation: "Você se contenta com a situação atual e não busca grandes mudanças." }, { text: "Conservador", profile: "C", explanation: "Prefere seguir tradições e manter o que já é conhecido e testado." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Exigente", profile: "D", explanation: "Estabelece altos padrões para si e para os outros, buscando performance máxima." }, { text: "Sociável", profile: "I", explanation: "Gosta de interagir com muitas pessoas e de participar de grupos sociais." }, { text: "Leal", profile: "S", explanation: "Você é fiel e dedicado às pessoas e aos compromissos que assume." }, { text: "Rigoroso", profile: "C", explanation: "Aplica regras e métodos de forma estrita, buscando conformidade total." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Pioneiro", profile: "D", explanation: "Gosta de ser o primeiro a fazer algo, explorando novas áreas e ideias." }, { text: "Divertido", profile: "I", explanation: "Você tem bom humor e facilidade para tornar os ambientes mais alegres e leves." }, { text: "Tranquilo", profile: "S", explanation: "Mantém a calma e a serenidade, sem se perturbar facilmente." }, { text: "Convencional", profile: "C", explanation: "Prefere seguir normas e padrões aceitos, evitando o incomum ou o inovador." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Ambicioso", profile: "D", explanation: "Busca grandes conquistas e crescimento profissional ou pessoal." }, { text: "Radiante", profile: "I", explanation: "Você irradia alegria e entusiasmo, contagiando as pessoas ao redor." }, { text: "Regulado", profile: "S", explanation: "Prefere ter as coisas organizadas e sob controle, seguindo um plano." }, { text: "Calculista", profile: "C", explanation: "Analisa friamente as situações, buscando a lógica e os resultados objetivos." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Inquisitivo", profile: "D", explanation: "Faz perguntas, explora e investiga para obter mais informações e clareza." }, { text: "Oferecido", profile: "I", explanation: "Gosta de se dispor a ajudar ou participar, mesmo sem ser solicitado formalmente." }, { text: "Rígido Consigo", profile: "S", explanation: "Define padrões elevados e cobra muito de si mesmo, buscando a autodisciplina." }, { text: "Cético", profile: "C", explanation: "Você tende a duvidar ou questionar fatos e ideias até que sejam comprovados." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Audacioso", profile: "D", explanation: "Não tem medo de arriscar e tomar iniciativas corajosas." }, { text: "Extrovertido", profile: "I", explanation: "Aberto, comunicativo e voltado para interações sociais e o mundo exterior." }, { text: "Casual", profile: "S", explanation: "Prefere um estilo de vida descontraído e informal, sem muitas preocupações." }, { text: "Meticuloso", profile: "C", explanation: "Presta atenção extrema aos detalhes, buscando a perfeição em cada etapa." }] },
    { question: "Selecione o que mais te descreve", options: [{ text: "Direto", profile: "D", explanation: "Sua comunicação é clara, franca e sem rodeios, indo direto ao ponto." }, { text: "Prolixo", profile: "I", explanation: "Você fala muito e com riqueza de detalhes, às vezes de forma excessiva." }, { text: "Moderado", profile: "S", explanation: "Prefere o caminho do meio, evitando extremos e excessos em suas ações." }, { text: "Processual", profile: "C", explanation: "Valoriza a ordem e a sequência correta das etapas para realizar algo." }] }
];


// Função para exibir uma única questão
function displayCurrentQuestion() {
    questionCardContainer.innerHTML = ''; // Limpa a pergunta anterior

    if (currentQuestionIndex < discQuestions.length) {
        const q = discQuestions[currentQuestionIndex];
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.innerHTML = `<p>${currentQuestionIndex + 1}. ${q.question}</p>`;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        q.options.forEach((opt, optIndex) => {
            const radioId = `q${currentQuestionIndex}_opt${optIndex}`;
            const isChecked = userAnswers[currentQuestionIndex] === opt.profile ? 'checked' : '';
            const isSelectedClass = isChecked ? 'selected' : '';

            optionsDiv.innerHTML += `
                <label for="${radioId}" tabindex="0" class="${isSelectedClass}">
                    <input type="radio" id="${radioId}" name="question${currentQuestionIndex}" value="${opt.profile}" ${isChecked} required>
                    <span class="option-main-text">${opt.text}</span>
                    ${opt.explanation ? `<span class="option-explanation">${opt.explanation}</span>` : ''}
                </label>
            `;
        });

        questionDiv.appendChild(optionsDiv);
        questionCardContainer.appendChild(questionDiv);

        // Adiciona/remove o botão "Voltar" do quiz
        if (currentQuestionIndex > 0) {
            quizBackButton.classList.remove('hidden');
        } else {
            quizBackButton.classList.add('hidden');
        }

        // Add event listeners to radio buttons to advance
        optionsDiv.querySelectorAll(`input[name="question${currentQuestionIndex}"]`).forEach(radio => {
            radio.addEventListener('change', (event) => {
                optionsDiv.querySelectorAll('label').forEach(label => label.classList.remove('selected'));
                event.target.closest('label').classList.add('selected');

                userAnswers[currentQuestionIndex] = event.target.value;

                // Se for a última questão, calcula e exibe os resultados E FAZ A TRANSIÇÃO
                if (currentQuestionIndex === discQuestions.length - 1) {
                    calculateAndDisplayResults();
                    quizPage.classList.remove('active'); // Transfere para a página de resultados
                    resultsPage.classList.add('active'); // Transfere para a página de resultados
                } else {
                    setTimeout(goToNextQuestion, 300); // Pequeno atraso para feedback visual
                }
            });
        });

        // Set focus on the first option of the new question for accessibility
        if (!optionsDiv.querySelector('input[type="radio"]:checked')) {
            optionsDiv.querySelector('input[type="radio"]').focus();
        }

    } else {
        // Este bloco será raramente atingido com a correção acima, mas serve como fallback
        calculateAndDisplayResults();
        quizPage.classList.remove('active');
        resultsPage.classList.add('active');
    }
    updateProgressBar();
}

// Atualiza a barra de progresso
function updateProgressBar() {
    const totalQuestions = discQuestions.length;
    const currentProgress = currentQuestionIndex + 1;
    const progressPercentage = (currentProgress / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${currentProgress}/${totalQuestions}`;

    // Se o quiz tiver terminado, exibe o texto final na barra de progresso
    if (currentQuestionIndex >= totalQuestions) {
        progressText.textContent = `${totalQuestions}/${totalQuestions}`;
    }
}

// Avança para a próxima questão
function goToNextQuestion() {
    currentQuestionIndex++;
    displayCurrentQuestion();
}

// Volta para a questão anterior
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

// Navegação: início do teste
infoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userFullName = document.getElementById('full-name').value.trim();
    userEmail = document.getElementById('email').value.trim();
    if (!userFullName || !userEmail) return;

    homePage.classList.remove('active');
    quizPage.classList.add('active');
    currentQuestionIndex = 0; // Reset index
    userAnswers = []; // Clear previous answers
    displayCurrentQuestion();
});

// Recomeçar
restartButton.addEventListener('click', () => {
    resultsPage.classList.remove('active');
    homePage.classList.add('active');
    document.getElementById('full-name').value = '';
    document.getElementById('email').value = '';
    
    // Destrói as instâncias dos gráficos ao reiniciar
    if (discBarChartInstance) {
        discBarChartInstance.destroy();
        discBarChartInstance = null;
    }
    if (discRadarChartInstance) {
        discRadarChartInstance.destroy();
        discRadarChartInstance = null;
    }

    profileTextEl.innerHTML = ''; // Limpa o texto do perfil
    participantNameEl.textContent = '';
    currentQuestionIndex = 0;
    userAnswers = [];
    updateProgressBar(); // Reset progress bar visual (0/26)
    quizBackButton.classList.add('hidden'); // Esconde o botão de voltar no início

    // Remove qualquer classe de cor do título ao reiniciar
    participantNameEl.className = '';
});


// Adiciona listener para o botão "Voltar" (do quiz, em cada questão)
quizBackButton.addEventListener('click', goToPreviousQuestion);

// Adiciona listener para o botão "Voltar" (da página de resultados para o quiz)
resultsBackToQuizButton.addEventListener('click', () => {
    resultsPage.classList.remove('active');
    quizPage.classList.add('active');
    // Volta para a última questão respondida no quiz para revisão
    currentQuestionIndex = Math.max(0, discQuestions.length - 1);
    displayCurrentQuestion();
});


// Função unificada para calcular e exibir resultados
function calculateAndDisplayResults() {
    const counts = { 'D': 0, 'I': 0, 'S': 0, 'C': 0 };
    userAnswers.forEach(answer => {
        if (counts.hasOwnProperty(answer)) counts[answer]++;
    });

    const total = discQuestions.length; // Total de perguntas para o cálculo de porcentagem

    const percentages = {
        D: Math.round((counts.D / total) * 100),
        I: Math.round((counts.I / total) * 100),
        S: Math.round((counts.S / total) * 100),
        C: Math.round((counts.C / total) * 100)
    };

    displayResultsCharts(counts, percentages); // Exibe os gráficos
    const narrative = generateDiscNarrative(counts, total); // Gera a narrativa
    displayResultsText(narrative); // Exibe o texto interpretativo
    saveResultsToFirebase(counts); // Salva os resultados no Firebase
}

// Salva no Firestore
function saveResultsToFirebase(counts) {
    const timestamp = new Date().toISOString();

    db.collection("resultadosDISC").add({
        nome: userFullName,
        email: userEmail,
        dominancia: counts.D,
        influencia: counts.I,
        estabilidade: counts.S,
        conformidade: counts.C,
        data: timestamp
    })
    .then((docRef) => {
        console.log("Documento salvo com ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Erro ao adicionar documento: ", error);
    });
}

// Exibe os gráficos (Barras e Radar)
function displayResultsCharts(counts, percentages) {
    // Limpa classes de cor antigas e adiciona a nova
    participantNameEl.className = ''; 
    const predominantProfile = Object.keys(percentages).reduce((a, b) => percentages[a] > percentages[b] ? a : b);
    participantNameEl.classList.add(`profile-${predominantProfile}`);

    participantNameEl.textContent = `Resultado do Teste DISC - BricoBread de ${userFullName}`;

    const labels = ["Dominante (D)", "Influente (I)", "Estável (S)", "Conforme (C)"];
    const barData = [counts.D, counts.I, counts.S, counts.C];
    const radarData = [percentages.D, percentages.I, percentages.S, percentages.C];
    const backgroundColors = ['#a30000', '#2980b9', '#318a20ff', '#555']; // Atualizado para usar o #318a20ff
    const borderColors = ['#a30000', '#2980b9', '#318a20ff', '#555']; // Atualizado para usar o #318a20ff

    // Gráfico de Barras
    if (discBarChartInstance) discBarChartInstance.destroy();
    if (discBarChartCtx) { // Verifica se o contexto existe
        discBarChartInstance = new Chart(discBarChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Número de Respostas',
                    data: barData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: discQuestions.length, // Maximo é o total de perguntas
                        title: { display: true, text: 'Número de Respostas' },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            color: '#ffffff' // Cor da label do eixo X
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }


    // Gráfico Radar
    if (discRadarChartInstance) discRadarChartInstance.destroy();
    if (discRadarChartCtx) { // Verifica se o contexto existe
        discRadarChartInstance = new Chart(discRadarChartCtx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Seu Perfil (%)',
                    data: radarData,
                    backgroundColor: `rgba(${parseInt(profileColors[predominantProfile].slice(1,3), 16)}, ${parseInt(profileColors[predominantProfile].slice(3,5), 16)}, ${parseInt(profileColors[predominantProfile].slice(5,7), 16)}, 0.4)`, // Cor do perfil dominante com transparência
                    borderColor: profileColors[predominantProfile],
                    pointBackgroundColor: profileColors[predominantProfile],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: profileColors[predominantProfile],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3 // Linha suave
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff' // Cor da legenda
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw + '%';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: '#888' }, // Cor das linhas de ângulo
                        grid: { color: '#888' },      // Cor do grid
                        pointLabels: {
                            color: '#ffffff', // Cor das labels dos pontos (D,I,S,C)
                            font: { size: 12 }
                        },
                        ticks: {
                            beginAtZero: true,
                            max: 100,
                            stepSize: 20,
                            color: '#ffffff', // Cor dos ticks do eixo radial
                            backdropColor: 'rgba(0, 0, 0, 0.3)' // Fundo para ticks, se necessário
                        }
                    }
                }
            }
        });
    }
}

// Helper to get full profile name
function getFullProfileName(initial) {
    switch (initial) {
        case 'D': return 'Dominância';
        case 'I': return 'Influência';
        case 'S': return 'Estabilidade';
        case 'C': return 'Conformidade';
        default: return '';
    }
}

// Funções de apoio para a narrativa
function getProfileBand(percentage) {
    if (percentage >= 70) return "Muito alto";
    if (percentage >= 55) return "Alto";
    if (percentage >= 40) return "Médio";
    if (percentage >= 25) return "Baixo";
    return "Muito baixo";
}

// MODIFICAÇÃO: Ajustada a lógica para garantir que o perfil principal sempre tenha seus pontos positivos listados.
function getStrengthBullets(percentages, profileDetails) {
    const strengths = [];
    
    const sortedProfiles = Object.entries(percentages)
        .sort(([, a], [, b]) => b - a); // Ordena do maior para o menor percentual

    // Sempre incluir os pontos positivos do perfil com a maior pontuação (principal)
    const principalProfileKey = sortedProfiles[0][0];
    if (profileDetails[principalProfileKey] && profileDetails[principalProfileKey].pros) {
        profileDetails[principalProfileKey].pros.forEach(pro => {
            if (!strengths.includes(pro)) {
                strengths.push(pro);
            }
        });
    }

    // Opcionalmente, incluir pontos positivos do segundo perfil mais alto, se for significativo
    // Considerar significativo se tiver >= 25% ou estiver na banda "Médio" ou "Alto"
    if (sortedProfiles.length > 1) {
        const secundarioProfileKey = sortedProfiles[1][0];
        const secundarioPercentage = sortedProfiles[1][1];
        
        // Inclui se a porcentagem for >= 25% ou se a banda for "Médio" ou "Alto"
        if (secundarioPercentage >= 25 || getProfileBand(secundarioPercentage) === "Médio" || getProfileBand(secundarioPercentage) === "Alto") {
            if (profileDetails[secundarioProfileKey] && profileDetails[secundarioProfileKey].pros) {
                profileDetails[secundarioProfileKey].pros.forEach(pro => {
                    if (!strengths.includes(pro)) {
                        strengths.push(pro);
                    }
                });
            }
        }
    }
    
    // Limita a 3 bullets, se houver mais, pega os 3 mais relevantes
    return strengths.slice(0, 3);
}


function getCautionBullets(percentages, profileDetails, combinationText) {
    const cautions = [];
    const lowProfilesSorted = Object.entries(percentages)
        .sort(([, a], [, b]) => a - b) // Ordena do mais baixo para o mais alto
        .filter(([, value]) => getProfileBand(value) === "Muito baixo" || getProfileBand(value) === "Baixo");

    // Adiciona as atenções gerais dos perfis baixos
    lowProfilesSorted.forEach(([profileKey]) => {
        if (profileDetails[profileKey] && profileDetails[profileKey].cons) {
            profileDetails[profileKey].cons.forEach(con => {
                if (!cautions.includes(con)) {
                    cautions.push(con);
                }
            });
        }
    });

    // Adiciona atenção específica para "muito baixo"
    Object.entries(percentages).forEach(([profileKey, percentage]) => {
        if (getProfileBand(percentage) === "Muito baixo" && percentage < 15) {
            let specificCaution = "";
            switch(profileKey) {
                case 'D': specificCaution = "Baixa tendência a tomar iniciativas ou assumir riscos diretos."; break;
                case 'I': specificCaution = "Dificuldade em se expressar abertamente e influenciar o ambiente social."; break;
                case 'S': specificCaution = "Falta de paciência para rotinas e resiste a manter ritmos constantes."; break;
                case 'C': specificCaution = "Prefere a flexibilidade a regras e procedimentos, o que pode impactar a precisão."; break;
            }
            if (specificCaution && !cautions.includes(specificCaution)) {
                 cautions.unshift(specificCaution); // Adiciona no início
            }
        }
    });

    // Se a combinação já adiciona alguma atenção específica, prioriza ou ajusta
    if (combinationText.includes("prometer demais") && !cautions.includes("Risco de prometer além do time ou de forma irrealista.")) {
        cautions.push("Risco de prometer além do time ou de forma irrealista.");
    }
    if (combinationText.includes("travar por excesso de checagem") && !cautions.includes("Pode travar por excesso de checagem em cenários urgentes.")) {
        cautions.push("Pode travar por excesso de checagem em cenários urgentes.");
    }
    if (combinationText.includes("evitar conversas difíceis") && !cautions.includes("Tendência a evitar conversas difíceis para preservar a harmonia.")) {
        cautions.push("Tendência a evitar conversas difíceis para preservar a harmonia.");
    }
     if (combinationText.includes("não acumular tensão") && !cautions.includes("Risco de acumular tensões antes de se posicionar.")) {
        cautions.push("Risco de acumular tensões antes de se posicionar.");
    }
    if (combinationText.includes("parecer inflexível") && !cautions.includes("Risco de parecer inflexível com processos e regras.")) {
        cautions.push("Risco de parecer inflexível com processos e regras.");
    }
    if (combinationText.includes("perfeccionismo que atrasa") && !cautions.includes("Perfeccionismo que pode atrasar entregas.")) {
        cautions.push("Perfeccionismo que pode atrasar entregas.");
    }


    // Limita a 3 bullets no máximo
    return cautions.slice(0, 3);
}

// **Função Modificada: generateDiscNarrative**
function generateDiscNarrative(counts, totalQuestions) {
    const percentages = {
        D: Math.round((counts.D / totalQuestions) * 100),
        I: Math.round((counts.I / totalQuestions) * 100),
        S: Math.round((counts.S / totalQuestions) * 100),
        C: Math.round((counts.C / totalQuestions) * 100)
    };

    const sortedProfiles = Object.entries(percentages)
        .sort(([, a], [, b]) => b - a); // Ordena do maior para o menor

    let principal = sortedProfiles[0][0];
    let principalValue = sortedProfiles[0][1];
    let secundario = sortedProfiles[1][0];
    let secundarioValue = sortedProfiles[1][1];
    let terceiro = sortedProfiles.length > 2 ? sortedProfiles[2][0] : null;
    let terceiroValue = sortedProfiles.length > 2 ? sortedProfiles[2][1] : 0;


    let resumo = "";
    let combinacao = "";
    let comboKey = ''; 

    // **NOVA LÓGICA DE GERAÇÃO DA NARRATIVA**

    // 1. Lógica para perfis equilibrados (3 ou 4 perfis altos e próximos)
    // Se 3 ou mais perfis estão muito próximos (ex: dentro de 15-20 pontos percentuais do mais alto)
    if (sortedProfiles.filter(([, value]) => principalValue - value <= 20 && value >= 20).length >= 3) {
        resumo = `Seu perfil demonstra uma distribuição equilibrada dos fatores DISC. Você possui grande adaptabilidade e flexibilidade para transitar entre diferentes demandas e estilos de trabalho, conseguindo ajustar sua abordagem de acordo com a necessidade da situação.`;
        combinacao = "Perfil Equilibrado: Você se destaca pela sua versatilidade, sendo capaz de se adaptar e agir de diferentes maneiras em diversos contextos. Sua habilidade em balancear as características de Dominância, Influência, Estabilidade e Conformidade permite uma performance eficaz em múltiplos cenários.";
    } 
    // 2. Lógica para um Perfil Único Dominante com o segundo perfil "Mínimo" (conforme exemplo)
    else if (principalValue >= 50 && secundarioValue < 15) { 
        resumo = textosDISC.singles[principal];
        if (profileDetails[principal]?.generalDescription) {
            resumo += ` Você demonstra características marcantes: ${profileDetails[principal].generalDescription}. `;
        }
        
        const lowProfileFullName = getFullProfileName(secundario);
        let lowImpactPhrase = "";

        switch (secundario) {
            case 'D': lowImpactPhrase = "menor inclinação para iniciativas diretas e assunção de riscos."; break;
            case 'I': lowImpactPhrase = "menor inclinação para a socialização ativa, persuasão e expressão efusiva de emoções."; break;
            case 'S': lowImpactPhrase = "menor inclinação para rotinas previsíveis, paciência prolongada e manutenção da harmonia a qualquer custo."; break;
            case 'C': lowImpactPhrase = "menor inclinação para a análise exaustiva de detalhes, seguir procedimentos rígidos e busca por perfeição em tudo."; break;
        }
        resumo += `A presença de ${lowProfileFullName} no seu comportamento é mínima, indicando ${lowImpactPhrase} Em síntese, você é predominantemente ${getFullProfileName(principal)}.`;
        combinacao = "";
    }
    // 3. Lógica para combinação dos dois perfis mais altos (ambos significativos e próximos)
    else if (principalValue >= 20 && secundarioValue >= 20 && (principalValue - secundarioValue <= 20)) { 
        // Cria a chave da combinação (ex: "DI" ou "ID"). O objeto textosDISC.combos já tem ambos os sentidos.
        comboKey = principal + secundario;
        
        resumo = `Seu perfil apresenta uma forte combinação entre ${getFullProfileName(principal)} e ${getFullProfileName(secundario)}. Você integra as características de ambos os fatores em sua forma de agir.`;
        combinacao = textosDISC.combos[comboKey] || `Você exibe características fortes de ${getFullProfileName(principal)} e ${getFullProfileName(secundario)}.`; 
    }
    // 4. Lógica para um Perfil Único Dominante (quando não se encaixa nas condições acima)
    else {
        resumo = textosDISC.singles[principal];
        if (profileDetails[principal]?.generalDescription) {
            resumo += ` Você demonstra características marcantes: ${profileDetails[principal].generalDescription}.`;
        }
        combinacao = "";
    }
    
    const forcas = getStrengthBullets(percentages, profileDetails);
    const atencoes = getCautionBullets(percentages, profileDetails, combinacao);

    return {
        resumo: resumo,
        combinacao: combinacao,
        forcas: forcas,
        atencoes: atencoes,
        percentuais: percentages,
        principal: principal,
        secundario: secundario
    };
}


// Exibe o texto interpretativo
function displayResultsText(narrative) {
    let profileHtml = ``;

    const predominantProfileFullName = getFullProfileName(narrative.principal);
    
    // Adiciona o título principal do perfil com a cor dinâmica
    profileHtml += `<h3 class="predominant-profile-title profile-${narrative.principal}">Seu Perfil: ${predominantProfileFullName}</h3>`;


    profileHtml += `<p>${narrative.resumo}</p>`;
    // Só adiciona a combinação se houver texto nela
    if (narrative.combinacao) {
        profileHtml += `<p>${narrative.combinacao}</p>`;
    }

    // BLOCO 'PONTOS POSITIVOS' (REPOSICIONADO AQUI)
    if (narrative.forcas && narrative.forcas.length > 0) {
        profileHtml += `<div class="profile-pros-cons"><h3>Pontos Positivos:</h3><ul>`;
        narrative.forcas.forEach(item => {
            profileHtml += `<li>${item}</li>`;
        });
        profileHtml += `</ul></div>`;
    }

    // BLOCO 'PONTOS DE ATENÇÃO'
    if (narrative.atencoes && narrative.atencoes.length > 0) {
        profileHtml += `<div class="profile-pros-cons"><h3>Pontos de Atenção:</h3><ul>`;
        narrative.atencoes.forEach(item => {
            profileHtml += `<li>${item}</li>`;
        });
        profileHtml += `</ul></div>`;
    }

     // BLOCO 'PERCENTUAIS DISC'
    profileHtml += `<div class="profile-pros-cons"><h3>Percentuais DISC:</h3><ul>`;
    for (const [key, value] of Object.entries(narrative.percentuais)) {
        const fullLabel = getFullProfileName(key);
        profileHtml += `<li>${fullLabel} (${key}): ${value}%</li>`;
    }
    profileHtml += `</ul></div>`;

    profileTextEl.innerHTML = profileHtml;
}
