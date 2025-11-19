export function validaEmail(email){
    const emailStr = String(email).toLowerCase();

    const re = /^[a-zA-Z0-9._+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (re.test(emailStr)) {
        return { eValido: true, erros: [] };
    } else {
        return { eValido: false, erros: ["Formato de e-mail inválido."] };
    }
}

export function validaCpf(cpf){
    let Soma = 0
    let Resto

    let strCPF = String(cpf).replace(/[^\d]/g, '')
    
    if (strCPF.length !== 11){
        return { eValido: false, erros: ["O CPF deve ter 11 dígitos."] };
    }
    
    if ([
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
        ].includes(strCPF)){
        return { eValido: false, erros: ["CPF inválido."] };
    }

    for (let i=1; i<=9; i++)
        Soma = Soma + Number.parseInt(strCPF.substring(i-1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11)) 
        Resto = 0

    if (Resto != Number.parseInt(strCPF.substring(9, 10)) ){
        return { eValido: false, erros: ["CPF inválido."] };
    }

    Soma = 0

    for (let i = 1; i <= 10; i++)
        Soma = Soma + Number.parseInt(strCPF.substring(i-1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11)) 
        Resto = 0

    if (Resto != Number.parseInt(strCPF.substring(10, 11) ) ){
        return { eValido: false, erros: ["CPF inválido."] };
    }

    return { eValido: true, erros: [] };
}

export function validaSenha(senha){
    let strSenha = String(senha)
    const erros = [];
    const tamanhoMinimo = 8;

    if (!strSenha || strSenha.length < tamanhoMinimo) {
        erros.push(`A senha deve ter no mínimo ${tamanhoMinimo} caracteres.`);
    }

    if (!/[a-z]/.test(strSenha)) {
        erros.push("A senha deve conter pelo menos uma letra minúscula.");
    }

    if (!/[A-Z]/.test(strSenha)) {
        erros.push("A senha deve conter pelo menos uma letra maiúscula.");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(strSenha)) {
        erros.push("A senha deve conter pelo menos um caractere especial.");
    }

    return {
        eValido: erros.length === 0,
        erros: erros
    };
}