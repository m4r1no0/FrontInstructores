// js/pago.js
import { ContratoService } from './contrato.service.js';
import { PagoService } from './pago.service.js';

let pagosGlobal = [];
let dataTable = null;
let modalInstance = null;

// ============================
// INIT PRINCIPAL
// ============================
export async function initPago() {
    console.log("🚀 INIT PAGO");

    const tabla = document.querySelector(".cuerpoTablaPago");
    if (!tabla) return;

    try {
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Cargar contratos para el selector
        await cargarContratos();

        const response = await ContratoService.get_contratos_by_instructor();
        const pagosData = response.data || response || [];
        
        pagosGlobal = pagosData;

        console.log("Pagos procesados:", pagosGlobal);
        console.log("Cantidad de pagos:", pagosGlobal.length);

        Swal.close();
        renderTable();
        reinicializarDataTable();
        bindEvents();
        setupFormHandler();
        setupUpdateFormHandler();
        setupDeleteFormHandler();

    } catch (error) {
        console.error("❌ Error cargando pagos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los pagos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// CARGAR CONTRATOS PARA SELECTOR
// ============================
async function cargarContratos() {
    try {
        const response = await ContratoService.get_contratos_by_instructor();
        const contratos = response.data || response || [];

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

// ============================
// CALCULAR SALDO
// ============================
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

function calcularSaldoEdicion() {
    const valorBase = parseFloat(document.getElementById('edit_valor_base')?.value || 0);
    const ajuste = parseFloat(document.getElementById('edit_ajuste')?.value || 0);
    const valorPagado = parseFloat(document.getElementById('edit_valor_pagado')?.value || 0);
    
    const valorAPagar = valorBase + ajuste;
    const saldo = valorAPagar - valorPagado;
    
    const saldoField = document.getElementById('edit_saldo_calculado');
    if (saldoField) {
        saldoField.value = formatMoney(saldo);
        saldoField.style.color = saldo > 0 ? 'red' : (saldo < 0 ? 'green' : 'black');
    }
}

// ============================
// RENDER TABLA (SIN INNERHTML)
// ============================
function renderTable() {
    const tbody = document.querySelector(".cuerpoTablaPago");
    if (!tbody) return;

    // Limpiar tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (!pagosGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 10;
        cell.className = 'text-center';
        cell.textContent = 'No hay pagos disponibles';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    pagosGlobal.forEach(pago => {
        const row = document.createElement('tr');
        const saldoClass = pago.saldo > 0 ? 'text-danger' : (pago.saldo < 0 ? 'text-success' : '');

        // Columna ACCIONES
        const cellAcciones = document.createElement('td');
        cellAcciones.className = 'text-center';
        
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-warning btn-sm btn-editar-pago me-1';
        btnEditar.setAttribute('data-bs-toggle', 'modal');
        btnEditar.setAttribute('data-bs-target', '#ModalEditarPago');
        btnEditar.setAttribute('data-id-pago', pago.id_pago);
        btnEditar.innerHTML = '<i class="bi bi-pencil-square"></i>';
        cellAcciones.appendChild(btnEditar);
        
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger btn-sm btn-eliminar-pago';
        btnEliminar.setAttribute('data-bs-toggle', 'modal');
        btnEliminar.setAttribute('data-bs-target', '#ModalEliminarPago');
        btnEliminar.setAttribute('data-id-pago', pago.id_pago);
        btnEliminar.innerHTML = '<i class="bi bi-trash-fill"></i>';
        cellAcciones.appendChild(btnEliminar);
        
        row.appendChild(cellAcciones);

        // Columna NÚMERO CONTRATO
        const cellNumeroContrato = document.createElement('td');
        cellNumeroContrato.textContent = pago.numero_contrato || '';
        row.appendChild(cellNumeroContrato);

        // Columna NOMBRE COMPLETO
        const cellNombre = document.createElement('td');
        cellNombre.textContent = pago.nombre_completo || '';
        row.appendChild(cellNombre);

        // Columna FECHA INICIO
        const cellFechaInicio = document.createElement('td');
        cellFechaInicio.textContent = pago.fecha_inicio || '';
        row.appendChild(cellFechaInicio);

        // Columna VALOR MES
        const cellValorMes = document.createElement('td');
        cellValorMes.className = 'text-end';
        cellValorMes.textContent = formatMoney(pago.valor_mes);
        row.appendChild(cellValorMes);

        // Columna VALOR CONTRATO
        const cellValorContrato = document.createElement('td');
        cellValorContrato.className = 'text-end';
        cellValorContrato.textContent = formatMoney(pago.valor_contrato);
        row.appendChild(cellValorContrato);

        // Columna VALOR PAGADO
        const cellValorPagado = document.createElement('td');
        cellValorPagado.className = 'text-end';
        cellValorPagado.textContent = formatMoney(pago.valor_pagado);
        row.appendChild(cellValorPagado);

        // Columna SALDO
        const cellSaldo = document.createElement('td');
        cellSaldo.className = `text-end ${saldoClass}`;
        cellSaldo.textContent = formatMoney(pago.valorAdDi);
        row.appendChild(cellSaldo);

        // Columna FECHA FIN
        const cellFechaFin = document.createElement('td');
        cellFechaFin.textContent = formatDate(pago.fecha_fin);
        row.appendChild(cellFechaFin);

        // Columna VIGENCIA
        const cellVigencia = document.createElement('td');
        cellVigencia.textContent = formatDate(pago.vigencia);
        row.appendChild(cellVigencia);

        tbody.appendChild(row);
    });
}

// ============================
// DATATABLE CON BOTONES
// ============================
function reinicializarDataTable() {
    const table = $('#dataTablePago');
    if (!table.length) return;

    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    dataTable = table.DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'excel',
                text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                className: 'btn btn-success btn-sm',
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    format: {
                        body: function (data, type, row, meta) {
                            return data.replace(/<[^>]*>/g, '').trim();
                        }
                    }
                }
            },
            {
                extend: 'pdf',
                text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                className: 'btn btn-danger btn-sm',
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    format: {
                        body: function (data, type, row, meta) {
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
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    format: {
                        body: function (data, type, row, meta) {
                            return data.replace(/<[^>]*>/g, '').trim();
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                className: 'btn btn-info btn-sm',
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                }
            },
            {
                extend: 'copy',
                text: '<i class="bi bi-files"></i> Copiar',
                className: 'btn btn-secondary btn-sm',
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    format: {
                        body: function (data, type, row, meta) {
                            return data.replace(/<[^>]*>/g, '').trim();
                        }
                    }
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
}

// ============================
// EVENTOS
// ============================
function bindEvents() {
    const tabla = document.querySelector(".cuerpoTablaPago");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);
}

function handleClick(e) {
    const edit = e.target.closest(".btn-editar-pago");
    if (edit) {
        openEditModal(edit.dataset.idPago);
        return;
    }

    const del = e.target.closest(".btn-eliminar-pago");
    if (del) {
        abrirModalEliminar(del.dataset.idPago);
        return;
    }
}

// ============================
// MODAL ELIMINAR
// ============================
function abrirModalEliminar(idPago) {
    document.getElementById('id_pago_eliminar').value = idPago;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("ModalEliminarPago")).show();
}

// ============================
// FORMULARIOS
// ============================
function setupFormHandler() {
    const formCrear = document.getElementById('formPago');
    if (formCrear) {
        formCrear.removeEventListener('submit', handleCreateSubmit);
        formCrear.addEventListener('submit', handleCreateSubmit);
        
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
    const formActualizar = document.getElementById('formEditarPago');
    if (formActualizar) {
        formActualizar.removeEventListener('submit', handleUpdateSubmit);
        formActualizar.addEventListener('submit', handleUpdateSubmit);
        
        ['edit_valor_base', 'edit_ajuste', 'edit_valor_pagado'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeEventListener('input', calcularSaldoEdicion);
                input.addEventListener('input', calcularSaldoEdicion);
            }
        });
    }
}

function setupDeleteFormHandler() {
    const formEliminar = document.getElementById('formEliminarPago');
    if (formEliminar) {
        formEliminar.removeEventListener('submit', handleDeleteSubmit);
        formEliminar.addEventListener('submit', handleDeleteSubmit);
    }
}

// ============================
// OPEN EDIT MODAL
// ============================
async function openEditModal(id) {
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
        Swal.fire('Error', 'ID de pago inválido', 'error');
        return;
    }
    
    const modalElement = document.getElementById('ModalEditarPago');
    if (!modalElement) {
        Swal.fire('Error', 'No se encontró el modal de edición', 'error');
        return;
    }

    modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo datos del pago',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await PagoService.get_pago_by_id(idNumber);
        const pago = response?.data ?? response;
        
        document.getElementById('edit_id_pago').value = pago.id_pago;
        document.getElementById('edit_id_contrato').value = pago.id_contrato;
        document.getElementById('edit_mes').value = pago.mes;
        document.getElementById('edit_valor_base').value = pago.valor_base;
        document.getElementById('edit_ajuste').value = pago.ajuste;
        document.getElementById('edit_valor_pagado').value = pago.valor_pagado;
        
        calcularSaldoEdicion();

        Swal.close();
        modalInstance.show();
        
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'No se pudo cargar el pago', 'error');
    }
}

// ============================
// HANDLE CREATE
// ============================
async function handleCreateSubmit(event) {
    event.preventDefault();

    const id_contrato = document.getElementById('id_contrato')?.value;
    
    if (!id_contrato) {
        Swal.fire('Error', 'Seleccione un contrato', 'error');
        return;
    }

    const data = {
        id_contrato: parseInt(id_contrato),
        mes: document.getElementById('mes')?.value,
        valor_base: parseFloat(document.getElementById('valor_base')?.value || 0),
        ajuste: parseFloat(document.getElementById('ajuste')?.value || 0),
        valor_pagado: parseFloat(document.getElementById('valor_pagado')?.value || 0)
    };

    Swal.fire({
        title: 'Guardando...',
        text: 'Creando pago',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await PagoService.create_pago(data);

        const modalElement = document.getElementById("ModalAgregarPago");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        event.target.reset();
        await recargar();

        Swal.fire({
            title: '¡Creado!',
            text: 'Pago registrado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al crear pago:", error);
        Swal.fire('Error', error.message || 'No se pudo crear el pago', 'error');
    }
}

// ============================
// HANDLE UPDATE
// ============================
async function handleUpdateSubmit(event) {
    event.preventDefault();

    const id_pago = document.getElementById('edit_id_pago')?.value;
    
    if (!id_pago) {
        Swal.fire('Error', 'ID de pago no encontrado', 'error');
        return;
    }

    const data = {
        id_contrato: parseInt(document.getElementById('edit_id_contrato')?.value),
        mes: document.getElementById('edit_mes')?.value,
        valor_base: parseFloat(document.getElementById('edit_valor_base')?.value || 0),
        ajuste: parseFloat(document.getElementById('edit_ajuste')?.value || 0),
        valor_pagado: parseFloat(document.getElementById('edit_valor_pagado')?.value || 0)
    };

    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Está seguro de actualizar este pago?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Actualizando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await PagoService.update_pago(id_pago, data);
        
        if (modalInstance) {
            modalInstance.hide();
            setTimeout(() => {
                if (modalInstance) {
                    modalInstance.dispose();
                    modalInstance = null;
                }
            }, 300);
        }
        
        await recargar();
        
        Swal.fire({
            title: '¡Actualizado!',
            text: 'Pago actualizado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error:", error);
        if (modalInstance) modalInstance.hide();
        Swal.fire('Error', error.message || 'No se pudo actualizar el pago', 'error');
    }
}

// ============================
// HANDLE DELETE
// ============================
async function handleDeleteSubmit(event) {
    event.preventDefault();

    const id_pago = document.getElementById('id_pago_eliminar')?.value;
    
    if (!id_pago) {
        Swal.fire('Error', 'ID de pago no encontrado', 'error');
        return;
    }

    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await PagoService.delete_pago(id_pago);

        const modalElement = document.getElementById("ModalEliminarPago");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        await recargar();

        Swal.fire({
            title: '¡Eliminado!',
            text: 'Pago eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al eliminar pago:", error);
        Swal.fire('Error', error.message || 'No se pudo eliminar el pago', 'error');
    }
}

// ============================
// RECARGAR
// ============================
async function recargar() {
    console.log("🔄 Recargando tabla de pagos...");

    try {
        Swal.fire({
            title: 'Recargando...',
            text: 'Actualizando tabla de pagos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await ContratoService.get_contratos_by_instructor();
        pagosGlobal = response.data || response || [];

        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        const tbody = document.querySelector(".cuerpoTablaPago");
        if (tbody) {
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }
        }

        renderTable();
        reinicializarDataTable();

        Swal.close();
        console.log(`✅ Tabla recargada exitosamente. Total registros: ${pagosGlobal.length}`);

    } catch (error) {
        console.error("❌ Error recargando pagos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron recargar los datos',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    }
}

// ============================
// FUNCIONES DE UTILIDAD
// ============================
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