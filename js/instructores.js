// js/instructor.js
import { InstructorService } from './instructor.service.js';



let instructoresGlobal = [];
let filtrado = [];

export async function init() {
  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;

    // =========================================
// EXPORTAR EXCEL DINÁMICO
// =========================================
window.exportarContratosExcel = function () {

  // Obtener checkbox seleccionados
  const checks = document.querySelectorAll(".campo-exportar:checked");

  // Campos elegidos
  const camposSeleccionados = Array.from(checks).map(c => c.value);

  console.log("Campos:", camposSeleccionados);

  // Construir JSON dinámico
  const datosFiltrados = instructoresGlobal.map(item => {

    let nuevoObjeto = {};

    camposSeleccionados.forEach(campo => {

      // Cambiar nombre columnas
      switch (campo) {

        case "id_instructor":
          nuevoObjeto["ID Instructor"] = item[campo];
          break;

        case "instructor_nombre":
          nuevoObjeto["Instructor"] = item[campo];
          break;

        case "numero_documento":
          nuevoObjeto["Documento"] = item[campo];
          break;

        case "tipo_documento":
          nuevoObjeto["Tipo Documento"] = item[campo];
          break;

        case "numero_contrato":
          nuevoObjeto["Contrato"] = item[campo];
          break;

        case "valor_contrato":
          nuevoObjeto["Valor Contrato"] = item[campo];
          break;

        case "valor_mes":
          nuevoObjeto["Valor Mensual"] = item[campo];
          break;

        case "fecha_inicio":
          nuevoObjeto["Fecha Inicio"] = item[campo];
          break;

        case "fecha_fin":
          nuevoObjeto["Fecha Fin"] = item[campo];
          break;

        default:
          nuevoObjeto[campo.toUpperCase()] = item[campo];
          break;

      }

    });

    return nuevoObjeto;

  });

  console.log(datosFiltrados);

  // Crear hoja
  const ws = XLSX.utils.json_to_sheet(datosFiltrados);

  // Crear libro
  const wb = XLSX.utils.book_new();

  // Agregar hoja
  XLSX.utils.book_append_sheet(wb, ws, "Contratos");

  // Descargar
  XLSX.writeFile(wb, "contratos.xlsx");

};

// =========================================
// BOTON EXPORTAR
// =========================================
document
  .getElementById("btnDescargarExcel")
  .addEventListener("click", () => {

    exportarContratosExcel();

});
  


    // 🔵 LLENAR MODALES DE CONTRATO
    const cuerpoContratoDos = document.querySelector('.cuerpoContratoDos');
    const cuerpoFechaContrato = document.querySelector('.cuerpoFechaContrato');
    const cuerpoContrato = document.querySelector('.cuerpoContrato');

    // Limpiar contenido anterior
    if (cuerpoContratoDos) cuerpoContratoDos.innerHTML = '';
    if (cuerpoFechaContrato) cuerpoFechaContrato.innerHTML = '';
    if (cuerpoContrato) cuerpoContrato.innerHTML = '';

    // Llenar con el primer contrato o mostrar vacío
    if (instructoresGlobal && instructoresGlobal.length > 0) {
      const primerContrato = instructoresGlobal[0];

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
            <td>${primerContrato.id_instructor}</td>
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
    renderSupervisorSelectActualizar();

    // 🔵 Renderizar tabla
    renderTable();

    // 🔥 Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
    }

    var oldExportAction = $.fn.dataTable.ext.buttons.excelHtml5.action;
    let columns;
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

          action: function (e, dt, node, config) {
            console.log('Botón Excel clickeado');

            columns = [7, 8, 9, 10, 11, 12, 13];
            config.exportOptions.columns = columns;
            oldExportAction.call(this, e, dt, node, config);
          },
          exportOptions: {
            columns: columns,
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
                return data.replace(/<[^>]*>/g, '').trim();
              }
            },

          }

        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
          className: 'btn btn-danger btn-sm',
          title: 'Instructores',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          }
        }
      ],
      columnDefs: [
        {
          targets: 0,
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

    // 🔵 Form crear - CORREGIDO: el id correcto es 'formInstructor'
    const formCrear = document.getElementById('formInstructor');
    if (formCrear) {
      formCrear.removeEventListener('submit', handleCreateInstructorSubmit);
      formCrear.addEventListener('submit', handleCreateInstructorSubmit);
      console.log("✅ Event listener del formulario de instructor configurado");
    } else {
      console.error("❌ No se encontró el formulario con id 'formInstructor'");
    }

  } catch (error) {
    console.error("Error cargando instructores:", error);
  }
}

function renderSupervisorSelect() {
  const selectSupervisor = document.querySelector('#selectSupervisor');
  if (!selectSupervisor) return;

  selectSupervisor.innerHTML = '<option value="">Seleccione supervisor</option>';

  instructoresGlobal.forEach(supervisor => {
    const option = document.createElement("option");
    option.value = supervisor.id_supervisor;
    option.textContent = supervisor.nombre;
    selectSupervisor.appendChild(option);
  });
}

function renderSupervisorSelectActualizar() {
  const selectActualizar = document.querySelector('#selectActualizar');
  if (!selectActualizar) return;

  selectActualizar.innerHTML = '<option value="">Seleccione supervisor</option>';

  instructoresGlobal.forEach(supervisor => {
    const option = document.createElement("option");
    option.value = supervisor.id_supervisor;
    option.textContent = supervisor.nombre;
    selectActualizar.appendChild(option);
  });
}

