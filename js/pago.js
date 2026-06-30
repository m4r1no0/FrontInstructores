// js/pago.js
import { ContratoService } from './contrato.service.js';
import { PagoService } from './pago.service.js';

let pagosGlobal = [];
let dataTable = null;
let modalInstance = null;
let contratosGlobal = []; // Array para almacenar contratos globalmente

// ============================
// FUNCIONES DE CÁLCULO DE PAGO
// ============================

/**
 * Calcula el pago hasta la fecha actual
 * @param {Object} contrato - Datos del contrato
 * @param {number} valorPagado - Valor ya pagado
 * @returns {Object} Objeto con los cálculos
 */
function calcularPagoHastaHoy(contrato, valorPagado = 0) {
    // Validar que el contrato existe
    if (!contrato) {
        return {
            valorConsumido: 0,
            valorRestante: 0,
            valorPagado: 0,
            saldo: 0,
            mesesTranscurridos: 0,
            valorBaseMes: 0,
            valorContrato: 0,
            valorBase: 0
        };
    }

    const fechaInicio = contrato.fecha_inicio ? new Date(contrato.fecha_inicio) : null;
    const fechaFin = contrato.fecha_fin ? new Date(contrato.fecha_fin) : null;
    const hoy = new Date();
    
    // Validar fechas
    if (!fechaInicio || isNaN(fechaInicio.getTime())) {
        console.warn('Fecha de inicio inválida en el contrato:', contrato);
        return {
            valorConsumido: 0,
            valorRestante: contrato.valor_contrato || 0,
            valorPagado: valorPagado || 0,
            saldo: contrato.valor_contrato || 0,
            mesesTranscurridos: 0,
            valorBaseMes: contrato.valor_mes || 0,
            valorContrato: contrato.valor_contrato || 0,
            valorBase: 0
        };
    }

    // Si no hay fecha fin, usar fecha inicio + 1 año por defecto
    let fechaFinCalculo = fechaFin;
    if (!fechaFin || isNaN(fechaFin.getTime())) {
        fechaFinCalculo = new Date(fechaInicio);
        fechaFinCalculo.setFullYear(fechaFinCalculo.getFullYear() + 1);
    }

    // Calcular fecha límite (hoy o fecha fin, la que sea menor)
    const fechaLimite = hoy < fechaFinCalculo ? hoy : fechaFinCalculo;
    
    // Calcular meses transcurridos
    let mesesTranscurridos = 0;
    
    // Si la fecha de inicio es mayor a hoy, no hay consumo
    if (fechaInicio > hoy) {
        mesesTranscurridos = 0;
    } else {
        // Calcular meses completos transcurridos
        const diffTime = Math.abs(fechaLimite - fechaInicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        mesesTranscurridos = Math.floor(diffDays / 30.44); // Promedio de días por mes
        
        // Asegurar que no sea mayor al total de meses del contrato
        if (fechaFinCalculo && !isNaN(fechaFinCalculo.getTime())) {
            const totalDiffTime = Math.abs(fechaFinCalculo - fechaInicio);
            const totalDiffDays = Math.ceil(totalDiffTime / (1000 * 60 * 60 * 24));
            const totalMesesContrato = Math.floor(totalDiffDays / 30.44);
            if (mesesTranscurridos > totalMesesContrato) {
                mesesTranscurridos = totalMesesContrato;
            }
        }
    }
    
    // Valor base a pagar (meses transcurridos * valor del mes)
    const valorMes = parseFloat(contrato.valor_mes) || 0;
    const valorContrato = parseFloat(contrato.valor_contrato) || 0;
    const valorBase = mesesTranscurridos * valorMes;
    
    // Valor consumido (no puede exceder el valor del contrato)
    let valorConsumido = Math.min(valorBase, valorContrato);
    
    // Si el valor mensual es 0, usar valor del contrato
    if (valorMes === 0 && valorContrato > 0) {
        const porcentaje = Math.min(mesesTranscurridos / 12, 1);
        valorConsumido = valorContrato * porcentaje;
    }
    
    // Valor restante
    const valorRestante = Math.max(valorContrato - valorConsumido, 0);
    
    // Calcular saldo (valor a pagar - valor pagado)
    const valorPagadoNum = parseFloat(valorPagado) || 0;
    const valorAPagar = valorConsumido;
    const saldo = valorAPagar - valorPagadoNum;
    
    console.log(`📊 Cálculo para contrato ${contrato.numero_contrato || contrato.id_contrato || ''}:`, {
        mesesTranscurridos,
        valorBase,
        valorConsumido,
        valorRestante,
        valorPagado: valorPagadoNum,
        saldo
    });
    
    return {
        valorConsumido: Math.round(valorConsumido * 100) / 100,
        valorRestante: Math.round(valorRestante * 100) / 100,
        valorPagado: Math.round(valorPagadoNum * 100) / 100,
        saldo: Math.round(saldo * 100) / 100,
        mesesTranscurridos,
        valorBaseMes: valorMes,
        valorContrato: valorContrato,
        valorBase: Math.round(valorBase * 100) / 100
    };
}

// ============================
// INIT PRINCIPAL
// ============================
export async function initPago() {
    console.log("🚀 INIT PAGO");

    const tabla = document.querySelector(".cuerpoTablaPago");
    if (!tabla) {
        console.warn("⚠️ No se encontró la tabla de pagos");
        return;
    }

    try {
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Cargar contratos primero
        await cargarContratos();

        // Cargar pagos
        const response = await ContratoService.get_contratos_by_instructor();
        const pagosData = response.data || response || [];
        
        pagosGlobal = pagosData;

        console.log("Pagos procesados:", pagosGlobal.length);
        console.log("Contratos disponibles:", contratosGlobal.length);

        Swal.close();
        renderTable();
        reinicializarDataTable();
        bindEvents();
        setupFormHandler();
        setupUpdateFormHandler();
        setupDeleteFormHandler();
        setupContratoSelectListener();

    } catch (error) {
        console.error("❌ Error cargando pagos:", error);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los pagos: ' + (error.message || 'Error desconocido'),
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
        contratosGlobal = response.data || response || [];

        // Enriquecer contratos con cálculos de pago (sin usar pagosGlobal)
        const contratosEnriquecidos = contratosGlobal.map(contrato => {
            // Buscar si existe un pago para este contrato
            const pagoExistente = pagosGlobal.find(p => p.id_contrato === contrato.id_contrato);
            const valorPagado = pagoExistente ? parseFloat(pagoExistente.valor_pagado) || 0 : 0;
            
            const calculo = calcularPagoHastaHoy(contrato, valorPagado);
            
            return {
                ...contrato,
                ...calculo
            };
        });

        // Llenar select de contratos en el formulario de creación
        const selectContrato = document.getElementById('id_contrato');
        if (selectContrato) {
            selectContrato.innerHTML = '<option value="">Seleccione un contrato...</option>';
            contratosEnriquecidos.forEach(contrato => {
                const option = document.createElement('option');
                option.value = contrato.id_contrato;
                
                // Mostrar información relevante
                const saldo = contrato.saldo || 0;
                let estado = '';
                if (saldo > 0) {
                    estado = '🔴 Deuda: ' + formatMoney(saldo);
                } else if (saldo < 0) {
                    estado = '🟢 Sobrepago: ' + formatMoney(Math.abs(saldo));
                } else {
                    estado = '⚪ Al día';
                }
                
                option.textContent = `${contrato.numero_contrato || 'N/A'} - ${contrato.nombre_completo || 'Sin nombre'} | ${estado}`;
                
                // Guardar datos para cálculos
                option.dataset.valorContrato = contrato.valor_contrato || 0;
                option.dataset.valorMes = contrato.valor_mes || 0;
                option.dataset.mesesTranscurridos = contrato.mesesTranscurridos || 0;
                option.dataset.valorConsumido = contrato.valorConsumido || 0;
                option.dataset.valorRestante = contrato.valorRestante || 0;
                option.dataset.saldo = contrato.saldo || 0;
                
                selectContrato.appendChild(option);
            });
            
            // Disparar evento change para actualizar campos
            selectContrato.dispatchEvent(new Event('change'));
        }

        // Llenar select de contratos en el formulario de edición
        const selectEditContrato = document.getElementById('edit_id_contrato');
        if (selectEditContrato) {
            selectEditContrato.innerHTML = '<option value="">Seleccione un contrato...</option>';
            contratosEnriquecidos.forEach(contrato => {
                const option = document.createElement('option');
                option.value = contrato.id_contrato;
                
                const saldo = contrato.saldo || 0;
                let estado = '';
                if (saldo > 0) {
                    estado = 'Deuda: ' + formatMoney(saldo);
                } else if (saldo < 0) {
                    estado = 'Sobrepago: ' + formatMoney(Math.abs(saldo));
                } else {
                    estado = 'Al día';
                }
                
                option.textContent = `${contrato.numero_contrato || 'N/A'} - ${contrato.nombre_completo || 'Sin nombre'} | ${estado}`;
                option.dataset.valorContrato = contrato.valor_contrato || 0;
                option.dataset.valorMes = contrato.valor_mes || 0;
                option.dataset.mesesTranscurridos = contrato.mesesTranscurridos || 0;
                option.dataset.valorConsumido = contrato.valorConsumido || 0;
                option.dataset.valorRestante = contrato.valorRestante || 0;
                option.dataset.saldo = contrato.saldo || 0;
                
                selectEditContrato.appendChild(option);
            });
        }

        console.log("✅ Contratos cargados y enriquecidos:", contratosEnriquecidos.length);
        return contratosEnriquecidos;
    } catch (error) {
        console.error("❌ Error cargando contratos:", error);
        throw error;
    }
}

// ============================
// ACTUALIZAR CAMPOS AL SELECCIONAR CONTRATO
// ============================
function setupContratoSelectListener() {
    const selectContrato = document.getElementById('id_contrato');
    if (selectContrato) {
        selectContrato.removeEventListener('change', onContratoSelectChange);
        selectContrato.addEventListener('change', onContratoSelectChange);
    }
    
    const selectEditContrato = document.getElementById('edit_id_contrato');
    if (selectEditContrato) {
        selectEditContrato.removeEventListener('change', onEditContratoSelectChange);
        selectEditContrato.addEventListener('change', onEditContratoSelectChange);
    }
}

function onContratoSelectChange(e) {
    const select = e.target;
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        // Limpiar campos de información
        limpiarCamposInformacion();
        return;
    }
    
    // Mostrar información del contrato
    const valorContrato = parseFloat(selectedOption.dataset.valorContrato) || 0;
    const valorMes = parseFloat(selectedOption.dataset.valorMes) || 0;
    const mesesTranscurridos = parseInt(selectedOption.dataset.mesesTranscurridos) || 0;
    const valorConsumido = parseFloat(selectedOption.dataset.valorConsumido) || 0;
    const valorRestante = parseFloat(selectedOption.dataset.valorRestante) || 0;
    const saldo = parseFloat(selectedOption.dataset.saldo) || 0;
    
    // Establecer valor base automáticamente
    const valorBaseField = document.getElementById('valor_base');
    if (valorBaseField) {
        valorBaseField.value = valorConsumido.toFixed(2);
    }
    
    // Mostrar información adicional
    actualizarCamposInformacion(valorContrato, valorMes, mesesTranscurridos, valorConsumido, valorRestante, saldo);
    
    // Disparar cálculo de saldo
    calcularSaldo();
}

