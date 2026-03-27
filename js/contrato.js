import { ContratoService } from './contrato.service.js';

export async function initContrato() {
    console.log("=== INITCONTRATO EJECUTÁNDOSE ===");
    
    
    const contratos = await ContratoService.get_contrato_instructor()
    let contratoLeft = contratos.data
    console.log(contratos)

    // Esperar a que el DOM esté listo
    const initialize = () => {
        console.log("Inicializando tabla...");
        
        // Verificar que la tabla existe
        const tabla = document.getElementById('dataTableContrato');
        if (!tabla) {
            console.error("❌ No se encontró la tabla");
            return;
        }
        
        // Verificar el número de columnas en el thead
        const thead = tabla.querySelector('thead tr');
        if (thead) {
            const numColumnas = thead.querySelectorAll('th').length;
            console.log("Número de columnas en thead:", numColumnas);
            if (numColumnas !== 12) {
                console.warn(`⚠️ La tabla tiene ${numColumnas} columnas pero debería tener 12`);
            }
        }
        
        // Verificar jQuery
        if (typeof $ === 'undefined') {
            console.error("❌ jQuery no está cargado");
            return;
        }
        
        // Verificar DataTable
        if (typeof $.fn.DataTable === 'undefined') {
            console.error("❌ DataTable no está cargado");
            return;
        }
        
        console.log("✅ jQuery y DataTable disponibles");
        
        // Obtener la tabla
        const $table = $('#dataTableContrato');
        
        // Destruir instancia anterior si existe
        if ($.fn.DataTable.isDataTable('#dataTableContrato')) {
            console.log("Destruyendo DataTable existente");
            $table.DataTable().destroy();
        }
        
        // Limpiar el tbody
        const $tbody = $table.find('tbody');
        $tbody.empty();
        console.log("✅ tbody limpiado");
        
        // Llenar los datos manualmente
        contratoLeft.forEach((contrato,) => {
            const row = `
                <tr>
                    <td>
                        <div class="col my-3">
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ModalAgregarContrato">
                                    +
                            </button>
                        </div>
                    </td>
                    <td>${contrato.id_instructor}</td>
                    <td>${contrato.numero_contrato}</td>
                    <td>${contrato.nombres} ${contrato.apellidos}</td>
                    <td>${contrato.numero_documento}</td>
                    <td>${contrato.crp}</td>
                </tr>
            `;
            $tbody.append(row);
        });
        
        console.log(`✅ ${contratos.length} filas agregadas al tbody`);
        console.log("Filas en tbody:", $tbody.find('tr').length);
        
        // Inicializar DataTable con configuración explícita
        try {
            const dataTable = $table.DataTable({
                responsive: true,
                pageLength: 10,
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
                order: [[0, 'desc']],
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                },
                // Configuración adicional para evitar errores
                destroy: true,
                retrieve: false,
                paging: true,
                searching: true,
                info: true
            });
            
            console.log("✅✅✅ DATATABLE INICIALIZADO CON ÉXITO ✅✅✅");
            console.log("Total registros:", dataTable.rows().count());
            
            // Forzar redibujo
            dataTable.draw();
            
        } catch (error) {
            console.error("Error al inicializar DataTable:", error);
            console.log("Intentando inicializar sin opciones complejas...");
            
            // Intentar con opciones mínimas
            try {
                const dataTable = $table.DataTable({
                    responsive: true
                });
                console.log("✅ DataTable inicializado con opciones mínimas");
            } catch (error2) {
                console.error("Error incluso con opciones mínimas:", error2);
            }
        }
    };
    
    // Ejecutar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Pequeño retraso para asegurar que todo esté renderizado
        setTimeout(initialize, 50);
    }
}

function formatMoney(amount) {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  const newData = {
    numeroContrato: document.getElementById('numeroContrato').value,
    crp: document.getElementById('CRP').value,
    cdp: document.getElementById('CDP').value,
    rubro: document.getElementById('rubro').value,
    dependencia: document.getElementById('dependencia').value,
    fechaInicio: document.getElementById('fecha_inicio').value,
    fechaFin: document.getElementById('fechaFin').value,
    valorContrato: document.getElementById('valorContrato').value,
    valorMes: document.getElementById('valorMes').value

  }

  try {
    await ContratoService.create_contrato(newData);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("ModalAgregarContrato")
    );
    

    if (modal) modal.hide();
    event.target.reset();
    init();
  } catch (error) {
    console.error("Error:", error);
  }
}

    // 🔵 Form crear
    const formCrear = document.getElementById('formContrato');
    if (formCrear) {
      formCrear.removeEventListener('submit', handleCreateSubmit);
      formCrear.addEventListener('submit', handleCreateSubmit);
    }
