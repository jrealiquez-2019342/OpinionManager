'use strict'

import { hash, compare } from 'bcrypt';

//encriptar
export const encrypt = (password) => {
    try {
        return hash(password, 10);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//Validar password

export const checkPassword = async (password, passEncrypt) => {
    try {
        return await compare(password, passEncrypt);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//validar actualizacion

export const checkUpdate = (data, userId) => {
    if (userId) {
        if (
            Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' ||
            data.role ||
            data.role == ''
        ) return false;
        return true;
    } else {
        if (
            Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' ||
            data.role ||
            data.role == ''
        ) return false;
        return true;
    }
}