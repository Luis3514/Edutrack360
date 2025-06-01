// Remove static sample data arrays
let classrooms = [];
let students = [];
let teachers = [];

// Sidebar toggle and overlay
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.getElementById('overlay');

function openSidebar() {
  sidebar.classList.remove('closed');
  overlay.classList.remove('hidden');
}

function closeSidebar() {
  sidebar.classList.add('closed');
  overlay.classList.add('hidden');
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// User info rendering
function renderUserInfo() {
  // Assuming user info is rendered server-side and available in a global variable `window.user`
  const user = window.user || null;
  if (!user) return;

  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const headerUserName = document.getElementById('headerUserName');
  const headerUserEmail = document.getElementById('headerUserEmail');

  if (userAvatar) userAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  if (userName) userName.textContent = user.name || 'Usuario';
  if (userEmail) userEmail.textContent = user.email || 'usuario@ejemplo.com';
  if (headerUserAvatar) headerUserAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  if (headerUserName) headerUserName.textContent = user.name || 'Usuario';
  if (headerUserEmail) headerUserEmail.textContent = user.email || 'usuario@ejemplo.com';
}

// Tab switching
const menuButtons = document.querySelectorAll('.menu-button');
const tabSections = document.querySelectorAll('.tab-section');

function setActiveTab(tabId) {
  menuButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  tabSections.forEach(section => {
    section.classList.toggle('active', section.id === tabId);
  });
  // Close sidebar on mobile after tab change
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
  // Fetch data for the active tab
  if (tabId === 'salones') {
    fetchClassrooms();
  } else if (tabId === 'estudiantes') {
    fetchStudents();
  } else if (tabId === 'docentes') {
    fetchTeachers();
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

// Fetch data functions
async function fetchClassrooms() {
  try {
    const response = await fetch('/api/public/salones');
    if (!response.ok) throw new Error('Error fetching classrooms');
    classrooms = await response.json();
    console.log('Fetched classrooms:', classrooms);
    renderAllSectionTables();
    renderClassroomsSummaryTable();
  } catch (error) {
    console.error(error);
    alert('Error al cargar los salones');
  }
}

async function fetchStudents() {
  try {
    const response = await fetch('/api/public/estudiantes');
    if (!response.ok) throw new Error('Error fetching students');
    students = await response.json();
    renderAllSectionTables();
  } catch (error) {
    console.error(error);
    alert('Error al cargar los estudiantes');
  }
}

async function fetchTeachers() {
  try {
    const response = await fetch('/api/docentes');
    if (!response.ok) throw new Error('Error fetching teachers');
    teachers = await response.json();
    renderAllSectionTables();
  } catch (error) {
    console.error(error);
    alert('Error al cargar los docentes');
  }
}

// Utility to render tables for classrooms, students, teachers
function renderSectionTable(data, tableBodySelector, columns, actionsHandlers) {
  const tbody = document.querySelector(tableBodySelector);
  tbody.innerHTML = '';

  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length + 1; // +1 for actions column
    td.textContent = 'No hay datos disponibles';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      // Adjust accessor for nested properties if needed
      let value = item[col.accessor];
      if (col.accessor.includes('.')) {
        const keys = col.accessor.split('.');
        value = keys.reduce((obj, key) => (obj ? obj[key] : ''), item);
      }
      td.textContent = value || '';
      tr.appendChild(td);
    });

    // Actions column
    const actionsTd = document.createElement('td');
    actionsTd.style.display = 'flex';
    actionsTd.style.gap = '0.5rem';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'btn-edit';
    editBtn.addEventListener('click', () => actionsHandlers.edit(item._id || item.id));
    actionsTd.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.className = 'btn-delete';
    deleteBtn.addEventListener('click', () => actionsHandlers.delete(item._id || item.id));
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  });
}

// Classroom section handlers
const classroomsColumns = [
  { header: 'Bloque', accessor: 'bloque' },
  { header: 'Ubicación', accessor: 'ubicacion' },
  { header: 'Capacidad', accessor: 'capacidad' },
  { header: 'Docente', accessor: 'docente.Nombre' }
];

