import { ContratoService } from './contrato.service.js';

export async function initPago() {
    console.log("=== INITPAGO EJECUTÁNDOSE ===");
    
    const tabla = document.getElementById('dataTablePago');
    if (!tabla) {
        console.warn("⚠️ La tabla 'dataTablePago' no existe en el DOM");
        return;
    }
    
    try {
        // Cargar contratos para el selector
        await cargarContratos();
        
        const pagos = await ContratoService.get_contratos_by_instructor();
        console.log("Respuesta de contratos:", pagos);
        const pagosData = pagos.data || pagos;

        setupFormHandler();
        setupDeleteFormHandler();
        setupUpdateFormHandler();
        setupModalButtons();
        initializeTable(pagosData);
        
    } catch (error) {
        console.error("Error en initPago:", error);
    }
}

// =============================
// CARGAR CONTRATOS PARA SELECTOR
// =============================
async function cargarContratos() {
    try {
        const response = await ContratoService.get_contratos_by_instructor();
        const contratos = response.data || response;
        
        const selectContrato = document.getElementById('id_contrato');
        const selectEditContrato = document.getElementById('edit_id_contrato');
        
        if (selectContrato) {
            selectContrato.innerHTML = '<option value="">Seleccione un contrato...</option>';
            contratos.forEach(contrato => {
                const option = document.createElement('option');
                option.value = contrato.id_contrato;
                option.textContent = `${contrato.numero_contrato} - ${contrato.nombre_completo}`;
                selectContrato.appendChild(option);
            });
        }
        
        if (selectEditContrato) {
            selectEditContrato.innerHTML = '<option value="">Seleccione un contrato...</option>';
            contratos.forEach(contrato => {
                const option = document.createElement('option');
                option.value = contrato.id_contrato;
                option.textContent = `${contrato.numero_contrato} - ${contrato.nombre_completo}`;
                selectEditContrato.appendChild(option);
            });
        }
        
        console.log("✅ Contratos cargados:", contratos.length);
    } catch (error) {
        console.error("Error cargando contratos:", error);
    }
}

// =============================
// CALCULAR SALDO AUTOMÁTICAMENTE
// =============================
function calcularSaldo() {
    const valorBase = parseFloat(document.getElementById('valor_base')?.value || 0);
    const ajuste = parseFloat(document.getElementById('ajuste')?.value || 0);
    const valorPagado = parseFloat(document.getElementById('valor_pagado')?.value || 0);
    
    const valorAPagar = valorBase + ajuste;
    const saldo = valorAPagar - valorPagado;
    
    const saldoField = document.getElementById('saldo_calculado');
    if (saldoField) {
        saldoField.value = formatMoney(saldo);
        saldoField.style.color = saldo > 0 ? 'red' : (saldo < 0 ? 'green' : 'black');
    }
    
    return saldo;
}

// =============================
// INICIALIZAR TABLA
// =============================
function initializeTable(pagosData) {
    console.log("Inicializando tabla de pagos...");
    
    const tabla = document.getElementById('dataTablePago');
    if (!tabla) {
        console.error("❌ No se encontró la tabla");
        return;
    }
    
    if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') {
        console.error("❌ jQuery o DataTable no están cargados");
        return;
    }
    
    const $table = $('#dataTablePago');
    
    if ($.fn.DataTable.isDataTable('#dataTablePago')) {
        $table.DataTable().destroy();
    }
    
    const cuerpoTabla = document.querySelector('.cuerpoTabla');
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = '';
    
    if (pagosData && pagosData.length > 0) {
        pagosData.forEach((pago) => {
            const saldoClass = pago.saldo > 0 ? 'text-danger' : (pago.saldo < 0 ? 'text-success' : '');
            const row = `
                <tr>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm btn-editar-pago" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEditarPago" 
                                data-id-pago="${pago.id_pago}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-eliminar-pago" 
                                data-bs-toggle="modal" 
                                data-bs-target="#ModalEliminarPago" 
                                data-id-pago="${pago.id_pago}">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                    <td>${pago.numero_contrato || ''}</td>
                    <td>${pago.nombre_completo || ''}</td>
                    <td>${pago.fecha_inicio || ''}</td>
                    <td class="text-end">${formatMoney(pago.valor_mes)}</td>
                    <td class="text-end">${formatMoney(pago.valor_contrato)}</td>
                    <td class="text-end">${formatMoney(pago.valor_pagado)}</td>
                    <td class="text-end ${saldoClass}">${formatMoney(pago.valorAdDi)}</td>
                    <td>${formatDate(pago.fecha_fin)}</td>
                    <td>${formatDate(pago.vigencia)}</td>
                </tr>
            `;
            cuerpoTabla.innerHTML += row;
        });
        console.log(`✅ ${pagosData.length} filas agregadas`);
    } else {
        cuerpoTabla.innerHTML = '<tr><td colspan="10" class="text-center">No hay pagos registrados</td></tr>';
    }
    
    try {
        $table.DataTable({
            responsive: true,
            language: {
                "decimal": "",
                "emptyTable": "No hay pagos disponibles",
                "info": "Mostrando _START_ a _END_ de _TOTAL_ pagos",
                "infoEmpty": "Mostrando 0 a 0 de 0 pagos",
                "infoFiltered": "(filtrado de _MAX_ pagos totales)",
                "lengthMenu": "Mostrar _MENU_ pagos",
                "search": "Buscar:",
                "zeroRecords": "No se encontraron pagos",
                "paginate": {
                    "first": "Primero",
                    "last": "Último",
                    "next": "Siguiente",
                    "previous": "Anterior"
                }
            },
            pageLength: 10,
            order: [[1, 'desc']],
            columnDefs: [{ targets: 0, orderable: false, searchable: false }]
        });
        console.log("✅ DataTable inicializada");
    } catch (error) {
        console.error("Error al inicializar DataTable:", error);
    }
}