async function recargarTabla() {
  console.log("🔄 Recargando tabla de instructores...");

  try {
    // Recargar instructores
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;
    console.log(`✅ Instructores cargados: ${instructoresGlobal.length}`);

    // Destruir DataTable si existe
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
      console.log("🗑️ DataTable anterior destruida");
    }

    // Volver a renderizar el tbody con los nuevos datos
    renderTable();

    // Reinicializar DataTable con la configuración completa
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
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
            columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
              body: function (data, type, row, meta) {
                if (meta.col === 0) {
                  return 'Ver Contrato';
                }
                if (meta.col === 3) {
                  const match = data.match(/\d+/);
                  return match ? match[0] : '';
                }
                if (meta.col === 5) {
                  return '';
                }
                return data.replace(/<[^>]*>/g, '').trim();
              }
            }
          }
        }
      ],
      columnDefs: [
        {
          targets: 0,
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

    console.log(`✅ Tabla recargada exitosamente. Total registros: ${instructoresGlobal.length}`);

  } catch (error) {
    console.error("❌ Error al recargar la tabla:", error);
    alert("Error al recargar los datos. Por favor recargue la página.");
  }
}

function renderTable() {
  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  instructoresGlobal.forEach(inst => {
    const supervisor = instructoresGlobal.find(
      s => s.id_supervisor == inst.id_supervisor
    );

    const contrato = instructoresGlobal.find(c => c.id_instructor == inst.id_instructor) || {};

    tabla.innerHTML += `
      <tr>
        <!-- Columna 0: CONTRATO (botón) -->
        <td>
          <button class="btn btn-success boton-contrato" data-bs-toggle="modal" data-bs-target="#ModalContratoNuevo" data-id="${inst.id_instructor}">
            📄
          </button>
        </td>
        
        <!-- Columna 1: NOMBRES -->
        <td>${inst.instructor_nombre}</td>
        
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
    const contrato = instructoresGlobal.find(c => c.id_instructor == instructorId);

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
    id_supervisor: document.getElementById('selectActualizar').value
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

// 🔵 FUNCIÓN CORREGIDA PARA CREAR INSTRUCTOR
async function handleCreateInstructorSubmit(event) {
  event.preventDefault();
  console.log("📝 Enviando formulario de creación de instructor...");

  const newData = {
    nombres: document.getElementById('nombre').value,
    apellidos: document.getElementById('apellido').value,
    tipo_documento: document.getElementById('tipo_documento').value,
    numero_documento: document.getElementById('documento').value,
    fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
    fecha_expedicion: document.getElementById('fecha_expedicion').value,
    id_supervisor: document.getElementById('selectSupervisor').value
  };

  // Validar campos requeridos
  if (!newData.nombres || !newData.apellidos || !newData.numero_documento) {
    console.error("❌ Campos requeridos faltantes");
    alert("Por favor complete todos los campos requeridos");
    return;
  }

  try {
    console.log("Enviando datos:", newData);
    await InstructorService.create_instructor(newData);
    console.log("✅ Instructor creado exitosamente");

    // Cerrar modal
    const modalElement = document.getElementById("ModalAgregar");
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Limpiar formulario
    event.target.reset();

    // 🔥 IMPORTANTE: Recargar los datos globales y la tabla
    await recargarDatosCompletos();

  } catch (error) {
    console.error("❌ Error al crear instructor:", error);
    alert("Error al crear el instructor. Por favor verifique los datos e intente nuevamente.");
  }
}

async function eliminarInstructor(id) {
  const confirmacion = confirm("¿Está seguro de eliminar este instructor?");
  if (!confirmacion) return;

  try {
    await InstructorService.delete_instructor(id);
    console.log("✅ Instructor eliminado");
    await init();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error al eliminar el instructor");
  }
}

// Función para recargar todos los datos globales y actualizar la tabla
async function recargarDatosCompletos() {
  console.log("🔄 Recargando datos completos...");

  try {
    // Recargar instructores
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;


    // 🔥 IMPORTANTE: Destruir el DataTable actual
    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
      console.log("🗑️ DataTable destruida");
    }

    // Volver a renderizar la tabla con los nuevos datos
    renderTable();

    // Reinicializar DataTable con la misma configuración
    reinicializarDataTable();

    console.log("✅ Tabla recargada exitosamente");

  } catch (error) {
    console.error("❌ Error al recargar datos:", error);
  }
}

// Función para reinicializar DataTable
function reinicializarDataTable() {
  console.log("🔄 Reinicializando DataTable...");

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
          columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
          format: {
            body: function (data, type, row, meta) {
              if (meta.col === 0) return 'Ver Contrato';
              if (meta.col === 3) {
                const match = data.match(/\d+/);
                return match ? match[0] : '';
              }
              if (meta.col === 5) return '';
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
          columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
          format: {
            body: function (data, type, row, meta) {
              if (meta.col === 0) return 'Ver Contrato';
              if (meta.col === 3) {
                const match = data.match(/\d+/);
                return match ? match[0] : '';
              }
              if (meta.col === 5) return '';
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
          columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
          format: {
            body: function (data, type, row, meta) {
              if (meta.col === 0) return 'Ver Contrato';
              if (meta.col === 3) {
                const match = data.match(/\d+/);
                return match ? match[0] : '';
              }
              if (meta.col === 5) return '';
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
          columns: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
          format: {
            body: function (data, type, row, meta) {
              if (meta.col === 0) return 'Ver Contrato';
              if (meta.col === 3) {
                const match = data.match(/\d+/);
                return match ? match[0] : '';
              }
              if (meta.col === 5) return '';
              return data.replace(/<[^>]*>/g, '').trim();
            }
          }
        }
      }
    ],
    columnDefs: [
      {
        targets: 0,
        visible: true,
        orderable: false,
        searchable: false
      }
    ],
    language: {
      lengthMenu: 'Mostrar _MENU_ registro por pág ',
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

  console.log("✅ DataTable reinicializada correctamente");
}