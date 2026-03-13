// js/instructor.js
import { InstructorService } from './instructor.service.js';
import { SupervisorService } from './supervisor.service.js';
import { ContratoService } from './contrato.service.js';

let instructoresGlobal = [];
let supervisoresGlobal = [];
let contratosGlobal = [];
let modalInstance = null;

export async function init() {
  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await InstructorService.get_all_instructores_paginated(1, 50);
    instructoresGlobal = response.data;

    supervisoresGlobal = await SupervisorService.get_all_supervisores();
    contratosGlobal = await ContratoService.get_all_contratos();

    console.log('Contratos cargados:', contratosGlobal);

    // 🔵 LLENAR MODALES DE CONTRATO
    const cuerpoContratoDos = document.querySelector('.cuerpoContratoDos');
    const cuerpoFechaContrato = document.querySelector('.cuerpoFechaContrato');
    const cuerpoContrato = document.querySelector('.cuerpoContrato');

    // Limpiar contenido anterior
    if (cuerpoContratoDos) cuerpoContratoDos.innerHTML = '';
    if (cuerpoFechaContrato) cuerpoFechaContrato.innerHTML = '';
    if (cuerpoContrato) cuerpoContrato.innerHTML = '';

    // Llenar con el primer contrato o mostrar vacío
    if (contratosGlobal && contratosGlobal.length > 0) {
      const primerContrato = contratosGlobal[0];
      
      if (cuerpoContratoDos) {
        cuerpoContratoDos.innerHTML = `
          <tr>
            <td>${primerContrato.valor_contrato || ''}</td>
            <td>${primerContrato.valor_mes || ''}</td>
            <td>${primerContrato.valorAdDi || ''}</td>
            <td>0</td>
            <td>0</td>
          </tr>
        `;
      }

      if (cuerpoContrato) {
        cuerpoContrato.innerHTML = `
          <tr>
            <td>${primerContrato.cdp || ''}</td>
            <td>${primerContrato.crp || ''}</td>
            <td>${primerContrato.rubro || ''}</td>
            <td>${primerContrato.dependencia || ''}</td>
          </tr>
        `;
      }

      if (cuerpoFechaContrato) {
        cuerpoFechaContrato.innerHTML = `
          <tr>
            <td>${primerContrato.id_instructor || ''}</td>
            <td>${primerContrato.numero_contrato || ''}</td>
            <td>${primerContrato.estado || ''}</td>
            <td>${primerContrato.fecha_inicio || ''}</td>
            <td>${primerContrato.fecha_fin || ''}</td>
          </tr>
        `;
      }
    } else {
      // Mostrar filas vacías si no hay contratos
      if (cuerpoContratoDos) {
        cuerpoContratoDos.innerHTML = '<tr><td colspan="5">No hay contratos disponibles</td></tr>';
      }
      if (cuerpoContrato) {
        cuerpoContrato.innerHTML = '<tr><td colspan="4">No hay contratos disponibles</td></tr>';
      }
      if (cuerpoFechaContrato) {
        cuerpoFechaContrato.innerHTML = '<tr><td colspan="5">No hay contratos disponibles</td></tr>';
      }
    }

    // 🔵 Renderizar select supervisores
    renderSupervisorSelect();

    // 🔵 Renderizar tabla
    renderTable();

    // 🔥 Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
    }

    // 🔵 INICIALIZAR DATATABLE CON BOTONES
