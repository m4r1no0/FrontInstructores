import { DireccionService } from './direccion.service.js';

let direccionesGlobal = [];
let dataTable = null;

// ============================
// INIT PRINCIPAL
// ============================
export async function initDireccion() {
    console.log("🚀 INIT DIRECCION");

    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    try {
        const response = await DireccionService.get_all_direcciones();

        direccionesGlobal = response?.data ?? response ?? [];

        renderTable();
        reinicializarDataTable();
        bindEvents();

    } catch (error) {
        console.error("❌ Error cargando direcciones:", error);
    }
}

// ============================
// RENDER TABLA
// ============================
function renderTable() {
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    tabla.innerHTML = "";

    if (!direccionesGlobal.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No hay direcciones disponibles
                </td>
            </tr>`;
        return;
    }

    direccionesGlobal.forEach(dir => {

        const tieneDireccion = dir.id_direccion && dir.id_direccion !== 0;

        tabla.innerHTML += `
        <tr>
            <td>${dir.nombre || dir.instructor_nombre || '-'}</td>
            <td>${dir.municipio || '-'}</td>
            <td>${dir.complemento || '-'}</td>
            <td>${dir.telefono || '-'}</td>
            <td>${dir.correo_personal || '-'}</td>
            <td>
                ${!tieneDireccion ? `
                    <button class="btn btn-success btn-sm btn-agregar"
                        data-id="${dir.id_instructor}">
                        Agregar
                    </button>
                ` : `
                    <button class="btn btn-warning btn-sm botonActualizar"
                        data-id="${dir.id_direccion}">
                        Editar
                    </button>

                    <button class="btn btn-danger btn-sm botonEliminar"
                        data-id="${dir.id_direccion}">
                        Eliminar
                    </button>
                `}
            </td>
        </tr>`;
    });
}

// ============================
// DATATABLE (SAFE)
// ============================
function reinicializarDataTable() {

    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    const table = $('#dataTableDireccion');
    if (!table.length) return;

    dataTable = table.DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        language: {
            lengthMenu: 'Mostrar _MENU_ registros',
            zeroRecords: 'Sin resultados',
            search: 'Buscar:',
            paginate: {
                first: 'Primero',
                last: 'Último',
                next: '>',
                previous: '<'
            }
        }
    });
}

// ============================
// EVENTS
// ============================
function bindEvents() {
    const tabla = document.querySelector(".cuerpoTablaDireccion");
    if (!tabla) return;

    tabla.removeEventListener("click", handleClick);
    tabla.addEventListener("click", handleClick);

    const form = document.getElementById("formAgregarDireccion");
    if (form) {
        form.removeEventListener("submit", handleCreate);
        form.addEventListener("submit", handleCreate);
    }
}

// ============================
// CLICK TABLE
// ============================
function handleClick(e) {

    const add = e.target.closest(".btn-agregar");
    if (add) {
        abrirModalAgregar(add.dataset.id);
        return;
    }

    const edit = e.target.closest(".botonActualizar");
    if (edit) {
        console.log("EDIT:", edit.dataset.id);
        return;
    }

    const del = e.target.closest(".botonEliminar");
    if (del) {
        console.log("DELETE:", del.dataset.id);
        return;
    }
}

// ============================
// MODAL AGREGAR
// ============================
function abrirModalAgregar(idInstructor) {

    document.getElementById("id_instructor_agregar").value = idInstructor;

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("ModalAgregarDireccion")
    ).show();
}

// ============================
// CREATE
// ============================
async function handleCreate(event) {
    event.preventDefault();

    const data = {
        id_instructor: Number(document.getElementById("id_instructor_agregar").value),
        municipio: document.getElementById("municipio_agregar").value.trim(),
        complemento: document.getElementById("complemento_agregar").value.trim()
    };

    if (!data.id_instructor || !data.municipio) {
        alert("Faltan campos obligatorios");
        return;
    }

    try {
        await DireccionService.create_direccion(data);

        bootstrap.Modal.getInstance(
            document.getElementById("ModalAgregarDireccion")
        )?.hide();

        await recargar();

        alert("Dirección creada");

    } catch (err) {
        console.error(err);
        alert("Error creando dirección");
    }
}

// ============================
// RELOAD (CLAVE)
// ============================
async function recargar() {

    try {
        const response = await DireccionService.get_all_direcciones();

        direccionesGlobal = response?.data ?? response ?? [];

        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }

        renderTable();
        reinicializarDataTable();

    } catch (error) {
        console.error("❌ Error recargando direcciones:", error);
    }
}