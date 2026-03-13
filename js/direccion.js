import { DireccionService } from "./direccion.service.js";

export async function initDireccion(){
    // const tabla = document.querySelector(".cuerpoTabla");

    try{
        const response = await DireccionService.get_all_direcciones()

        console.log(response)

    }catch{
        console.log('error')
    }

    
}
