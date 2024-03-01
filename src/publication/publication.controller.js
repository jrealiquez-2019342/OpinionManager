'use strict'

import Publication from './publication.model.js';
import Category from './../category/category.model.js';

//test
export const test = (req, res)=>{
    try {
        
    } catch (err) {
        console.error(err);
    }
}

//crear una publicacion
export const create =  async(req, res)=>{
    try {
        
        //recuperamos el id del usuario logeado
        let user = req.user;
        let idUser = user._id;

        //llamamos la data
        let data = req.body;

        //validamos que los campos base vayan en la data.
        if(
            !data.title ||
            !data.comment
        )return res.status(400).send({message:`Missing data | some data is required`});

        //si el usuario no ingresa la categoria de la publicacion le asignamos a default
        if(!data.category){
            let {_id} = await Category.findOne({name: 'Default'});
            console.log('category > '+ _id);
            data.category = _id;
        }

        //le pasamos el id del usuario logeado para postear la publicacion
        console.log(idUser);
        data.user = idUser;

        let publication = new Publication(data);
        await publication.save();
        return res.send({message:`post uploaded successfully.`})
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: `Error creating a publication | Create`});
    }
}