$('#dataTableInstru').DataTable({
  responsive: true,
  autoWidth: false,
  dom: 'lBfrtip',
  buttons: [
    {
      extend: 'excel',
      text: '<i class="bi bi-file-earmark-excel"></i> Excel',
      className: 'btn btn-success btn-sm',
      title: 'Instructores',
      exportOptions: {
  columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13], // Exporta columnas 0-4 y la 6 (datos contrato)
  format: {
        body: function(data, type, row, meta) {
          // Columna 0 (Contrato botón) - mostrar texto
          if (meta.col === 0) {
            return 'Ver Contrato';
          }
          
          // Columna 3 (Documento botón) - extraer número
          if (meta.col === 3) {
            const match = data.match(/\d+/);
            return match ? match[0] : '';
          }
          
          // Columna 5 (Acciones) - no mostrar nada
          if (meta.col === 5) {
            return '';
          }
          
          // Para las columnas ocultas (6-13), los datos ya están limpios
          // Para las demás, limpiar HTML
          return data.replace(/<[^>]*>/g, '').trim();
        }
      }
}
    },
    {
      extend: 'pdf',
      text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
      className: 'btn btn-danger btn-sm',
      title: 'Instructores',
      exportOptions: {
  columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13], // Exporta columnas 0-4 y la 6 (datos contrato)
  format: {
        body: function(data, type, row, meta) {
          // Columna 0 (Contrato botón) - mostrar texto
          if (meta.col === 0) {
            return 'Ver Contrato';
          }
          
          // Columna 3 (Documento botón) - extraer número
          if (meta.col === 3) {
            const match = data.match(/\d+/);
            return match ? match[0] : '';
          }
          
          // Columna 5 (Acciones) - no mostrar nada
          if (meta.col === 5) {
            return '';
          }
          
          // Para las columnas ocultas (6-13), los datos ya están limpios
          // Para las demás, limpiar HTML
          return data.replace(/<[^>]*>/g, '').trim();
        }
      }
},
      orientation: 'landscape',
      pageSize: 'A4'
    },
    {
      extend: 'csv',
      text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
      className: 'btn btn-primary btn-sm',
      title: 'Instructores',
      exportOptions: {
  columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13], // Exporta columnas 0-4 y la 6 (datos contrato)
  format: {
        body: function(data, type, row, meta) {
          // Columna 0 (Contrato botón) - mostrar texto
          if (meta.col === 0) {
            return 'Ver Contrato';
          }
          
          // Columna 3 (Documento botón) - extraer número
          if (meta.col === 3) {
            const match = data.match(/\d+/);
            return match ? match[0] : '';
          }
          
          // Columna 5 (Acciones) - no mostrar nada
          if (meta.col === 5) {
            return '';
          }
          
          // Para las columnas ocultas (6-13), los datos ya están limpios
          // Para las demás, limpiar HTML
          return data.replace(/<[^>]*>/g, '').trim();
        }
      }
}
    },
    {
      extend: 'print',
      text: '<i class="bi bi-printer"></i> Imprimir',
      className: 'btn btn-info btn-sm',
      title: 'Instructores',
      exportOptions: {
        columns: [1, 2, 3, 4, 5]
      }
    },
    {
      extend: 'copy',
      text: '<i class="bi bi-files"></i> Copiar',
      className: 'btn btn-secondary btn-sm',
      title: 'Instructores',
      exportOptions: {
  columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13], // Exporta columnas 0-4 y la 6 (datos contrato)
  format: {
        body: function(data, type, row, meta) {
          // Columna 0 (Contrato botón) - mostrar texto
          if (meta.col === 0) {
            return 'Ver Contrato';
          }
          
          // Columna 3 (Documento botón) - extraer número
          if (meta.col === 3) {
            const match = data.match(/\d+/);
            return match ? match[0] : '';
          }
          
          // Columna 5 (Acciones) - no mostrar nada
          if (meta.col === 5) {
            return '';
          }
          
          // Para las columnas ocultas (6-13), los datos ya están limpios
          // Para las demás, limpiar HTML
          return data.replace(/<[^>]*>/g, '').trim();
        }
      }
}
    }
  ],
  columnDefs: [
    {
      targets: 0, // Columna del botón de contrato (no se exporta)
      visible: true,
      orderable: false,
      searchable: false
    }
  ],
  language: {
    lengthMenu: 'Mostrar _MENU_ registros por página',
    zeroRecords: 'No se encontraron resultados',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
    infoEmpty: 'Mostrando 0 a 0 de 0 registros',
    infoFiltered: '(filtrado de _MAX_ registros totales)',
    search: 'Buscar:',
    paginate: {
      first: 'Primero',
      last: 'Último',
      next: 'Siguiente',
      previous: 'Anterior'
    }
  }
});

    // 🔵 Delegación de eventos
    tabla.removeEventListener('click', handleTableClick);
    tabla.addEventListener('click', handleTableClick);

    // 🔵 Form editar
    const formActualizar = document.getElementById('formInstructorActualizar');
    if (formActualizar) {
      formActualizar.removeEventListener('submit', handleUpdateSubmit);
      formActualizar.addEventListener('submit', handleUpdateSubmit);
    }

    // 🔵 Form crear
    const formCrear = document.getElementById('formCrearInstructor');
    if (formCrear) {
      formCrear.removeEventListener('submit', handleCreateSubmit);
      formCrear.addEventListener('submit', handleCreateSubmit);
    }

  } catch (error) {
    console.error("Error cargando instructores:", error);
  }
}

