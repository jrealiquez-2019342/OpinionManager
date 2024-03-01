import { Router } from 'express';
import { validateJwt, isAdmin } from './../middlewares/validate-jwt.js';
import { get, create, comment, deleteC, deleteP, updateC } from './publication.controller.js';

const api = Router();

//=======================//
//Rutas privadas - Admin //
//=======================//


api.get('/get', [validateJwt], get);
api.post('/create', [validateJwt, isAdmin], create);
api.post('/comment', [validateJwt, isAdmin], comment);
api.delete('/comment/delete/:idComment', [validateJwt], deleteC);
api.delete('/delete/:idPublication', [validateJwt], deleteP);
api.put('/comment/update/:idComment', [validateJwt], updateC);

export default api;