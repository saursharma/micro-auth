'use strict';

const bcrypt = require('bcrypt');
const boom = require('boom');
const joi = require('joi');

const logger = require('../logger');
const userModel = require('../../models/user');

const loginSchema = joi
  .object({
    username: joi.string().required(),
    password: joi.string().required(),
  })
  .required();

async function run(req, res, next) {
  const login = joi.attempt(req.body, loginSchema);
  const { isAuthorized, uid } = await authorize(login);
  if (!isAuthorized) {
    throw boom.unauthorized('Invalid username or password.');
  }
  res.status(200).send({ uid });
}

async function authorize({ username, password }) {
  const users = await userModel.getUsers({ username, is_active: true });

  let isAuthorized = false;
  let uid = null;
  if (users.length === 1) {
    const [user] = users;
    isAuthorized = await bcrypt.compare(password, user.password);
    ({ uid } = user);
  }
  return { isAuthorized, uid };
}

module.exports = run;