async function createClassroom() {
  openClassroomDialog('create');
}

async function editClassroom(id) {
  const classroom = classrooms.find(c => (c._id || c.id) === id);
  if (classroom) {
    openClassroomDialog('edit', classroom);
  }
}

async function deleteClassroom(id) {
  if (!confirm('¿Está seguro de que desea eliminar este salón?')) return;
  try {
    const response = await fetch(`/api/salones/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error eliminando salón');
    classrooms = classrooms.filter(c => (c._id || c.id) !== id);
    renderAllSectionTables();
  } catch (error) {
    console.error(error);
    alert('Error al eliminar el salón');
  }
}

// Student section handlers
const studentsColumns = [
  { header: 'Nombre', accessor: 'Nombre' },
  { header: 'Apellidos', accessor: 'Apellidos' },
  { header: 'correo', accessor: 'correo' },
  { header: 'Salon', accessor: 'Salon' }
];

async function createStudent() {
  openStudentDialog('create');
}

async function editStudent(id) {
  const student = students.find(s => (s._id || s.id) === id);
  if (student) {
    openStudentDialog('edit', student);
  }
}

async function deleteStudent(id) {
  if (!confirm('¿Está seguro de que desea eliminar este estudiante?')) return;
  try {
    const response = await fetch(`/api/estudiantes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error eliminando estudiante');
    students = students.filter(s => (s._id || s.id) !== id);
    renderAllSectionTables();
  } catch (error) {
    console.error(error);
    alert('Error al eliminar el estudiante');
  }
}

// Teacher section handlers
const teachersColumns = [
  { header: 'Nombre', accessor: 'Nombre' },
  { header: 'Apellido', accessor: 'Apellido' },
  { header: 'correo', accessor: 'correo' },
  { header: 'GradoAcademico', accessor: 'GradoAcademico' }
];

async function createTeacher() {
  openTeacherDialog('create');
}

async function editTeacher(id) {
  const teacher = teachers.find(t => (t._id || t.id) === id);
  if (teacher) {
    openTeacherDialog('edit', teacher);
  }
}

async function deleteTeacher(id) {
  if (!confirm('¿Está seguro de que desea eliminar este docente?')) return;
  try {
    const response = await fetch(`/api/docentes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error eliminando docente');
    teachers = teachers.filter(t => (t._id || t.id) !== id);
    renderAllSectionTables();
  } catch (error) {
    console.error(error);
    alert('Error al eliminar el docente');
  }
}

// Render all section tables
function renderAllSectionTables() {
  renderSectionTable(classrooms, '#classroomsSectionTable tbody', classroomsColumns, {
    edit: editClassroom,
    delete: deleteClassroom
  });
  renderSectionTable(students, '#studentsSectionTable tbody', studentsColumns, {
    edit: editStudent,
    delete: deleteStudent
  });
  renderSectionTable(teachers, '#teachersSectionTable tbody', teachersColumns, {
    edit: editTeacher,
    delete: deleteTeacher
  });
}

// Modal dialog elements and logic
const modalContainer = document.getElementById('modalContainer');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

let currentDialogMode = null;
let currentDialogData = null;
let currentDialogType = null;
let currentDialogConfirmCallback = null;

function openModal(title, contentHtml, confirmCallback, confirmText = 'Confirmar') {
  modalTitle.textContent = title;
  modalBody.innerHTML = contentHtml;
  modalConfirmBtn.textContent = confirmText;
  modalConfirmBtn.disabled = false;
  modalConfirmBtn.style.display = 'inline-block';
  modalCancelBtn.style.display = 'inline-block';
  modalContainer.classList.remove('hidden');
  currentDialogConfirmCallback = confirmCallback;
}

function closeModal() {
  modalContainer.classList.add('hidden');
  currentDialogConfirmCallback = null;
  currentDialogData = null;
  currentDialogMode = null;
  currentDialogType = null;
}

modalCloseBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
modalConfirmBtn.addEventListener('click', () => {
  if (currentDialogConfirmCallback) {
    currentDialogConfirmCallback();
  }
});

// Classroom dialog form HTML
function getClassroomDialogHtml(data = {}) {
  const teacherOptions = teachers.map(t => {
    const selected = data.docente && (data.docente._id || data.docente.id) === (t._id || t.id) ? 'selected' : '';
    return `<option value="${t._id || t.id}" ${selected}>${t.Nombre} ${t.Apellido}</option>`;
  }).join('');
  const blockOptions = ['Bloque A', 'Bloque B', 'Bloque C', 'Bloque D', 'Bloque E'].map(b => {
    const selected = data.bloque === b ? 'selected' : '';
    return `<option value="${b}" ${selected}>${b}</option>`;
  }).join('');
  return `
    <form id="classroomForm">
      <label>Bloque:<br><select name="bloque" required>
        <option value="">Seleccione un bloque</option>
        ${blockOptions}
      </select></label><br>
      <label>Ubicación:<br><input type="text" name="ubicacion" value="${data.ubicacion || ''}" required></label><br>
      <label>Capacidad:<br><input type="number" name="capacidad" value="${data.capacidad || ''}" required min="15"></label><br>
      <label>Docente:<br><select name="docente" required>
        <option value="">Seleccione un docente</option>
        ${teacherOptions}
      </select></label><br>
    </form>
  `;
}

function getStudentDialogHtml(data = {}) {
  const teacherOptions = teachers.map(t => {
    const selected = data.docente === (t._id || t.id) ? 'selected' : '';
    return `<option value="${t._id || t.id}" ${selected}>${t.Nombre} ${t.Apellido}</option>`;
  }).join('');
  const classroomOptions = [{_id: '', Nombre: 'Ninguno'}].concat(classrooms).map(c => {
    const selected = data.Salon === (c._id || c.id) ? 'selected' : '';
    return `<option value="${c._id || c.id}" ${selected}>${c.Nombre || c}</option>`;
  }).join('');
  return `
    <form id="studentForm">
      <div style="display:flex; gap:1rem;">
        <label style="flex:1;">Correo:<br><input type="email" name="correo" value="${data.correo || ''}" required></label>
        <label style="flex:1;">Contraseña:<br><input type="password" name="password" value="${data.password || ''}" required></label>
      </div>
      <label>Nombre:<br><input type="text" name="Nombre" value="${data.Nombre || ''}" required></label><br>
      <label>Apellidos:<br><input type="text" name="Apellidos" value="${data.Apellidos || ''}" required></label><br>
      <label>Salón:<br><select name="Salon">
        ${classroomOptions}
      </select></label><br>
    </form>
  `;
}

function getTeacherDialogHtml(data = {}, mode = 'edit') {
  return `
    <form id="teacherForm">
      <label>Nombre:<br><input type="text" name="Nombre" value="${data.Nombre || ''}" required></label><br>
      <label>Apellido:<br><input type="text" name="Apellido" value="${data.Apellido || ''}" required></label><br>
      <label>Correo:<br><input type="email" name="correo" value="${data.correo || ''}" required></label><br>
      <label>Grado Académico:<br><input type="text" name="GradoAcademico" value="${data.GradoAcademico || ''}" required></label><br>
      ${mode === 'create' ? `<label>Contraseña:<br><input type="password" name="password" required></label><br>` : ''}
    </form>
  `;
}

// Open classroom dialog
function openClassroomDialog(mode, data = {}) {
  currentDialogType = 'classroom';
  currentDialogMode = mode;
  currentDialogData = data;
  openModal(
    mode === 'create' ? 'Crear Nuevo Salón' : 'Editar Salón',
    getClassroomDialogHtml(data),
    async () => {
      const form = document.getElementById('classroomForm');
      if (form.reportValidity()) {
        const formData = new FormData(form);
        const newData = {
          bloque: formData.get('bloque'),
          ubicacion: formData.get('ubicacion'),
          capacidad: parseInt(formData.get('capacidad')),
          docente: formData.get('docente')
        };
        try {
          let response;
          if (mode === 'create') {
            response = await fetch('/api/salones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          } else {
            response = await fetch(`/api/salones/${data._id || data.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error guardando salón');
          }
          const result = await response.json();
          if (mode === 'create') {
            classrooms.push(result);
          } else {
            const index = classrooms.findIndex(c => (c._id || c.id) === (data._id || data.id));
            if (index !== -1) {
              classrooms[index] = result;
            }
          }
          renderAllSectionTables();
          closeModal();
        } catch (error) {
          console.error(error);
          alert('Error al guardar el salón: ' + error.message);
        }
      }
    },
    mode === 'create' ? 'Crear' : 'Guardar'
  );
}

