const TypeBien = require('../models/typeBien.model');
const pool = require('../db/pool');

class TypeBienService {
  async createTypeBien(typeBienData) {
    return TypeBien.create(typeBienData);
  }

  async getAllTypeBiens(userId = null, userRole = null) {
    return TypeBien.getAll(userId, userRole);
  }

  async getTypeBienById(id) {
    return TypeBien.getById(id);
  }

  async updateTypeBien(id, typeBienData) {
    return TypeBien.update(id, typeBienData);
  }

  async deleteTypeBien(id) {
    return TypeBien.delete(id);
  }
}

module.exports = new TypeBienService();
