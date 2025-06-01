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
  if (tabId === 'cursos') {
    fetchAndRenderCursos();
  } else if (tabId === 'tareas') {
    fetchAndRenderTareas();
  } else if (tabId === 'seguimiento-academico') {
    fetchAndRenderSeguimiento();
  } else if (tabId === 'gestion-asistencia') {
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

// Cursos CRUD UI
const cursosTableBody = document.querySelector('#cursosTable tbody');
const createCursoBtn = document.getElementById('createCursoBtn');
const cursoModal = document.getElementById('cursoModal');
const cursoForm = document.getElementById('cursoForm');
const modalTitle = document.getElementById('modalTitle');
const modalCloseBtn = document.getElementById('modalCloseBtn');

let editingCursoId = null;

async function fetchAndRenderCursos() {
  try {
    const response = await fetch('/docente/cursos/all', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching cursos');
    const cursos = await response.json();
    renderCursos(cursos);
  } catch (error) {
    console.error('Error fetching cursos:', error);
    alert('Error al cargar los cursos');
  }
}

function renderCursos(cursos) {
  cursosTableBody.innerHTML = '';
  if (cursos.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No hay cursos asignados.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    cursosTableBody.appendChild(tr);
    return;
  }
  cursos.forEach(curso => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${curso.bloque || ''}</td>
      <td>${curso.ubicacion || ''}</td>
      <td>${curso.capacidad || ''}</td>
      <td>${curso.docente ? curso.docente.Nombre + ' ' + curso.docente.Apellido : ''}</td>
      <td>${curso.rendimiento || 0}%</td>
      <td>
        <button class="edit-btn" data-id="${curso._id}">Editar</button>
        <button class="delete-btn" data-id="${curso._id}">Eliminar</button>
      </td>
    `;
    cursosTableBody.appendChild(tr);
  });
  // Attach event listeners for edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditCursoModal(id);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteCurso(id);
    });
  });
}

createCursoBtn.addEventListener('click', () => {
  editingCursoId = null;
  modalTitle.textContent = 'Crear Curso';
  cursoForm.reset();
  cursoModal.style.display = 'block';
});

modalCloseBtn.addEventListener('click', () => {
  cursoModal.style.display = 'none';
});

cursoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(cursoForm);
  const data = {
    bloque: formData.get('bloque'),
    ubicacion: formData.get('ubicacion'),
    capacidad: parseInt(formData.get('capacidad'), 10)
  };
  try {
    let response;
    if (editingCursoId) {
      response = await fetch(`/docente/cursos/${editingCursoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } else {
      response = await fetch('/docente/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error guardando curso');
    }
    cursoModal.style.display = 'none';
    fetchAndRenderCursos();
  } catch (error) {
    alert('Error al guardar el curso: ' + error.message);
  }
});

async function openEditCursoModal(id) {
  try {
    const response = await fetch(`/docente/cursos/${id}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching curso');
    const curso = await response.json();
    editingCursoId = id;
    modalTitle.textContent = 'Editar Curso';
    cursoForm.bloque.value = curso.bloque || '';
    cursoForm.ubicacion.value = curso.ubicacion || '';
    cursoForm.capacidad.value = curso.capacidad || '';
    cursoModal.style.display = 'block';
  } catch (error) {
    alert('Error al cargar el curso: ' + error.message);
  }
}

async function deleteCurso(id) {
  if (!confirm('¿Está seguro de eliminar este curso?')) return;
  try {
    const response = await fetch(`/docente/cursos/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error deleting curso');
    fetchAndRenderCursos();
  } catch (error) {
    alert('Error al eliminar el curso: ' + error.message);
  }
}

// Tareas UI
const tareasContainer = document.getElementById('tareasContainer');
const createTareaBtn = document.getElementById('createTareaBtn');
const tareaModal = document.getElementById('tareaModal');
const tareaForm = document.getElementById('tareaForm');
const tareaModalTitle = document.getElementById('tareaModalTitle');
const tareaModalCloseBtn = document.getElementById('tareaModalCloseBtn');
const tareaCursoSelect = document.getElementById('tareaCursoSelect');

let editingTareaId = null;
let cursosCache = [];

async function fetchAndRenderTareas() {
  try {
    await fetchAndCacheCursos();
    const response = await fetch('/docente/tareas', { credentials: 'include' });
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
    tareasContainer.innerHTML = '<p>No hay tareas asignadas.</p>';
    return;
  }
  tareas.forEach(tarea => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <h3>${tarea.titulo}</h3>
      <p><strong>Curso:</strong> ${getCursoName(tarea.curso)}</p>
      <p>${tarea.descripcion}</p>
      <p><strong>Fecha de entrega:</strong> ${new Date(tarea.fechaEntrega).toLocaleDateString()}</p>
      <button class="edit-tarea-btn" data-id="${tarea._id}">Editar</button>
      <button class="delete-tarea-btn" data-id="${tarea._id}">Eliminar</button>
    `;
    tareasContainer.appendChild(card);
  });
  document.querySelectorAll('.edit-tarea-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditTareaModal(btn.getAttribute('data-id'));
    });
  });
  document.querySelectorAll('.delete-tarea-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTarea(btn.getAttribute('data-id'));
    });
  });
}

async function fetchAndCacheCursos() {
  if (cursosCache.length === 0) {
    const response = await fetch('/docente/cursos/all', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching cursos');
    cursosCache = await response.json();
    populateCursoSelects();
  }
}

function populateCursoSelects() {
  // Populate curso selects in tarea and asistencia forms
  [tareaCursoSelect, document.getElementById('asistenciaCursoSelect')].forEach(select => {
    if (!select) return;
    select.innerHTML = '';
    cursosCache.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso._id;
      option.textContent = `${curso.bloque} - ${curso.ubicacion}`;
      select.appendChild(option);
    });
  });
}

createTareaBtn.addEventListener('click', () => {
  editingTareaId = null;
  tareaModalTitle.textContent = 'Crear Tarea';
  tareaForm.reset();
  tareaModal.style.display = 'flex';
});

tareaModalCloseBtn.addEventListener('click', () => {
  tareaModal.style.display = 'none';
});

tareaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(tareaForm);
  const data = {
    curso: formData.get('curso'),
    titulo: formData.get('titulo'),
    descripcion: formData.get('descripcion'),
    fechaEntrega: formData.get('fechaEntrega')
  };
  try {
    let response;
    if (editingTareaId) {
      response = await fetch(`/docente/tareas/${editingTareaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } else {
      response = await fetch('/docente/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error guardando tarea');
    }
    tareaModal.style.display = 'none';
    fetchAndRenderTareas();
  } catch (error) {
    alert('Error al guardar la tarea: ' + error.message);
  }
});

async function openEditTareaModal(id) {
  try {
    const response = await fetch(`/docente/tareas/${id}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching tarea');
    const tarea = await response.json();
    editingTareaId = id;
    tareaModalTitle.textContent = 'Editar Tarea';
    tareaForm.curso.value = tarea.curso || '';
    tareaForm.titulo.value = tarea.titulo || '';
    tareaForm.descripcion.value = tarea.descripcion || '';
    tareaForm.fechaEntrega.value = tarea.fechaEntrega ? tarea.fechaEntrega.split('T')[0] : '';
    tareaModal.style.display = 'flex';
  } catch (error) {
    alert('Error al cargar la tarea: ' + error.message);
  }
}

async function deleteTarea(id) {
  if (!confirm('¿Está seguro de eliminar esta tarea?')) return;
  try {
    const response = await fetch(`/docente/tareas/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error deleting tarea');
    fetchAndRenderTareas();
  } catch (error) {
    alert('Error al eliminar la tarea: ' + error.message);
  }
}

// Seguimiento Academico UI
const seguimientoChartCtx = document.getElementById('seguimientoChart').getContext('2d');
let seguimientoChart;

async function fetchAndRenderSeguimiento() {
  try {
    // Fetch data for chart and best students
    const response = await fetch('/docente/seguimiento', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching seguimiento');
    const data = await response.json();
    renderSeguimiento(data);
  } catch (error) {
    console.error('Error fetching seguimiento:', error);
    alert('Error al cargar el seguimiento académico');
  }
}

function renderSeguimiento(data) {
  // Data expected: { chartData: { labels: [], datasets: [] }, bestStudents: [{ nombre, curso, promedio }] }
  if (seguimientoChart) {
    seguimientoChart.destroy();
  }
  seguimientoChart = new Chart(seguimientoChartCtx, {
    type: 'bar',
    data: data.chartData,
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
  const tbody = document.querySelector('#mejoresAlumnosTable tbody');
  tbody.innerHTML = '';
  data.bestStudents.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${student.nombre}</td>
      <td>${student.curso}</td>
      <td>${student.promedio}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Gestion de Asistencia UI
const asistenciaTableBody = document.querySelector('#asistenciaTable tbody');
const createAsistenciaBtn = document.getElementById('createAsistenciaBtn');
const asistenciaModal = document.getElementById('asistenciaModal');
const asistenciaForm = document.getElementById('asistenciaForm');
const asistenciaModalTitle = document.getElementById('asistenciaModalTitle');
const asistenciaModalCloseBtn = document.getElementById('asistenciaModalCloseBtn');
const asistenciaCursoSelect = document.getElementById('asistenciaCursoSelect');

let editingAsistenciaId = null;

async function fetchAndRenderAsistencia() {
  try {
    await fetchAndCacheCursos();
    const response = await fetch('/docente/asistencia', { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching asistencia');
    const asistencias = await response.json();
    renderAsistencia(asistencias);
  } catch (error) {
    console.error('Error fetching asistencia:', error);
    alert('Error al cargar la gestión de asistencia');
  }
}

function renderAsistencia(asistencias) {
  asistenciaTableBody.innerHTML = '';
  if (asistencias.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
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
      <td>${getCursoName(asistencia.curso)}</td>
      <td>${asistencia.asistentes}</td>
      <td>
        <button class="edit-asistencia-btn" data-id="${asistencia._id}">Editar</button>
        <button class="delete-asistencia-btn" data-id="${asistencia._id}">Eliminar</button>
      </td>
    `;
    asistenciaTableBody.appendChild(tr);
  });
  document.querySelectorAll('.edit-asistencia-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditAsistenciaModal(btn.getAttribute('data-id'));
    });
  });
  document.querySelectorAll('.delete-asistencia-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteAsistencia(btn.getAttribute('data-id'));
    });
  });
}

createAsistenciaBtn.addEventListener('click', () => {
  editingAsistenciaId = null;
  asistenciaModalTitle.textContent = 'Registrar Asistencia';
  asistenciaForm.reset();
  asistenciaModal.style.display = 'flex';
});

asistenciaModalCloseBtn.addEventListener('click', () => {
  asistenciaModal.style.display = 'none';
});

asistenciaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(asistenciaForm);
  const data = {
    curso: formData.get('curso'),
    fecha: formData.get('fecha'),
    asistentes: parseInt(formData.get('asistentes'), 10)
  };
  try {
    let response;
    if (editingAsistenciaId) {
      response = await fetch(`/docente/asistencia/${editingAsistenciaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } else {
      response = await fetch('/docente/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error guardando asistencia');
    }
    asistenciaModal.style.display = 'none';
    fetchAndRenderAsistencia();
  } catch (error) {
    alert('Error al guardar la asistencia: ' + error.message);
  }
});

async function openEditAsistenciaModal(id) {
  try {
    const response = await fetch(`/docente/asistencia/${id}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Error fetching asistencia');
    const asistencia = await response.json();
    editingAsistenciaId = id;
    asistenciaModalTitle.textContent = 'Editar Asistencia';
    asistenciaForm.curso.value = asistencia.curso || '';
    asistenciaForm.fecha.value = asistencia.fecha ? asistencia.fecha.split('T')[0] : '';
    asistenciaForm.asistentes.value = asistencia.asistentes || 0;
    asistenciaModal.style.display = 'flex';
  } catch (error) {
    alert('Error al cargar la asistencia: ' + error.message);
  }
}

async function deleteAsistencia(id) {
  if (!confirm('¿Está seguro de eliminar este registro de asistencia?')) return;
  try {
    const response = await fetch(`/docente/asistencia/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error deleting asistencia');
    fetchAndRenderAsistencia();
  } catch (error) {
    alert('Error al eliminar la asistencia: ' + error.message);
  }
}

// Utility to get curso name from cached cursos
function getCursoName(cursoId) {
  const curso = cursosCache.find(c => c._id === cursoId);
  return curso ? `${curso.bloque} - ${curso.ubicacion}` : 'Desconocido';
}

// Initialize default tab and fetch data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setActiveTab('cursos');
  fetchAndRenderCursos();
});
</create_file>