function renderSupervisorSelect() {
  const selectSupervisor = document.querySelector('#selectSupervisor');
  if (!selectSupervisor) return;

  selectSupervisor.innerHTML = '<option value="">Seleccione supervisor</option>';

  supervisoresGlobal.forEach(supervisor => {
    const option = document.createElement("option");
    option.value = supervisor.id_supervisor;
    option.textContent = supervisor.nombre;
    selectSupervisor.appendChild(option);
  });
}

async function recargarTabla() {
  const response = await InstructorService.get_all_instructores_paginated(1, 50);
  instructoresGlobal = response.data;
  
  // 🔵 IMPORTANTE: Recargar también los contratos
  contratosGlobal = await ContratoService.get_all_contratos();

  // destruir DataTable si existe
  if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
    $('#dataTableInstru').DataTable().destroy();
  }

  renderTable();
  

  // 🔵 INICIALIZAR CON BOTONES NUEVAMENTE
  $('#dataTableInstru').DataTable({
  responsive: true,
  autoWidth: false,
  dom: 'lBfrtip',
  buttons: [
    {
      extend: 'excel',
      text: '<i class="bi bi-file-earmark-excel"></i> Excel',
      className: 'btn btn-success btn-sm',
      title: 'Instructores',
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5], // TODAS las columnas en el orden correcto
        format: {
          body: function(data, type, row, meta) {
            // meta.col es el índice de la columna (0-5)
            
            // Columna 0: CONTRATO - Usar los datos globales
            if (meta.col === 0) {
              const instructor = instructoresGlobal[meta.row];
              if (instructor) {
                const contrato = contratosGlobal.find(c => c.id_instructor == instructor.id_instructor) || {};
                const partes = [];
                if (contrato.numero_contrato) partes.push(`Contrato: ${contrato.numero_contrato}`);
                if (contrato.cdp) partes.push(`CDP: ${contrato.cdp}`);
                if (contrato.crp) partes.push(`CRP: ${contrato.crp}`);
                if (contrato.rubro) partes.push(`Rubro: ${contrato.rubro}`);
                if (contrato.dependencia) partes.push(`Dependencia: ${contrato.dependencia}`);
                if (contrato.fecha_inicio) partes.push(`Inicio: ${contrato.fecha_inicio}`);
                if (contrato.fecha_fin) partes.push(`Fin: ${contrato.fecha_fin}`);
                if (contrato.valor_contrato) partes.push(`Valor: ${contrato.valor_contrato}`);
                
                return partes.length > 0 ? partes.join(' - ') : 'Sin contrato';
              }
              return 'Sin contrato';
            }
            
            // Columna 1: NOMBRES - Limpiar HTML
            if (meta.col === 1) {
              return data.replace(/<[^>]*>/g, '').trim();
            }
            
            // Columna 2: TIPO DOC - Limpiar HTML
            if (meta.col === 2) {
              return data.replace(/<[^>]*>/g, '').trim();
            }
            
            // Columna 3: DOCUMENTO - Extraer solo el número
            if (meta.col === 3) {
              const match = data.match(/\d+/);
              return match ? match[0] : '';
            }
            
            // Columna 4: SUPERVISOR - Limpiar HTML
            if (meta.col === 4) {
              return data.replace(/<[^>]*>/g, '').trim();
            }
            
            // Columna 5: ACCIONES - No exportar botones
            if (meta.col === 5) {
              return ''; // Vacío o podrías poner "Editar/Eliminar"
            }
            
            return data;
          }
        }
      }
    },
    {
      extend: 'pdf',
      text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
      className: 'btn btn-danger btn-sm',
      title: 'Instructores',
      exportOptions: {
        columns: [0, 1, 2, 3, 4],
        format: {
          body: function(data, type, row, meta) {
            if (meta.col === 0) {
              const instructor = instructoresGlobal[meta.row];
              if (instructor) {
                const contrato = contratosGlobal.find(c => c.id_instructor == instructor.id_instructor) || {};
                const partes = [];
                if (contrato.numero_contrato) partes.push(`Contrato: ${contrato.numero_contrato}`);
                if (contrato.cdp) partes.push(`CDP: ${contrato.cdp}`);
                if (contrato.crp) partes.push(`CRP: ${contrato.crp}`);
                return partes.join(' | ');
              }
              return 'Sin contrato';
            }
            if (meta.col === 3) {
              const match = data.match(/\d+/);
              return match ? match[0] : '';
            }
            return data.replace(/<[^>]*>/g, '').trim();
          }
        }
      },
      orientation: 'landscape',
      pageSize: 'A4'
    },
    {
      extend: 'csv',
      text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
      className: 'btn btn-primary btn-sm',
      title: 'Instructores',
      exportOptions: {
        columns: [0, 1, 2, 3, 4],
        format: {
          body: function(data, type, row, meta) {
            if (meta.col === 0) {
              const instructor = instructoresGlobal[meta.row];
              if (instructor) {
                const contrato = contratosGlobal.find(c => c.id_instructor == instructor.id_instructor) || {};
                return `"${contrato.numero_contrato || ''}","${contrato.cdp || ''}","${contrato.crp || ''}"`;
              }
              return '"Sin contrato"';
            }
            if (meta.col === 3) {
              const match = data.match(/\d+/);
              return match ? match[0] : '';
            }
            return `"${data.replace(/<[^>]*>/g, '').trim()}"`;
          }
        }
      }
    },
    {
      extend: 'print',
      text: '<i class="bi bi-printer"></i> Imprimir',
      className: 'btn btn-info btn-sm',
      title: 'Instructores',
      exportOptions: {
        columns: [0, 1, 2, 3, 4]
      }
    }
  ],
  columnDefs: [
    {
      targets: 0,
      orderable: false,
      searchable: false
    }
  ],
  language: {
    lengthMenu: 'Mostrar _MENU_ registros por página',
    zeroRecords: 'No se encontraron resultados',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
    infoEmpty: 'Mostrando 0 a 0 de 0 registros',
    infoFiltered: '(filtrado de _MAX_ registros totales)',
    search: 'Buscar:',
    paginate: {
      first: 'Primero',
      last: 'Último',
      next: 'Siguiente',
      previous: 'Anterior'
    }
  }
});
}

