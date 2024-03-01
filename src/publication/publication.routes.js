import { Router } from 'express';
import { validateJwt, isAdmin } from './../middlewares/validate-jwt.js';
import { get, create, comment, deleteC } from './publication.controller.js';

const api = Router();

//=======================//
//Rutas privadas - Admin //
//=======================//


api.get('/get', [validateJwt], get);
api.post('/create', [validateJwt, isAdmin], create);
api.post('/comment', [validateJwt, isAdmin], comment);
api.delete('/comment/delete/:idComment', [validateJwt], deleteC);

export default api;