// Open student dialog
function openStudentDialog(mode, data = {}) {
  currentDialogType = 'student';
  currentDialogMode = mode;
  currentDialogData = data;
  openModal(
    mode === 'create' ? 'Crear Nuevo Estudiante' : 'Editar Estudiante',
    getStudentDialogHtml(data),
    async () => {
      const form = document.getElementById('studentForm');
      if (form.reportValidity()) {
        const formData = new FormData(form);
        const newData = {
          correo: formData.get('correo'),
          password: formData.get('password'),
          Nombre: formData.get('Nombre'),
          Apellidos: formData.get('Apellidos'),
          Salon: formData.get('Salon')
        };
        try {
          let response;
          if (mode === 'create') {
            response = await fetch('/api/estudiantes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          } else {
            response = await fetch(`/api/estudiantes/${data._id || data.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error guardando estudiante');
          }
          const result = await response.json();
          if (mode === 'create') {
            students.push(result);
          } else {
            const index = students.findIndex(s => (s._id || s.id) === (data._id || data.id));
            if (index !== -1) {
              students[index] = result;
            }
          }
          renderAllSectionTables();
          closeModal();
        } catch (error) {
          console.error(error);
          alert('Error al guardar el estudiante: ' + error.message);
        }
      }
    },
    mode === 'create' ? 'Crear' : 'Guardar'
  );
}

// Open teacher dialog
function openTeacherDialog(mode, data = {}) {
  currentDialogType = 'teacher';
  currentDialogMode = mode;
  currentDialogData = data;
  openModal(
    mode === 'create' ? 'Crear Nuevo Docente' : 'Editar Docente',
    getTeacherDialogHtml(data, mode),
    async () => {
      const form = document.getElementById('teacherForm');
      if (form.reportValidity()) {
        const formData = new FormData(form);
        const newData = {
          Nombre: formData.get('Nombre'),
          Apellido: formData.get('Apellido'),
          correo: formData.get('correo'),
          GradoAcademico: formData.get('GradoAcademico')
        };
        if (mode === 'create') {
          newData.password = formData.get('password');
        }
        try {
          let response;
          if (mode === 'create') {
            response = await fetch('/api/docentes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          } else {
            response = await fetch(`/api/docentes/${data._id || data.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error guardando docente');
          }
          const result = await response.json();
          if (mode === 'create') {
            teachers.push(result);
          } else {
            const index = teachers.findIndex(t => (t._id || t.id) === (data._id || data.id));
            if (index !== -1) {
              teachers[index] = result;
            }
          }
          renderAllSectionTables();
          closeModal();
        } catch (error) {
          console.error(error);
          alert('Error al guardar el docente: ' + error.message);
        }
      }
    },
    mode === 'create' ? 'Crear' : 'Guardar'
  );
}

// Attach create buttons event listeners
document.getElementById('createClassroomBtn').addEventListener('click', createClassroom);
document.getElementById('createStudentBtn').addEventListener('click', createStudent);
document.getElementById('createTeacherBtn').addEventListener('click', createTeacher);

// Initialize all tables on load
function init() {
  renderUserInfo();
  setActiveTab('dashboard');
  // Fetch initial data for default tab if needed
  fetchClassrooms();
  fetchStudents();
  fetchTeachers();
  fetchPerformanceData();
  renderClassroomsSummaryTable();

  // Add event listener for Generate PDF button
  const generatePdfBtn = document.getElementById('generatePdfBtn');
  if (generatePdfBtn) {
    generatePdfBtn.addEventListener('click', generatePdfReport);
  }
}

document.addEventListener('DOMContentLoaded', init);

// Function to generate PDF report of dashboard summary with tables using jsPDF and autotable
async function generatePdfReport() {
  try {
    const totalClassrooms = document.getElementById('reportTotalClassrooms').textContent;
    const totalStudents = document.getElementById('reportTotalStudents').textContent;
    const totalTeachers = document.getElementById('reportTotalTeachers').textContent;

    // Load jsPDF and autotable from CDN
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(mod => mod.jspdf),
      import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js')
    ]);

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte Resumen EduTrack360', 14, 22);

    doc.setFontSize(12);

    // Prepare table data
    const headers = [['Categoría', 'Cantidad']];
    const data = [
      ['Total Salones', totalClassrooms],
      ['Total Estudiantes', totalStudents],
      ['Total Docentes', totalTeachers]
    ];

    // Use autotable plugin
    const autoTable = autoTableModule.default || autoTableModule;
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [54, 162, 235] },
      styles: { fontSize: 12 }
    });

    // Save the PDF
    doc.save('reporte_resumen_edutrack360.pdf');
  } catch (error) {
    console.error('Error generando el PDF:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
}

// Fetch performance data and render chart
async function fetchPerformanceData() {
  try {
    const response = await fetch('/api/salones/rendimiento', { credentials: 'include' });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching performance data:', response.status, errorText);
      throw new Error('Error fetching performance data');
    }
    const data = await response.json();
    renderPerformanceChart(data.labels, data.data);
  } catch (error) {
    console.error(error);
    alert('Error al cargar datos de rendimiento');
  }
}

