import { Router } from 'express';
import { validateJwt, isAdmin } from './../middlewares/validate-jwt.js';
import { create } from './publication.controller.js';

const api = Router();

//=======================//
//Rutas privadas - Admin //
//=======================//


api.post('/create', [validateJwt, isAdmin], create);

export default api;