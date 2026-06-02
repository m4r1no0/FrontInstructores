// js/instructor.js
import { InstructorService } from './instructor.service.js';

let instructoresGlobal = [];
let filtrado = [];
let modalInstance = null;  // ✅ VARIABLE GLOBAL para el modal de actualización

export async function init() {
  const tabla = document.querySelector(".cuerpoTabla");
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;

    // =========================================
    // =========================================
    // EXPORTAR EXCEL SOLO CON MAP
    // =========================================
    window.exportarContratosExcel = function () {

      // Obtener campos seleccionados
      const camposSeleccionados = Array
        .from(document.querySelectorAll(".campo-exportar:checked"))
        .map(check => check.value);

      // Nombres personalizados columnas
      const nombresColumnas = {

        id_instructor: "ID Instructor",
        instructor_nombre: "Instructor",
        numero_documento: "Documento",
        tipo_documento: "Tipo Documento",
        numero_contrato: "Contrato",
        nombre: "Supervisor",
        cdp: "CDP",
        crp: "CRP",
        rubro: "Rubro",
        dependencia: "Dependencia",
        valor_contrato: "Valor Contrato",
        valor_mes: "Valor Mensual",
        fecha_inicio: "Fecha Inicio",
        fecha_fin: "Fecha Fin",
        estado: "Estado",
        nombre_area: "Area de formacion",
        nombre_programa: "Programa de formacion"

      };

      // =========================================
      // FILTRAR DATOS CON MAP
      // =========================================
      const datosFiltrados = instructoresGlobal.map(item => {

        let objeto = {};

        camposSeleccionados.map(campo => {

          objeto[nombresColumnas[campo]] = item[campo];

        });

        return objeto;

      });

      console.log(datosFiltrados);

      // Crear hoja Excel
      const ws = XLSX.utils.json_to_sheet(datosFiltrados);

      // Crear libro
      const wb = XLSX.utils.book_new();

      // Agregar hoja
      XLSX.utils.book_append_sheet(wb, ws, "Contratos");

      // Descargar archivo
      XLSX.writeFile(wb, "contratos.xlsx");

    };

    // =========================================
    // BOTÓN EXPORTAR
    // =========================================
    document
      .getElementById("btnDescargarExcel")
      .addEventListener("click", exportarContratosExcel);

    // 🔵 LLENAR MODALES DE CONTRATO
    const cuerpoContratoDos = document.querySelector('.cuerpoContratoDos');
    const cuerpoFechaContrato = document.querySelector('.cuerpoFechaContrato');
    const cuerpoContrato = document.querySelector('.cuerpoContrato');

    // Limpiar contenido anterior
    if (cuerpoContratoDos) limpiarTabla(cuerpoContratoDos);
    if (cuerpoFechaContrato) limpiarTabla(cuerpoFechaContrato);
    if (cuerpoContrato) limpiarTabla(cuerpoContrato);

    // Llenar con el primer contrato o mostrar vacío
    if (instructoresGlobal && instructoresGlobal.length > 0) {
      const primerContrato = instructoresGlobal[0];

      if (cuerpoContratoDos) {
        llenarTablaContratoDos(cuerpoContratoDos, primerContrato);
      }

      if (cuerpoContrato) {
        llenarTablaContrato(cuerpoContrato, primerContrato);
      }

      if (cuerpoFechaContrato) {
        llenarTablaFechaContrato(cuerpoFechaContrato, primerContrato);
      }
    } else {
      if (cuerpoContratoDos) {
        mostrarMensajeSinDatos(cuerpoContratoDos, 5);
      }
      if (cuerpoContrato) {
        mostrarMensajeSinDatos(cuerpoContrato, 4);
      }
      if (cuerpoFechaContrato) {
        mostrarMensajeSinDatos(cuerpoFechaContrato, 5);
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

    // 🔵 INICIALIZAR DATATABLE CON BOTONES
    $('#dataTableInstru').DataTable({
      responsive: true,
      autoWidth: false,
      deferRender: true,
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Excel',
          className: 'btn btn-success btn-sm',
          title: 'Instructores',
          exportOptions: {
            columns: [1,2,3,4,6,7,8,9,10,11,12,13],
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

    // 🔵 Form crear
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

// ============================================
// FUNCIONES AUXILIARES PARA LIMPIAR Y LLENAR TABLAS SIN INNERHTML
// ============================================

function limpiarTabla(tbody) {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
}

function mostrarMensajeSinDatos(tbody, colspan) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = colspan;
  cell.textContent = 'No hay contratos disponibles';
  cell.style.textAlign = 'center';
  row.appendChild(cell);
  tbody.appendChild(row);
}

function llenarTablaContratoDos(tbody, contrato) {
  const row = document.createElement('tr');
  
  const cellValorContrato = document.createElement('td');
  cellValorContrato.textContent = contrato.valor_contrato || '';
  row.appendChild(cellValorContrato);
  
  const cellValorMes = document.createElement('td');
  cellValorMes.textContent = contrato.valor_mes || '';
  row.appendChild(cellValorMes);
  
  const cellValorAdDi = document.createElement('td');
  cellValorAdDi.textContent = contrato.valorAdDi || '';
  row.appendChild(cellValorAdDi);
  
  const cellCero1 = document.createElement('td');
  cellCero1.textContent = '0';
  row.appendChild(cellCero1);
  
  const cellCero2 = document.createElement('td');
  cellCero2.textContent = '0';
  row.appendChild(cellCero2);
  
  tbody.appendChild(row);
}

function llenarTablaContrato(tbody, contrato) {
  const row = document.createElement('tr');
  
  const cellCdp = document.createElement('td');
  cellCdp.textContent = contrato.cdp || '';
  row.appendChild(cellCdp);
  
  const cellCrp = document.createElement('td');
  cellCrp.textContent = contrato.crp || '';
  row.appendChild(cellCrp);
  
  const cellRubro = document.createElement('td');
  cellRubro.textContent = contrato.rubro || '';
  row.appendChild(cellRubro);
  
  const cellDependencia = document.createElement('td');
  cellDependencia.textContent = contrato.dependencia || '';
  row.appendChild(cellDependencia);
  
  tbody.appendChild(row);
}

function llenarTablaFechaContrato(tbody, contrato) {
  const row = document.createElement('tr');
  
  const cellIdInstructor = document.createElement('td');
  cellIdInstructor.textContent = contrato.id_instructor;
  row.appendChild(cellIdInstructor);
  
  const cellNumeroContrato = document.createElement('td');
  cellNumeroContrato.textContent = contrato.numero_contrato || '';
  row.appendChild(cellNumeroContrato);
  
  const cellEstado = document.createElement('td');
  cellEstado.textContent = contrato.estado || '';
  row.appendChild(cellEstado);
  
  const cellFechaInicio = document.createElement('td');
  cellFechaInicio.textContent = contrato.fecha_inicio || '';
  row.appendChild(cellFechaInicio);
  
  const cellFechaFin = document.createElement('td');
  cellFechaFin.textContent = contrato.fecha_fin || '';
  row.appendChild(cellFechaFin);
  
  tbody.appendChild(row);
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

  if (!instructoresGlobal || !Array.isArray(instructoresGlobal)) {
    console.warn('instructoresGlobal no está disponible o no es un array');
    return;
  }

  const supervisoresUnicos = new Map();
  
  instructoresGlobal.forEach(supervisor => {
    if (supervisor && supervisor.id_supervisor && !supervisoresUnicos.has(supervisor.id_supervisor)) {
      supervisoresUnicos.set(supervisor.id_supervisor, supervisor);
    }
  });

  supervisoresUnicos.forEach(supervisor => {
    const option = document.createElement("option");
    option.value = supervisor.id_supervisor;
    option.textContent = supervisor.nombre;
    selectActualizar.appendChild(option);
  });
  
  console.log(`Select llenado con ${supervisoresUnicos.size} supervisores únicos`);
}

async function recargarTabla() {
  console.log("🔄 Recargando tabla de instructores...");

  try {
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;
    console.log(`✅ Instructores cargados: ${instructoresGlobal.length}`);

    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
      console.log("🗑️ DataTable anterior destruida");
    }

    renderTable();

    $('#dataTableInstru').DataTable({
      responsive: true,
      autoWidth: false,
      deferRender: true,
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
  const tbody = document.querySelector(".cuerpoTabla");
  if (!tbody) return;

  // Limpiar tbody
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  instructoresGlobal.forEach(inst => {
    const supervisor = instructoresGlobal.find(
      s => s.id_supervisor == inst.id_supervisor
    );

    const contrato = instructoresGlobal.find(c => c.id_instructor == inst.id_instructor) || {};

    // Crear fila
    const row = document.createElement('tr');

    // Columna 0: Botón CONTRATO
    const cellBoton = document.createElement('td');
    const botonContrato = document.createElement('button');
    botonContrato.className = 'btn btn-primary boton-contrato';
    botonContrato.setAttribute('data-bs-toggle', 'modal');
    botonContrato.setAttribute('data-bs-target', '#ModalContratoNuevo');
    botonContrato.setAttribute('data-id', inst.id_instructor);
    botonContrato.textContent = '📄';
    cellBoton.appendChild(botonContrato);
    row.appendChild(cellBoton);

    // Columna 1: NOMBRES
    const cellNombre = document.createElement('td');
    cellNombre.textContent = inst.instructor_nombre;
    row.appendChild(cellNombre);

    // Columna 2: TIPO DOCUMENTO
    const cellTipoDoc = document.createElement('td');
    cellTipoDoc.textContent = inst.tipo_documento || '';
    row.appendChild(cellTipoDoc);

    // Columna 3: DOCUMENTO (con botón)
    const cellDocumento = document.createElement('td');
    const botonFecha = document.createElement('button');
    botonFecha.className = 'btn btn-fecha';
    botonFecha.setAttribute('data-bs-toggle', 'modal');
    botonFecha.setAttribute('data-bs-target', '#ModalFecha');
    botonFecha.setAttribute('data-documento', inst.numero_documento || '');
    botonFecha.textContent = inst.numero_documento || '';
    cellDocumento.appendChild(botonFecha);
    row.appendChild(cellDocumento);

    // Columna 4: SUPERVISOR
    const cellSupervisor = document.createElement('td');
    cellSupervisor.textContent = supervisor ? supervisor.nombre : '';
    row.appendChild(cellSupervisor);

    // Columna 5: ACCIONES
    const cellAcciones = document.createElement('td');
    
    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn-danger botonEliminar';
    botonEliminar.setAttribute('data-id', inst.id_instructor);
    const iconTrash = document.createElement('i');
    iconTrash.className = 'bi bi-trash';
    botonEliminar.appendChild(iconTrash);
    
    const botonActualizar = document.createElement('button');
    botonActualizar.className = 'btn btn-warning botonActualizar';
    botonActualizar.setAttribute('data-id', inst.id_instructor);
    const iconRepeat = document.createElement('i');
    iconRepeat.className = 'bi bi-repeat';
    botonActualizar.appendChild(iconRepeat);
    
    cellAcciones.appendChild(botonEliminar);
    cellAcciones.appendChild(botonActualizar);
    row.appendChild(cellAcciones);

    // Columnas ocultas (d-none)
    const cellArea = document.createElement('th');
    cellArea.className = 'd-none';
    cellArea.textContent = inst.nombre_area;
    row.appendChild(cellArea);
    
    const cellPrograma = document.createElement('th');
    cellPrograma.className = 'd-none';
    cellPrograma.textContent = inst.nombre_programa;
    row.appendChild(cellPrograma);
    
    const cellNumeroContrato = document.createElement('td');
    cellNumeroContrato.className = 'contrato-numero';
    cellNumeroContrato.textContent = contrato.numero_contrato || '';
    row.appendChild(cellNumeroContrato);
    
    const cellCrp = document.createElement('td');
    cellCrp.className = 'contrato-crp';
    cellCrp.textContent = contrato.crp || '';
    row.appendChild(cellCrp);
    
    const cellCdp = document.createElement('td');
    cellCdp.className = 'd-none contrato-cdp';
    cellCdp.textContent = contrato.cdp || '';
    row.appendChild(cellCdp);
    
    const cellRubro = document.createElement('td');
    cellRubro.className = 'd-none contrato-rubro';
    cellRubro.textContent = contrato.rubro || '';
    row.appendChild(cellRubro);
    
    const cellDependencia = document.createElement('td');
    cellDependencia.className = 'd-none contrato-dependencia';
    cellDependencia.textContent = contrato.dependencia || '';
    row.appendChild(cellDependencia);
    
    const cellFechaInicio = document.createElement('td');
    cellFechaInicio.className = 'd-none contrato-fecha-inicio';
    cellFechaInicio.textContent = contrato.fecha_inicio || '';
    row.appendChild(cellFechaInicio);
    
    const cellFechaFin = document.createElement('td');
    cellFechaFin.className = 'd-none contrato-fecha-fin';
    cellFechaFin.textContent = contrato.fecha_fin || '';
    row.appendChild(cellFechaFin);
    
    const cellValor = document.createElement('td');
    cellValor.className = 'd-none contrato-valor';
    cellValor.textContent = contrato.valor_contrato || '';
    row.appendChild(cellValor);

    tbody.appendChild(row);
  });
}

function handleTableClick(event) {
  // Botón CONTRATO
  const botonContrato = event.target.closest('.boton-contrato');
  if (botonContrato) {
    const instructorId = botonContrato.dataset.id;
    const contrato = instructoresGlobal.find(c => c.id_instructor == instructorId);

    const cuerpoContratoDos = document.querySelector('.cuerpoContratoDos');
    const cuerpoFechaContrato = document.querySelector('.cuerpoFechaContrato');
    const cuerpoContrato = document.querySelector('.cuerpoContrato');

    if (cuerpoContratoDos) limpiarTabla(cuerpoContratoDos);
    if (cuerpoContrato) limpiarTabla(cuerpoContrato);
    if (cuerpoFechaContrato) limpiarTabla(cuerpoFechaContrato);

    if (contrato) {
      if (cuerpoContratoDos) {
        llenarTablaContratoDos(cuerpoContratoDos, contrato);
      }
      if (cuerpoContrato) {
        llenarTablaContrato(cuerpoContrato, contrato);
      }
      if (cuerpoFechaContrato) {
        llenarTablaFechaContrato(cuerpoFechaContrato, contrato);
      }
    } else {
      if (cuerpoContratoDos) {
        mostrarMensajeSinDatos(cuerpoContratoDos, 5);
      }
      if (cuerpoContrato) {
        mostrarMensajeSinDatos(cuerpoContrato, 4);
      }
      if (cuerpoFechaContrato) {
        mostrarMensajeSinDatos(cuerpoFechaContrato, 5);
      }
    }
    return;
  }

  // Botón FECHA
  const fechaButton = event.target.closest('.btn-fecha');
  if (fechaButton) {
    const numeroDocumento = fechaButton.dataset.documento;

    const instructor = instructoresGlobal.find(
      i => i.numero_documento == numeroDocumento
    );

    const cuerpoFecha = document.querySelector('.cuerpoFecha');

    if (cuerpoFecha) limpiarTabla(cuerpoFecha);

    if (instructor && cuerpoFecha) {
      const row = document.createElement('tr');
      
      const cellDocumento = document.createElement('td');
      cellDocumento.textContent = instructor.numero_documento;
      row.appendChild(cellDocumento);
      
      const cellFechaNac = document.createElement('td');
      cellFechaNac.textContent = instructor.fecha_nacimiento;
      row.appendChild(cellFechaNac);
      
      const cellFechaExp = document.createElement('td');
      cellFechaExp.textContent = instructor.fecha_expedicion;
      row.appendChild(cellFechaExp);
      
      cuerpoFecha.appendChild(row);
    }
    return;
  }

  // Botón ACTUALIZAR
  const editButton = event.target.closest('.botonActualizar');
  if (editButton) {
    openEditModal(editButton.dataset.id);
    return;
  }

  // Botón ELIMINAR
  const deleteButton = event.target.closest('.botonEliminar');
  if (deleteButton) {
    eliminarInstructor(deleteButton.dataset.id);
    return;
  }
}

// ============================================
// FUNCIÓN openEditModal
// ============================================
async function openEditModal(id) {
  const modalElement = document.getElementById('ModalActualizar');
  
  if (!modalElement) {
    console.error('Modal element not found');
    return;
  }

  // ✅ Usar variable global (sin let)
  modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

  try {
    const instructor = await InstructorService.get_user_by_id(id);

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
    Swal.fire('Error', 'No se pudo cargar el instructor', 'error');
  }
}

// ============================================
// FUNCIÓN handleUpdateSubmit
// ============================================
async function handleUpdateSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('idInstructorActualizar').value;

  if (!id) {
    Swal.fire('Error', 'ID de instructor no encontrado', 'error');
    return;
  }

  const updatedData = {
    nombres: document.getElementById('nombreActualizar').value,
    apellidos: document.getElementById('apellidoActualizar').value,
    tipo_documento: document.getElementById('tipo_documentoActualizar').value,
    numero_documento: document.getElementById('numero_documentoActualizar').value,
    fecha_nacimiento: document.getElementById('fecha_nacimientoActualizar').value,
    fecha_expedicion: document.getElementById('fecha_expedicionActualizar').value,
    id_supervisor: document.getElementById('selectActualizar').value
  };

  // Mostrar loading
  Swal.fire({
    title: 'Actualizando...',
    text: 'Por favor espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    await InstructorService.update_user_by_id(id, updatedData);
    
    // ✅ Cerrar modal usando variable global
    if (modalInstance) {
      modalInstance.hide();
      setTimeout(() => {
        if (modalInstance) {
          modalInstance.dispose();
          modalInstance = null;
        }
      }, 300);
    }
    
    await recargarTabla();
    
    Swal.fire('¡Actualizado!', 'Instructor actualizado correctamente', 'success');
    
  } catch (error) {
    console.error("Error:", error);
    
    if (modalInstance) {
      modalInstance.hide();
    }
    
    Swal.fire('Error', error.message || 'No se pudo actualizar el instructor', 'error');
  }
}

// FUNCIÓN PARA CREAR INSTRUCTOR
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

  if (!newData.nombres || !newData.apellidos || !newData.numero_documento) {
    console.error("❌ Campos requeridos faltantes");
    Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
    return;
  }

  try {
    console.log("Enviando datos:", newData);
    await InstructorService.create_instructor(newData);
    console.log("✅ Instructor creado exitosamente");

    const modalElement = document.getElementById("ModalAgregar");
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    event.target.reset();
    await recargarDatosCompletos();

    Swal.fire('Creado', 'Instructor creado correctamente', 'success');

  } catch (error) {
    console.error("❌ Error al crear instructor:", error);
    Swal.fire('Error', 'No se pudo crear el instructor', 'error');
  }
}

async function eliminarInstructor(id) {
  const result = await Swal.fire({
    title: '¿Está seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    await InstructorService.delete_instructor_by_id(id);
    console.log("✅ Instructor eliminado");
    await recargarDatosCompletos();
    Swal.fire('Eliminado', 'Instructor eliminado correctamente', 'success');
  } catch (error) {
    console.error("Error al eliminar:", error);
    Swal.fire('Error', 'No se pudo eliminar el instructor', 'error');
  }
}

async function recargarDatosCompletos() {
  console.log("🔄 Recargando datos completos...");

  try {
    const response = await InstructorService.get_all_instructores_paginated(1, 200);
    instructoresGlobal = response.data;

    if ($.fn.DataTable.isDataTable('#dataTableInstru')) {
      $('#dataTableInstru').DataTable().destroy();
      console.log("🗑️ DataTable destruida");
    }

    renderTable();
    reinicializarDataTable();

    console.log("✅ Tabla recargada exitosamente");

  } catch (error) {
    console.error("❌ Error al recargar datos:", error);
  }
}

function reinicializarDataTable() {
  console.log("🔄 Reinicializando DataTable...");

  $('#dataTableInstru').DataTable({
    responsive: true,
    autoWidth: false,
    deferRender: true,
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

  console.log("✅ DataTable reinicializada correctamente");
}