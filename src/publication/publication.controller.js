'use strict'

import Publication from './publication.model.js';
import Category from './../category/category.model.js';

//test
export const test = (req, res) => {
    try {

    } catch (err) {
        console.error(err);
    }
}

//obtener las publicaciones
export const get = async (req, res) => {
    try {
        let feed = await Publication.find().populate({
            path: 'user',
            select: '-_id username comment -_id'
        }).populate({
            path: 'category',
            select: '-_id name'
        }).populate({
            path: 'comments',
            select: '-_id'
        }).populate({
            path: 'comments.user',
            select: '-_id username'
        }).populate({
            path: 'comments.comment',
            select: '-_id comment'
        });
        return res.send({ feed });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting publications | get` });
    }
}

//crear una publicacion
export const create = async (req, res) => {
    try {

        //recuperamos el id del usuario logeado
        let user = req.user;
        let idUser = user._id;

        //llamamos la data
        let data = req.body;

        //validamos que los campos base vayan en la data.
        if (
            !data.title ||
            !data.comment
        ) return res.status(400).send({ message: `Missing data | some data is required` });

        //si el usuario no ingresa la categoria de la publicacion le asignamos a default
        if (!data.category) {
            let { _id } = await Category.findOne({ name: 'Default' });
            console.log('category > ' + _id);
            data.category = _id;
        }

        //le pasamos el id del usuario logeado para postear la publicacion
        console.log(idUser);
        data.user = idUser;

        let publication = new Publication(data);
        await publication.save();
        return res.send({ message: `post uploaded successfully.` })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error creating a publication | Create` });
    }
}

//comentar a publicaciones
export const comment = async (req, res) => {
    try {

        //obtenemos el id de la persona
        let { _id } = req.user;

        //obtenemos el comentarios y el id de la publicacion
        let { comment, postId } = req.body;

        if (!comment || !postId) return res.status(400).send({ message: `Comment and post id is required.` })

        //buscar la publicación por su ID
        let publication = await Publication.findById(postId);

        //creamos el comentario para realizar push
        let newComment = {
            user: _id,
            comment
        }

        //agregamos un nuevo comentario al array
        publication.comments.push(newComment);

        //guardar la publicación actualizada
        let updatedPublication = await publication.save();

        return res.send({ updatedPublication });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error commenting.` });
    }
}

//editar comentario
export const updateC = async (req, res) => {
    try {
        //extrare el id del comentario
        let { idComment } = req.params;

        //extraer la data para editar el comentario
        let { comment: newComment } = req.body;

        //buscamos la publicacion que tiene el comentario y el usuario correspondiente
        let publication = await Publication.findOneAndUpdate(
            {
                'comments._id': idComment,
                'comments.user': req.user._id
            },
            //actualizamos en caso fue encontrado
            { $set: { 'comments.$.comment': newComment } },
            { new: true }
        );

        if (!publication) return res.status(404).send({ message: 'Comment not found or unauthorized' });

        return res.send({ message: 'Comment updated successfully', publication });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error updating comment | updateC` });
    }
}

//eliminar comentario

export const deleteC = async (req, res) => {
    try {
        //traer el id del comentario a eliminar
        let { idComment } = req.params;

        let user = req.user;

        //buscamos la publicacion que tiene el comentario y el usuario correspondiente
        let publication = await Publication.findOne({
            'comments._id': idComment,
            'comments.user': user._id
        });

        //validar si el comentario pertenece a la persona logeada para eliminarlo
        if (!publication) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // buscamos y actualizamos la publicacion con el comentario a eliminar
        let updatedPublication = await Publication.findOneAndUpdate(
            { 'comments._id': idComment }, //buscamos la publicacion que tiene el comentario
            { $pull: { comments: { _id: idComment } } }, //eliminamos el comentario del array
            { new: true }
        ).populate('comments.user', 'username');

        if (!updatedPublication) return res.status(400).send({ message: `Comment not found | deleteC` });
        return res.send({ updatedPublication });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting comment | deleteC` });
    }
}

//eliminar publicacion

export const deleteP = async (req, res) => {
    try {

        //extraemos el id de la publicacion
        let { idPublication } = req.params;

        //extraemos el usuario del token
        let user = req.user;

        //buscamos si existe la publicacion y la eliminamos
        let publication = await Publication.findOneAndDelete({
            _id: idPublication,
            user: user._id// Agregar condición para el ID del usuario de la publicación
        });

        //validamos si se elimino la publicacion
        if (!publication) return res.status(400).send({ message: `Publication not deleted | deleteP` });

        return res.send({ message: `Publication deleted successfully...` })

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting publication | deleteP` });

    }
}