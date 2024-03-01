'use strict'

import User from './user.model.js';
import { checkPassword, encrypt, checkUpdate } from './../../utils/validator.js';
import { generateJwt } from './../../utils/jwt.js';


//Funcion para realizar test
export const test = (req, res) => {
    console.log('user test is running...');
    return res.send({ message: `User test is running...` })
}


//Funcion para registrar administradores
export const register = async (req, res) => {
    try {
        let data = req.body;

        //validar que no haya un user existente
        let findUser = await User.findOne({ username: data.user });
        if (findUser) return res.status(409).send({ message: `Username already exists.` });
        //validar que el correo no este en uso
        let findEmail = await User.findOne({ email: data.email });
        if (findEmail) return res.status(409).send({ message: `Email already in use.` })

        //encriptar la contrasenia
        data.password = await encrypt(data.password);

        //si el no ingreso role, le asignamos uno por defecto
        data.role = 'ADMIN';

        //creamos nuestro usuario
        let user = new User(data);
        //guardamos en mongo
        await user.save();
        //respondemos al usuario
        return res.send({ message: `Registered successfully. \nCan be logged with username ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error registering user. | `, err: err.errors })
    }
}


//Funcion para logearse con usuario o correo (clientes y administradores)
export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) return res.status(404).send({ message: `Invalid credentials.` })

        //validar si esta activo para dar acceso

        if (await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }

            //generar el token y enviarlo como respuesta.
            let authorization = await generateJwt(loggedUser);
            return res.send({
                message: `WELCOME ${user.username}`,
                loggedUser,
                authorization
            })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error login | login` });
    }
}

//Funcion para modificar el usuario
export const update = async (req, res) => {
    try {
        //extraer valores de req.user
        let { _id } = req.user;
        //extraer datos a actualizar
        let data = req.body;

        //validar si trae datos y si se pueden modificar.
        if (!checkUpdate(data, false)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });

        //actualizar
        let updatedUser = await User.findOneAndUpdate(
            { _id },
            data,
            { new: true }
        )

        //validar que se haya actualizado
        if (!updatedUser) return res.status(401).send({ message: `User not found and not updated.` });

        //respuesta al usuario
        return res.send({ message: `Update user`, updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error updating profile.` })
    }
}

/*
    FUNCION PARA ELIMINAR USUARIO
    unicamente es un cambio de status
*/

export const deleteU = async (req, res) => {
    try {

        let {password} = req.body;
        let user = req.user;

        if(!password) return res.status(401).send({message:`password is required.`})

        if (await checkPassword(password, user.password)){
            await User.findOneAndDelete({_id: user._id})
            return res.send({message:`@${user.username} deleted successfully...`})
        }else{
            return res.status(401).send({message:`Incorrect password`})
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting account.` });
    }
}

/* ADMIN AL ARRANCAR EL PROYECTO */
//funcion para crear un administrador por defecto.
export const createAdmin = async () => {
    try {
        let user = await User.findOne({ username: 'jnoj' });
        if (!user) {
            console.log('Creando admin...')
            let admin = new User({
                name: 'Josue',
                surname: 'Noj',
                username: 'jnoj',
                password: '12345',
                email: 'jnoj@kinal.org.gt',
                phone: '87654321',
                role: 'ADMIN'
            });
            admin.password = await encrypt(admin.password);
            await admin.save();
            return console.log({ message: `Registered successfully. \nCan be logged with username ${admin.username} and pass 12345` })
        }
        console.log({ message: `Can be logged with username ${user.username} and password 12345` });

    } catch (err) {
        console.error(err);
        return err;
    }
}