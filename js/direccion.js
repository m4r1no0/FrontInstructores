import { DireccionService } from "./direccion.service.js";

let direccionesGlobal = [];

export async function initDireccion() {
  const tabla = document.querySelector(".cuerpoTablaDireccion");
  console.log(tabla);
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await DireccionService.get_all_direcciones();
    
    // Verificar la estructura de la respuesta
    console.log("Respuesta completa:", response);
    
    // Manejar diferentes estructuras de respuesta
    if (response && response.data) {
      direccionesGlobal = response.data;
    } else if (Array.isArray(response)) {
      direccionesGlobal = response;
    } else {
      direccionesGlobal = [];
    }
    
    console.log("Direcciones procesadas:", direccionesGlobal);


    // 🔥 Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableDireccion')) {
      $('#dataTableDireccion').DataTable().destroy();
    }

    // Limpiar y renderizar tabla
    renderTable();

    // 🔵 INICIALIZAR DATATABLE CON BOTONES
    $('#dataTableDireccion').DataTable({
      responsive: true,
      autoWidth: false,
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Excel',
          className: 'btn btn-success btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
          className: 'btn btn-danger btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          },
          orientation: 'landscape',
          pageSize: 'A4'
        },
        {
          extend: 'csv',
          text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
          className: 'btn btn-primary btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          }
        },
        {
          extend: 'print',
          text: '<i class="bi bi-printer"></i> Imprimir',
          className: 'btn btn-info btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4]
          }
        },
        {
          extend: 'copy',
          text: '<i class="bi bi-files"></i> Copiar',
          className: 'btn btn-secondary btn-sm',
          title: 'Direcciones',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          }
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

  } catch (error) {
    console.error("Error cargando direcciones:", error);
    // Mostrar mensaje de error en la tabla
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (tabla) {
      tabla.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">
            Error al cargar las direcciones: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

function renderTable() {
  const tabla = document.querySelector(".cuerpoTablaDireccion");
  if (!tabla) return;
  
  // Limpiar tabla
  tabla.innerHTML = '';
  
  if (!direccionesGlobal || direccionesGlobal.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          No hay direcciones disponibles
        </td>
      </tr>
    `;
    return;
  }
  
  // Construir HTML de la tabla
  let html = '';
  
  direccionesGlobal.forEach(dir => {
    
    html += `
      <tr>
        <!-- Columna 0: Instructor -->
        <td>${dir.nombre}</td>
        
        <!-- Columna 2: Municipio -->
        <td>${dir.municipio || ''}</td>
        
        <!-- Columna 4: Complemento -->
        <td>${dir.complemento || ''}</td>

        <!-- Columna 3: Telefono -->
        <td>${dir.telefono || ''}</td>

        <!-- Columna 5: Correo -->
        <td>${dir.correo || ''}</td>
        
        <!-- Columna 6: ACCIONES -->
        <td>
          <button class="btn btn-danger btn-sm botonEliminar" data-id="${dir.id_direccion}">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-warning btn-sm botonActualizar" data-id="${dir.id_direccion}">
            <i class="bi bi-repeat"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tabla.innerHTML = html;
  
  // Agregar event listeners a los botones después de renderizar
  agregarEventListenersBotones();
}

function agregarEventListenersBotones() {
  // Botones eliminar
  document.querySelectorAll('.botonEliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('¿Está seguro de eliminar esta dirección?')) {
        try {
          await DireccionService.delete_direccion(id);
          await initDireccion(); // Recargar tabla
        } catch (error) {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar la dirección');
        }
      }
    });
  });

  // Botones actualizar
  document.querySelectorAll('.botonActualizar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const direccion = direccionesGlobal.find(d => d.id_direccion == id);
      if (direccion) {
        abrirModalActualizar(direccion);
      }
    });
  });
}

function abrirModalActualizar(direccion) {
  // Implementar según tu modal
  console.log('Actualizar dirección:', direccion);
  // Aquí iría la lógica para abrir el modal y llenar los campos
}

// Función para recargar la tabla (si la necesitas)
export async function recargarTablaDireccion() {
  await initDireccion();
}

// Inicializar automáticamente cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en la página de direcciones
  if (document.querySelector(".cuerpoTablaDireccion")) {
    initDireccion();
  }
});
