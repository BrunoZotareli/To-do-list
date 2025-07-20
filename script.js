function atualizarProgresso(tarefas) {
  const total = tarefas.length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  const porcentagem = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const barra = document.getElementById('barraProgresso');
  const texto = document.getElementById('textoProgresso');

  barra.style.width = `${porcentagem}%`;
  texto.textContent = `${porcentagem}% concluído`;
}

function renderizarTarefas() {
  const lista = document.getElementById('listaTarefas');
  const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
  lista.innerHTML = "";

  tarefas.forEach((tarefa, index) => {
    const li = document.createElement('li');
    li.className = `
      flex justify-between items-center gap-3 p-4 rounded-lg bg-white
      shadow-md cursor-pointer select-none
      transition transform duration-300 ease-in-out
      hover:shadow-lg hover:-translate-y-0.5
      text-base sm:text-lg
    `;

    // Botão concluir
    const btnConcluir = document.createElement('button');
    btnConcluir.innerHTML = tarefa.concluida ? '✅' : '⬜';
    btnConcluir.className = `
      flex items-center justify-center h-8 w-8 text-xl bg-transparent border-none cursor-pointer select-none p-0
      transition-colors duration-300 text-green-600 hover:text-green-800
    `;
    btnConcluir.onclick = (e) => {
      e.stopPropagation();
      tarefas[index].concluida = !tarefas[index].concluida;
      localStorage.setItem('tarefas', JSON.stringify(tarefas));
      renderizarTarefas();
    };

    // Texto da tarefa (com risco se concluída)
    const spanTexto = document.createElement('span');
    spanTexto.textContent = tarefa.texto;
    spanTexto.className = tarefa.concluida 
      ? 'flex-1 text-gray-700 line-through opacity-50 select-none' 
      : 'flex-1 text-gray-900 select-none';

    // Tag da tarefa
    if (tarefa.tag) {
      const spanTag = document.createElement('span');
      spanTag.textContent = `#${tarefa.tag}`;
      const tagClass = ['trabalho', 'pessoal', 'urgente'].includes(tarefa.tag.toLowerCase()) 
        ? `tag-${tarefa.tag.toLowerCase()}` 
        : 'tag-default';
      spanTag.classList.add('ml-3', 'px-2', 'py-0.5', 'rounded-full', 'text-xs', 'text-white', tagClass);
      spanTexto.appendChild(spanTag);
    }

    // Botão excluir
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = "🗑️";
    btnExcluir.className = `
      flex items-center justify-center h-8 w-8 text-xl bg-transparent border-none cursor-pointer select-none p-0
      transition-colors duration-300 text-red-600 hover:text-red-800
    `;
    btnExcluir.onclick = (e) => {
      e.stopPropagation();
      tarefas.splice(index, 1);
      localStorage.setItem('tarefas', JSON.stringify(tarefas));
      renderizarTarefas();
    };

    li.appendChild(btnConcluir);
    li.appendChild(spanTexto);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });

  atualizarProgresso(tarefas);
}

function adicionarTarefa() {
  const input = document.getElementById('novaTarefa');
  const inputTag = document.getElementById('novaTag');
  const texto = input.value.trim();
  const tag = inputTag.value.trim();

  if (texto === "") return;

  const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
  tarefas.push({ texto, concluida: false, tag });
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
  input.value = "";
  inputTag.value = "";
  renderizarTarefas();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch(err => console.log('Falha ao registrar Service Worker:', err));
  });
}

document.getElementById('btnAdicionar').addEventListener('click', adicionarTarefa);
renderizarTarefas();
