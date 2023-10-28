import mongoose from 'mongoose';

import  crudMethods from './crudMethods.js';

export default function crudController(modelName){
  const Model = mongoose.model(modelName);
  let methods = {};

  methods.create = async (req, res) => {
    crudMethods.createMethod(Model, req, res);
  };

  methods.read = async (req, res) => {
    crudMethods.readMethod(Model, req, res);
  };

  methods.update = async (req, res) => {
    crudMethods.updateMethod(Model, req, res);
  };

  methods.delete = async (req, res) => {
    crudMethods.deleteMethod(Model, req, res);
  };

  methods.list = async (req, res) => {
    crudMethods.listMethod(Model, req, res);
  };

  methods.search = async (req, res) => {
    crudMethods.searchMethod(Model, req, res);
  };

  return methods;
};