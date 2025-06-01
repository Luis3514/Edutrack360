// Sidebar toggle and overlay
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.getElementById('overlay');

function openSidebar() {
  sidebar.classList.remove('closed');
  overlay.classList.remove('hidden');
  overlay.classList.add('visible');
}

function closeSidebar() {
  sidebar.classList.add('closed');
  overlay.classList.remove('visible');
  overlay.classList.add('hidden');
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// Tab switching logic
const menuButtons = document.querySelectorAll('.menu-button');
const tabSections = document.querySelectorAll('.tab-section');

function setActiveTab(tabId) {
  menuButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  tabSections.forEach(section => {
    section.classList.toggle('active', section.id === tabId);
  });
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
  if (tabId === 'mis-cursos') {
    fetchAndRenderCursos();
  } else if (tabId === 'mis-tareas') {
    fetchAndRenderTareas();
  } else if (tabId === 'mi-seguimiento') {
    fetchAndRenderSeguimiento();
  } else if (tabId === 'mi-asistencia') {
    fetchAndRenderAsistencia();
  }
}

menuButtons.forEach(button => {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.tab);
  });
});

// Logout button
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      window.location.href = '/login';
    } else {
      alert('Error al cerrar sesión');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error al cerrar sesión');
  }
});

// Fetch and render cursos for estudiante
const cursosContainer = document.getElementById('cursosContainer');

async function fetchAndRenderCursos() {
  try {
    const response = await fetch('/estudiante/cursos', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching cursos');
    const cursos = await response.json();
    renderCursos(cursos);
  } catch (error) {
    console.error('Error fetching cursos:', error);
    alert('Error al cargar los cursos');
  }
}

function renderCursos(cursos) {
  cursosContainer.innerHTML = '';
  if (cursos.length === 0) {
    cursosContainer.innerHTML = '<p>No estás inscrito en ningún curso.</p>';
    return;
  }
  cursos.forEach(curso => {
    const div = document.createElement('div');
    div.className = 'curso-card';
    div.innerHTML = `
      <h3>${curso.Nombre || ''}</h3>
      <p><strong>Bloque:</strong> ${curso.bloque || ''}</p>
      <p><strong>Ubicación:</strong> ${curso.ubicacion || ''}</p>
      <p><strong>Docente:</strong> ${curso.docente ? curso.docente.Nombre + ' ' + curso.docente.Apellido : ''}</p>
    `;
    cursosContainer.appendChild(div);
  });
}

// Fetch and render tareas for estudiante
const tareasContainer = document.getElementById('tareasContainer');

async function fetchAndRenderTareas() {
  try {
    const response = await fetch('/estudiante/tareas', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching tareas');
    const tareas = await response.json();
    renderTareas(tareas);
  } catch (error) {
    console.error('Error fetching tareas:', error);
    alert('Error al cargar las tareas');
  }
}

function renderTareas(tareas) {
  tareasContainer.innerHTML = '';
  if (tareas.length === 0) {
    tareasContainer.innerHTML = '<p>No tienes tareas asignadas.</p>';
    return;
  }
  tareas.forEach(tarea => {
    const div = document.createElement('div');
    div.className = 'tarea-card';
    div.innerHTML = `
      <h3>${tarea.titulo}</h3>
      <p>${tarea.descripcion}</p>
      <p><strong>Fecha de entrega:</strong> ${new Date(tarea.fechaEntrega).toLocaleDateString()}</p>
    `;
    tareasContainer.appendChild(div);
  });
}

// Seguimiento Academico UI
const rendimientoChartCtx = document.getElementById('rendimientoChart').getContext('2d');
const asistenciaChartCtx = document.getElementById('asistenciaChart').getContext('2d');
let rendimientoChart;
let asistenciaChart;

async function fetchAndRenderSeguimiento() {
  try {
    const response = await fetch('/estudiante/seguimiento', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching seguimiento');
    const data = await response.json();
    renderSeguimiento(data);
  } catch (error) {
    console.error('Error fetching seguimiento:', error);
    alert('Error al cargar el seguimiento académico');
  }
}

function renderSeguimiento(data) {
  if (rendimientoChart) {
    rendimientoChart.destroy();
  }
  if (asistenciaChart) {
    asistenciaChart.destroy();
  }
  rendimientoChart = new Chart(rendimientoChartCtx, {
    type: 'pie',
    data: {
      labels: data.rendimiento.labels,
      datasets: [{
        data: data.rendimiento.data,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false
    }
  });

  asistenciaChart = new Chart(asistenciaChartCtx, {
    type: 'pie',
    data: {
      labels: data.asistencia.labels,
      datasets: [{
        data: data.asistencia.data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ]
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false
    }
  });
}

// Mi Asistencia UI
const asistenciaTableBody = document.querySelector('#asistenciaTable tbody');

async function fetchAndRenderAsistencia() {
  try {
    const response = await fetch('/estudiante/asistencia', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching asistencia');
    const asistencias = await response.json();
    renderAsistencia(asistencias);
  } catch (error) {
    console.error('Error fetching asistencia:', error);
    alert('Error al cargar la asistencia');
  }
}

function renderAsistencia(asistencias) {
  asistenciaTableBody.innerHTML = '';
  if (asistencias.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = 'No hay registros de asistencia.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    asistenciaTableBody.appendChild(tr);
    return;
  }
  asistencias.forEach(asistencia => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(asistencia.fecha).toLocaleDateString()}</td>
      <td>${asistencia.cursoNombre || 'Desconocido'}</td>
      <td>${asistencia.estado || 'Desconocido'}</td>
    `;
    asistenciaTableBody.appendChild(tr);
  });
}

// Initialize default tab and fetch data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setActiveTab('mis-cursos');
  fetchAndRenderCursos();
});