function renderTable() {
  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;
  
  tabla.innerHTML = "";

  instructoresGlobal.forEach(inst => {
    const supervisor = supervisoresGlobal.find(
      s => s.id_supervisor == inst.id_supervisor
    );

    const contrato = contratosGlobal.find(c => c.id_instructor == inst.id_instructor) || {};

    tabla.innerHTML += `
      <tr>
        <!-- Columna 0: CONTRATO (botón) -->
        <td>
          <button class="btn btn-success boton-contrato" data-bs-toggle="modal" data-bs-target="#ModalContratoNuevo" data-id="${inst.id_instructor}">
            📄
          </button>
        </td>
        
        <!-- Columna 1: NOMBRES -->
        <td>${inst.nombres || ''} ${inst.apellidos || ''}</td>
        
        <!-- Columna 2: TIPO DOC -->
        <td>${inst.tipo_documento || ''}</td>
        
        <!-- Columna 3: DOCUMENTO -->
        <td>
          <button class="btn btn-fecha" data-bs-toggle="modal" data-bs-target="#ModalFecha" data-documento="${inst.numero_documento || ''}">
            ${inst.numero_documento || ''}
          </button>
        </td>
        
        <!-- Columna 4: SUPERVISOR -->
        <td>${supervisor ? supervisor.nombre : ''}</td>
        
        <!-- Columna 5: ACCIONES -->
        <td>
          <button class="btn btn-danger botonEliminar" data-id="${inst.id_instructor}">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-warning botonActualizar" data-id="${inst.id_instructor}">
            <i class="bi bi-repeat"></i>
          </button>
        </td>
        
        <!-- COLUMNAS OCULTAS PARA EXPORTACIÓN (6-13) -->
        <td class="contrato-numero">${contrato.numero_contrato || ''}</td>
        <td class="contrato-crp">${contrato.crp || ''}</td>
        <td class="d-none contrato-cdp">${contrato.cdp || ''}</td>
        <td class="d-none contrato-rubro">${contrato.rubro || ''}</td>
        <td class="d-none contrato-dependencia">${contrato.dependencia || ''}</td>
        <td class="d-none contrato-fecha-inicio">${contrato.fecha_inicio || ''}</td>
        <td class="d-none contrato-fecha-fin">${contrato.fecha_fin || ''}</td>
        <td class="d-none contrato-valor">${contrato.valor_contrato || ''}</td>
      </tr>
    `;
  });
}