function onEditContratoSelectChange(e) {
    const select = e.target;
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        document.getElementById('edit_valor_base').value = '';
        return;
    }
    
    // Establecer valor base automáticamente en edición
    const valorConsumido = parseFloat(selectedOption.dataset.valorConsumido) || 0;
    const editValorBase = document.getElementById('edit_valor_base');
    if (editValorBase) {
        editValorBase.value = valorConsumido.toFixed(2);
    }
    
    // Disparar cálculo de saldo
    calcularSaldoEdicion();
}

function limpiarCamposInformacion() {
    const campos = ['valor_contrato_info', 'valor_mes_info', 'meses_info', 'valor_consumido_info', 'valor_restante_info', 'saldo_info'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

function actualizarCamposInformacion(valorContrato, valorMes, mesesTranscurridos, valorConsumido, valorRestante, saldo) {
    const infoContrato = document.getElementById('valor_contrato_info');
    if (infoContrato) infoContrato.textContent = formatMoney(valorContrato);
    
    const infoMes = document.getElementById('valor_mes_info');
    if (infoMes) infoMes.textContent = formatMoney(valorMes);
    
    const infoMeses = document.getElementById('meses_info');
    if (infoMeses) infoMeses.textContent = mesesTranscurridos;
    
    const infoConsumido = document.getElementById('valor_consumido_info');
    if (infoConsumido) {
        infoConsumido.textContent = formatMoney(valorConsumido);
        infoConsumido.style.color = '#0d6efd';
    }
    
    const infoRestante = document.getElementById('valor_restante_info');
    if (infoRestante) {
        infoRestante.textContent = formatMoney(valorRestante);
        infoRestante.style.color = valorRestante > 0 ? '#198754' : (valorRestante < 0 ? '#dc3545' : '#212529');
    }
    
    const infoSaldo = document.getElementById('saldo_info');
    if (infoSaldo) {
        infoSaldo.textContent = formatMoney(saldo);
        infoSaldo.style.color = saldo > 0 ? '#dc3545' : (saldo < 0 ? '#198754' : '#212529');
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
        saldoField.style.color = saldo > 0 ? '#dc3545' : (saldo < 0 ? '#198754' : '#212529');
    }
    
    // Actualizar información de valor restante si está disponible
    const selectContrato = document.getElementById('id_contrato');
    if (selectContrato && selectContrato.selectedIndex > 0) {
        const selectedOption = selectContrato.options[selectContrato.selectedIndex];
        const valorContrato = parseFloat(selectedOption.dataset.valorContrato) || 0;
        const valorRestante = valorContrato - valorAPagar;
        
        const infoRestante = document.getElementById('valor_restante_info');
        if (infoRestante) {
            infoRestante.textContent = formatMoney(valorRestante);
            infoRestante.style.color = valorRestante > 0 ? '#198754' : (valorRestante < 0 ? '#dc3545' : '#212529');
        }
        
        const infoSaldo = document.getElementById('saldo_info');
        if (infoSaldo) {
            infoSaldo.textContent = formatMoney(saldo);
            infoSaldo.style.color = saldo > 0 ? '#dc3545' : (saldo < 0 ? '#198754' : '#212529');
        }
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
        saldoField.style.color = saldo > 0 ? '#dc3545' : (saldo < 0 ? '#198754' : '#212529');
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

    if (!pagosGlobal || !pagosGlobal.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 12;
        cell.className = 'text-center';
        cell.textContent = 'No hay pagos disponibles';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    pagosGlobal.forEach(pago => {
        const row = document.createElement('tr');
        
        // Calcular información de pago
        const contrato = contratosGlobal.find(c => c.id_contrato === pago.id_contrato) || {};
        const calculo = calcularPagoHastaHoy({
            fecha_inicio: pago.fecha_inicio || contrato.fecha_inicio,
            fecha_fin: pago.fecha_fin || contrato.fecha_fin,
            valor_mes: pago.valor_mes || contrato.valor_mes,
            valor_contrato: pago.valor_contrato || contrato.valor_contrato,
            numero_contrato: pago.numero_contrato || contrato.numero_contrato,
            id_contrato: pago.id_contrato || contrato.id_contrato
        }, pago.valor_pagado || 0);
        
        const saldoClass = calculo.saldo > 0 ? 'text-danger' : (calculo.saldo < 0 ? 'text-success' : '');

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
        cellNumeroContrato.textContent = pago.numero_contrato || contrato.numero_contrato || '';
        row.appendChild(cellNumeroContrato);

        // Columna NOMBRE COMPLETO
        const cellNombre = document.createElement('td');
        cellNombre.textContent = pago.nombre_completo || contrato.nombre_completo || '';
        row.appendChild(cellNombre);

        // Columna FECHA INICIO
        const cellFechaInicio = document.createElement('td');
        cellFechaInicio.textContent = formatDate(pago.fecha_inicio || contrato.fecha_inicio);
        row.appendChild(cellFechaInicio);

        // Columna VALOR MES
        const cellValorMes = document.createElement('td');
        cellValorMes.className = 'text-end';
        cellValorMes.textContent = formatMoney(pago.valor_mes || contrato.valor_mes);
        row.appendChild(cellValorMes);

        // Columna VALOR CONTRATO
        const cellValorContrato = document.createElement('td');
        cellValorContrato.className = 'text-end';
        cellValorContrato.textContent = formatMoney(pago.valor_contrato || contrato.valor_contrato);
        row.appendChild(cellValorContrato);

        // Columna VALOR CONSUMIDO (nuevo)
        const cellValorConsumido = document.createElement('td');
        cellValorConsumido.className = 'text-end text-primary';
        cellValorConsumido.textContent = formatMoney(calculo.valorConsumido);
        row.appendChild(cellValorConsumido);

        // Columna MESES TRANSCURRIDOS (nuevo)
        const cellMeses = document.createElement('td');
        cellMeses.className = 'text-center';
        cellMeses.textContent = calculo.mesesTranscurridos;
        row.appendChild(cellMeses);

        // Columna VALOR PAGADO
        const cellValorPagado = document.createElement('td');
        cellValorPagado.className = 'text-end';
        cellValorPagado.textContent = formatMoney(pago.valor_pagado || 0);
        row.appendChild(cellValorPagado);

        // Columna SALDO
        const cellSaldo = document.createElement('td');
        cellSaldo.className = `text-end ${saldoClass}`;
        cellSaldo.textContent = formatMoney(calculo.saldo);
        cellSaldo.dataset.saldo = calculo.saldo;
        row.appendChild(cellSaldo);

        // Columna VALOR RESTANTE (nuevo)
        const cellValorRestante = document.createElement('td');
        cellValorRestante.className = 'text-end';
        cellValorRestante.textContent = formatMoney(calculo.valorRestante);
        row.appendChild(cellValorRestante);

        // Columna FECHA FIN
        const cellFechaFin = document.createElement('td');
        cellFechaFin.textContent = formatDate(pago.fecha_fin || contrato.fecha_fin);
        row.appendChild(cellFechaFin);

        // Columna VIGENCIA
        const cellVigencia = document.createElement('td');
        cellVigencia.textContent = formatDate(pago.vigencia || contrato.vigencia);
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
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                }
            },
            {
                extend: 'copy',
                text: '<i class="bi bi-files"></i> Copiar',
                className: 'btn btn-secondary btn-sm',
                title: 'Pagos',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
        const idPago = edit.dataset.idPago || edit.getAttribute('data-id-pago');
        if (idPago) openEditModal(idPago);
        return;
    }

    const del = e.target.closest(".btn-eliminar-pago");
    if (del) {
        const idPago = del.dataset.idPago || del.getAttribute('data-id-pago');
        if (idPago) abrirModalEliminar(idPago);
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
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-CO');
    } catch {
        return 'Fecha inválida';
    }
}

function formatMoney(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0';
    const numero = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numero)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numero);
}

// Exportar funciones para uso externo si es necesario
export { calcularPagoHastaHoy, formatMoney, formatDate };