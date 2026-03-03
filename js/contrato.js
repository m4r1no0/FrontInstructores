
import { ContratoService } from "./contrato.service.js";

export async function initContrato(){
    
    try{
    const contratos = await ContratoService.get_all_contratos();
    }catch (error){
        console.log(error)
    }
}