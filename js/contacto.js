import { ContactoService } from "./contacto.service.js";

let contactosGlobal = [];

export async function initContacto() {
  const tabla = document.querySelector(".cuerpoTablaContacto");
  console.log(tabla);
  if (!tabla) return;

  try {
    // 🔵 Obtener datos
    const response = await ContactoService.get_all_contactos();
    
    // Verificar la estructura de la respuesta
    console.log("Respuesta completa:", response);
    
    // Manejar diferentes estructuras de respuesta
    if (response && response.data) {
      contactosGlobal = response.data;
    } else if (Array.isArray(response)) {
      contactosGlobal = response;
    } else {
      contactosGlobal = [];
    }
    
    console.log("Contactos procesados:", contactosGlobal);


    // 🔥 Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable('#dataTableContacto')) {
      $('#dataTableContacto').DataTable().destroy();
    }

    // Limpiar y renderizar tabla
    renderTable();

    // 🔵 INICIALIZAR DATATABLE CON BOTONES
    $('#dataTableContacto').DataTable({
      responsive: true,
      autoWidth: false,
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Excel',
          className: 'btn btn-success btn-sm',
          title: 'Contactos',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
          className: 'btn btn-danger btn-sm',
          title: 'Contactos',
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
          title: 'Contactos',
          exportOptions: {
            columns: [0, 1, 2, 3, 4],
          }
        },
        {
          extend: 'print',
          text: '<i class="bi bi-printer"></i> Imprimir',
          className: 'btn btn-info btn-sm',
          title: 'Contactos',
          exportOptions: {
            columns: [0, 1, 2, 3, 4]
          }
        },
        {
          extend: 'copy',
          text: '<i class="bi bi-files"></i> Copiar',
          className: 'btn btn-secondary btn-sm',
          title: 'Contactos',
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
    console.error("Error cargando contactos:", error);
    // Mostrar mensaje de error en la tabla
    const tabla = document.querySelector(".cuerpoTablaContacto");
    if (tabla) {
      tabla.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">
            Error al cargar los contactos: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

function renderTable() {
  const tabla = document.querySelector(".cuerpoTablaContacto");
  if (!tabla) return;
  
  // Limpiar tabla
  tabla.innerHTML = '';
  
  if (!contactosGlobal || contactosGlobal.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          No hay contactos disponibles
        </td>
      </tr>
    `;
    return;
  }
  
  // Construir HTML de la tabla
  let html = '';
  
  contactosGlobal.forEach(contacto => {
    
    html += `
      <tr>
        <!-- Columna 0: Instructor -->
        <td>${contacto.nombre}</td>
        
        <!-- Columna 2: Municipio -->
        <td>${contacto.correo_personal || ''}</td>
        
        <!-- Columna 4: Complemento -->
        <td>${contacto.correo_institucional || ''}</td>

        <!-- Columna 3: Telefono -->
        <td>${contacto.telefono || ''}</td>
        
        <!-- Columna 6: ACCIONES -->
        <td>
          <button class="btn btn-danger btn-sm botonEliminar" data-id="${contacto.id_contacto}">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-warning btn-sm botonActualizar" data-id="${contacto.id_contacto}">
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
      if (confirm('¿Está seguro de eliminar este contacto?')) {
        try {
          await ContactoService.delete_contacto(id);
          await initContacto(); // Recargar tabla
        } catch (error) {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el contacto');
        }
      }
    });
  });

  // Botones actualizar
  document.querySelectorAll('.botonActualizar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const contacto = contactosGlobal.find(c => c.id_contacto == id);
      if (contacto) {
        abrirModalActualizar(contacto);
      }
    });
  });
}

function abrirModalActualizar(contacto) {
  // Implementar según tu modal
  console.log('Actualizar contacto:', contacto);
  // Aquí iría la lógica para abrir el modal y llenar los campos
}

// Función para recargar la tabla (si la necesitas)
export async function recargarTablaContacto() {
  await initContacto();
}

// Inicializar automáticamente cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en la página de contactos
  if (document.querySelector(".cuerpoTablaContacto")) {
    initContacto();
  }
});