// =============================
// FUNCIONES DE UTILIDAD
// =============================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO');
    } catch {
        return 'Fecha inválida';
    }
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '$0';
    const numero = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numero)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numero);
}

// =============================
// CONFIGURACIÓN DE FORMULARIOS
// =============================
function setupFormHandler() {
    const form = document.getElementById('formPago');
    if (form) {
        form.removeEventListener('submit', handleCreateSubmit);
        form.addEventListener('submit', handleCreateSubmit);
        
        // Event listeners para calcular saldo automáticamente
        ['valor_base', 'ajuste', 'valor_pagado'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeEventListener('input', calcularSaldo);
                input.addEventListener('input', calcularSaldo);
            }
        });
    }
}

function setupUpdateFormHandler() {
    const form = document.getElementById('formEditarPago');
    if (form) {
        form.removeEventListener('submit', handleUpdateSubmit);
        form.addEventListener('submit', handleUpdateSubmit);
        
        ['edit_valor_base', 'edit_ajuste', 'edit_valor_pagado'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeEventListener('input', () => calcularSaldoEdicion());
                input.addEventListener('input', () => calcularSaldoEdicion());
            }
        });
    }
}

function setupDeleteFormHandler() {
    const form = document.getElementById('formEliminarPago');
    if (form) {
        form.removeEventListener('submit', handleDeleteSubmit);
        form.addEventListener('submit', handleDeleteSubmit);
    }
}

function setupModalButtons() {
    $(document).on('click', '.btn-editar-pago', async function(e) {
        const id_pago = $(this).data('id-pago');
        if (id_pago) {
            try {
                // const response = await PagoService.get_pago_by_id(id_pago);
                // const pago = response.data || response;
                
                // document.getElementById('edit_id_pago').value = pago.id_pago;
                // document.getElementById('edit_id_contrato').value = pago.id_contrato;
                // document.getElementById('edit_mes').value = pago.mes;
                // document.getElementById('edit_valor_base').value = pago.valor_base;
                // document.getElementById('edit_ajuste').value = pago.ajuste;
                // document.getElementById('edit_valor_pagado').value = pago.valor_pagado;
                
                // calcularSaldoEdicion();
            } catch (error) {
                console.error("Error cargando pago:", error);
            }
        }
    });
    
    $(document).on('click', '.btn-eliminar-pago', function(e) {
        const id_pago = $(this).data('id-pago');
        document.getElementById('id_pago_eliminar').value = id_pago;
    });
}

function calcularSaldoEdicion() {
    const valorBase = parseFloat(document.getElementById('edit_valor_base')?.value || 0);
    const ajuste = parseFloat(document.getElementById('edit_ajuste')?.value || 0);
    const valorPagado = parseFloat(document.getElementById('edit_valor_pagado')?.value || 0);
    
    const saldo = (valorBase + ajuste) - valorPagado;
    const saldoField = document.getElementById('edit_saldo_calculado');
    if (saldoField) {
        saldoField.value = formatMoney(saldo);
        saldoField.style.color = saldo > 0 ? 'red' : (saldo < 0 ? 'green' : 'black');
    }
}

// =============================
// HANDLERS
// =============================
async function handleCreateSubmit(event) {
    event.preventDefault();
    
    const id_contrato = document.getElementById('id_contrato')?.value;
    if (!id_contrato) {
        alert("Seleccione un contrato");
        return;
    }
    
    const data = {
        id_contrato: parseInt(id_contrato),
        mes: document.getElementById('mes')?.value,
        valor_base: parseFloat(document.getElementById('valor_base')?.value || 0),
        ajuste: parseFloat(document.getElementById('ajuste')?.value || 0),
        valor_pagado: parseFloat(document.getElementById('valor_pagado')?.value || 0)
    };
    
    try {
        // await PagoService.create_pago(data);
        
        // const modal = bootstrap.Modal.getInstance(document.getElementById("ModalAgregarPago"));
        // if (modal) modal.hide();
        
        // event.target.reset();
        // alert("Pago registrado exitosamente");
        // await initPago();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar pago");
    }
}

async function handleUpdateSubmit(event) {
    event.preventDefault();
    
    const id_pago = document.getElementById('edit_id_pago')?.value;
    if (!id_pago) return;
    
    const data = {
        id_contrato: parseInt(document.getElementById('edit_id_contrato')?.value),
        mes: document.getElementById('edit_mes')?.value,
        valor_base: parseFloat(document.getElementById('edit_valor_base')?.value || 0),
        ajuste: parseFloat(document.getElementById('edit_ajuste')?.value || 0),
        valor_pagado: parseFloat(document.getElementById('edit_valor_pagado')?.value || 0)
    };
    
    try {
        // await PagoService.update_pago(id_pago, data);
        
        // const modal = bootstrap.Modal.getInstance(document.getElementById("ModalEditarPago"));
        // if (modal) modal.hide();
        
        // alert("Pago actualizado exitosamente");
        await initPago();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar pago");
    }
}

async function handleDeleteSubmit(event) {
    event.preventDefault();
    
    const id_pago = document.getElementById('id_pago_eliminar')?.value;
    if (!id_pago) return;
    
    if (!confirm("¿Está seguro de eliminar este pago?")) return;
    
    try {
        // await PagoService.delete_pago(id_pago);
        
        // const modal = bootstrap.Modal.getInstance(document.getElementById("ModalEliminarPago"));
        // if (modal) modal.hide();
        
        // alert("Pago eliminado exitosamente");
        // await initPago();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar pago");
    }
}