
export default function validarCampos (email: string, senha: string){
 
    console.warn('dados foram enviados?');
    console.warn(email);
    console.warn(senha);
    if (!email || !senha) {
     alert("Todos os campos são obrigatórios.");
    }

}