function handleTableClick(event) {
  // 🔵 Botón CONTRATO
  const botonContrato = event.target.closest('.boton-contrato');
  if (botonContrato) {
    const instructorId = botonContrato.dataset.id;
    const contrato = contratosGlobal.find(c => c.id_instructor == instructorId);
    
    // Actualizar modales con los datos del contrato seleccionado
    const cuerpoContratoDos = document.querySelector('.cuerpoContratoDos');
    const cuerpoFechaContrato = document.querySelector('.cuerpoFechaContrato');
    const cuerpoContrato = document.querySelector('.cuerpoContrato');

    if (contrato) {
      if (cuerpoContratoDos) {
        cuerpoContratoDos.innerHTML = `
          <tr>
            <td>${contrato.valor_contrato || ''}</td>
            <td>${contrato.valor_mes || ''}</td>
            <td>${contrato.valorAdDi || ''}</td>
            <td>0</td>
            <td>0</td>
          </tr>
        `;
      }

      if (cuerpoContrato) {
        cuerpoContrato.innerHTML = `
          <tr>
            <td>${contrato.cdp || ''}</td>
            <td>${contrato.crp || ''}</td>
            <td>${contrato.rubro || ''}</td>
            <td>${contrato.dependencia || ''}</td>
          </tr>
        `;
      }

      if (cuerpoFechaContrato) {
        cuerpoFechaContrato.innerHTML = `
          <tr>
            <td>${contrato.id_instructor || ''}</td>
            <td>${contrato.numero_contrato || ''}</td>
            <td>${contrato.estado || ''}</td>
            <td>${contrato.fecha_inicio || ''}</td>
            <td>${contrato.fecha_fin || ''}</td>
          </tr>
        `;
      }
    } else {
      // Si no hay contrato, mostrar vacío
      if (cuerpoContratoDos) {
        cuerpoContratoDos.innerHTML = '<tr><td colspan="5">No hay contrato para este instructor</td></tr>';
      }
      if (cuerpoContrato) {
        cuerpoContrato.innerHTML = '<tr><td colspan="4">No hay contrato para este instructor</td></tr>';
      }
      if (cuerpoFechaContrato) {
        cuerpoFechaContrato.innerHTML = '<tr><td colspan="5">No hay contrato para este instructor</td></tr>';
      }
    }
    return;
  }

  // 🔵 Botón FECHA
  const fechaButton = event.target.closest('.btn-fecha');
  if (fechaButton) {
    const numeroDocumento = fechaButton.dataset.documento;

    const instructor = instructoresGlobal.find(
      i => i.numero_documento == numeroDocumento
    );

    const cuerpoFecha = document.querySelector('.cuerpoFecha');

    if (instructor && cuerpoFecha) {
      cuerpoFecha.innerHTML = `
        <tr>
          <td>${instructor.numero_documento}</td>
          <td>${instructor.fecha_nacimiento}</td>
          <td>${instructor.fecha_expedicion}</td>
        </tr>
      `;
    }
    return;
  }

  // 🔵 Botón ACTUALIZAR
  const editButton = event.target.closest('.botonActualizar');
  if (editButton) {
    openEditModal(editButton.dataset.id);
    return;
  }

  // 🔵 Botón ELIMINAR
  const deleteButton = event.target.closest('.botonEliminar');
  if (deleteButton) {
    eliminarInstructor(deleteButton.dataset.id);
    return;
  }
}