// Render performance chart using Chart.js
function renderPerformanceChart(labels, data) {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  if (window.performanceChartInstance) {
    window.performanceChartInstance.destroy();
  }
  window.performanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Rendimiento',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  // Also render pie chart for rendimiento distribution
  renderPerformancePieChart(labels, data);
}

// Render pie chart for rendimiento distribution
function renderPerformancePieChart(labels, data) {
  const ctx = document.getElementById('performancePieChart').getContext('2d');
  if (window.performancePieChartInstance) {
    window.performancePieChartInstance.destroy();
  }
  window.performancePieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Rendimiento',
        data: data,
        backgroundColor: generateColorPalette(data.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Generate color palette for pie chart
function generateColorPalette(numColors) {
  const palette = [
    '#4dc9f6',
    '#f67019',
    '#f53794',
    '#537bc4',
    '#acc236',
    '#166a8f',
    '#00a950',
    '#58595b',
    '#8549ba'
  ];
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

// Render classrooms summary table with anonymized names and random rendimiento
function renderClassroomsSummaryTable() {
  const tbody = document.querySelector('#classroomsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!window.classrooms || window.classrooms.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No hay datos disponibles';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  window.classrooms.forEach((salon, index) => {
    const tr = document.createElement('tr');

    const nombreTd = document.createElement('td');
    nombreTd.textContent = `Salón ${index + 1}`; // anonymized name
    tr.appendChild(nombreTd);

    const capacidadTd = document.createElement('td');
    capacidadTd.textContent = salon.capacidad || salon.Capacidad || '';
    tr.appendChild(capacidadTd);

    const alumnosTd = document.createElement('td');
    alumnosTd.textContent = salon.alumnos ? salon.alumnos.length : 0;
    tr.appendChild(alumnosTd);

    const docenteTd = document.createElement('td');
    if (salon.docente) {
      docenteTd.textContent = salon.docente.nombre ? salon.docente.nombre + ' ' + (salon.docente.apellido || '') : salon.docente.Nombre || '';
    } else {
      docenteTd.textContent = '';
    }
    tr.appendChild(docenteTd);

    const rendimientoTd = document.createElement('td');
    const randomRendimiento = Math.floor(Math.random() * 101); // random 0-100%
    rendimientoTd.textContent = randomRendimiento + '%';
    tr.appendChild(rendimientoTd);

    tbody.appendChild(tr);
  });
}
