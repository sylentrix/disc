// Configuração do Firebase do PAINEL RH
const firebaseConfig = {
  apiKey: "AIzaSyCyH4CIG08T4bPDmYd5N-5Q1FSyTCMX_6I",
  authDomain: "teste-disc-bricobread.firebaseapp.com",
  projectId: "teste-disc-bricobread",
  storageBucket: "teste-disc-bricobread.appspot.com",
  messagingSenderId: "827161354543",
  appId: "1:827161354543:web:d92fc84518f507e5f601da"
};

// Inicializa Firebase (evita reinit)
if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let modalChart = null;

// Texto do perfil predominante para o modal do RH
function textoPerfil(sigla) {
  switch (sigla) {
    case 'D': return 'Perfil predominante: Dominância. Direto, orientado a resultados e desafios.';
    case 'I': return 'Perfil predominante: Influência. Comunicativo, persuasivo, motivado por interação.';
    case 'S': return 'Perfil predominante: Estabilidade. Calmo, consistente; valoriza segurança e colaboração.';
    case 'C': return 'Perfil predominante: Conformidade. Analítico, preciso; preza qualidade e regras.';
    default: return '';
  }
}

// Abre o modal com o gráfico e a descrição
function abrirModal(nome, valores) {
  const modal = document.getElementById('resultado-modal');
  const title = document.getElementById('modal-title');
  const prof = document.getElementById('modal-profile');
  const canvas = document.getElementById('modal-chart');

  title.textContent = `Resultado do Teste DISC – ${nome}`;

  const labels = ['Dominância', 'Influência', 'Estabilidade', 'Conformidade'];
  const arr = [valores.dominancia, valores.influencia, valores.estabilidade, valores.conformidade];

  // Perfil predominante
  const pares = [['D', arr[0]], ['I', arr[1]], ['S', arr[2]], ['C', arr[3]]].sort((a,b)=>b[1]-a[1]);
  prof.textContent = textoPerfil(pares[0][0]);

  if (modalChart) modalChart.destroy();
  modalChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Número de Respostas',
        data: arr,
        backgroundColor: ['#a30000', '#2980b9', '#318a20ff', '#555'] // paleta BricoBread (verde unificado)
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#333' }, // Cor dos ticks para o tema claro
            grid: { color: '#ccc' } // Cor da grade para o tema claro
        },
        x: {
            ticks: { color: '#333' }, // Cor das labels do eixo X para o tema claro
            grid: { color: '#ccc' } // Cor da grade para o tema claro
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

  modal.classList.remove('hidden');
}

// Fecha o modal
function fecharModal() {
  document.getElementById('resultado-modal').classList.add('hidden');
}

// Fecha ao clicar no X ou fora
document.addEventListener('click', (e) => {
  if (e.target?.id === 'modal-close' || e.target?.id === 'resultado-modal') fecharModal();
});

// Carrega os resultados e monta as linhas com botão
async function fetchResults() {
  const resultsTbody = document.getElementById('results-tbody');
  resultsTbody.innerHTML = '';

  try {
    const querySnapshot = await db.collection("resultadosDISC").orderBy("data", "desc").get();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement('tr');

      // Garante que `data.data` é um Timestamp do Firebase ou ISO string para formatação
      const dateObject = data.data instanceof firebase.firestore.Timestamp ? data.data.toDate() : new Date(data.data);
      const formattedDate = dateObject.toLocaleString('pt-BR');

      row.innerHTML = `
        <td>${data.nome ?? ''}</td>
        <td>${data.email ?? ''}</td>
        <td>${data.dominancia ?? 0}</td>
        <td>${data.influencia ?? 0}</td>
        <td>${data.estabilidade ?? 0}</td>
        <td>${data.conformidade ?? 0}</td>
        <td>${formattedDate}</td>
        <td>
          <button class="btn-ver-grafico"
            data-nome="${data.nome ?? ''}"
            data-d="${data.dominancia ?? 0}"
            data-i="${data.influencia ?? 0}"
            data-s="${data.estabilidade ?? 0}"
            data-c="${data.conformidade ?? 0}">
            Ver gráfico
          </button>
        </td>
      `;
      resultsTbody.appendChild(row);
    });

  } catch (error) {
    console.error("Erro ao buscar resultados: ", error);
    resultsTbody.innerHTML = `<tr><td colspan="8" style="color: #a30000; text-align: center;">Erro ao carregar dados. Verifique a conexão com o Firebase ou as permissões de acesso.</td></tr>`;
  }
}

// Clique no botão “Ver gráfico” (delegação para funcionar em qualquer linha)
document.addEventListener('click', (e) => {
  const btn = e.target?.closest('.btn-ver-grafico');
  if (!btn) return;

  const nome = btn.dataset.nome || '';
  const valores = {
    dominancia: parseInt(btn.dataset.d || '0', 10),
    influencia: parseInt(btn.dataset.i || '0', 10),
    estabilidade: parseInt(btn.dataset.s || '0', 10),
    conformidade: parseInt(btn.dataset.c || '0', 10),
  };
  abrirModal(nome, valores);
});

// Inicializa a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', fetchResults);