async function openEditModal(id) {
  const modalElement = document.getElementById('ModalActualizar');
  modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

  try {
    const instructor = await InstructorService.get_user_by_id(id);
    console.log(supervisoresGlobal);

    // 🔥 GUARDAR ID REAL
    document.getElementById('idInstructorActualizar').value = instructor.id_instructor;

    document.getElementById('nombreActualizar').value = instructor.nombres;
    document.getElementById('apellidoActualizar').value = instructor.apellidos;
    document.getElementById('tipo_documentoActualizar').value = instructor.tipo_documento;
    document.getElementById('numero_documentoActualizar').value = instructor.numero_documento;
    document.getElementById('fecha_nacimientoActualizar').value = instructor.fecha_nacimiento;
    document.getElementById('fecha_expedicionActualizar').value = instructor.fecha_expedicion;
    document.getElementById('selectActualizar').value = instructor.id_supervisor;

    modalInstance.show();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function handleUpdateSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('idInstructorActualizar').value;

  const updatedData = {
    nombres: document.getElementById('nombreActualizar').value,
    apellidos: document.getElementById('apellidoActualizar').value,
    tipo_documento: document.getElementById('tipo_documentoActualizar').value,
    numero_documento: document.getElementById('numero_documentoActualizar').value,
    fecha_nacimiento: document.getElementById('fecha_nacimientoActualizar').value,
    fecha_expedicion: document.getElementById('fecha_expedicionActualizar').value,
    id_supervisor: 1
  };

  try {
    await InstructorService.update_user_by_id(id, updatedData);
    modalInstance.hide();
    await recargarTabla();
  } catch (error) {
    console.error("Error:", error);
    modalInstance.hide();
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  const newData = {
    nombres: document.getElementById('nombreCrear').value,
    apellidos: document.getElementById('apellidoCrear').value,
    tipo_documento: document.getElementById('tipo_documentoCrear').value,
    numero_documento: document.getElementById('numero_documentoCrear').value,
    fecha_nacimiento: document.getElementById('fecha_nacimientoCrear').value,
    fecha_expedicion: document.getElementById('fecha_expedicionCrear').value,
    id_supervisor: document.getElementById('selectSupervisor').value
  };

  try {
    await InstructorService.create_instructor(newData);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("ModalCrear")
    );

    if (modal) modal.hide();
    event.target.reset();
    init();
  } catch (error) {
    console.error("Error:", error);
  }
}

// async function eliminarInstructor(id) {
//   if (!result.isConfirmed) return;
//   try {
//     await InstructorService.delete_instructor(id);
//     init();
//   } catch (error) {
//     console.error(error);
//   }
// }