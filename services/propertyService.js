const Property = require('../models/property.model');

class PropertyService {
  static async createProperty(propertyData) {
    // Validation des données
    if (!propertyData.nom || !propertyData.type) {
      throw new Error('Le nom et le type du bien sont obligatoires');
    }

    // Validation des coordonnées GPS si fournies
    if (propertyData.latitude && (propertyData.latitude < -90 || propertyData.latitude > 90)) {
      throw new Error('La latitude doit être comprise entre -90 et 90');
    }
    
    if (propertyData.longitude && (propertyData.longitude < -180 || propertyData.longitude > 180)) {
      throw new Error('La longitude doit être comprise entre -180 et 180');
    }

    // Validation des horaires
    if (propertyData.horaire_ouverture && propertyData.horaire_fermeture) {
      const ouverture = new Date(`1970-01-01T${propertyData.horaire_ouverture}:00`);
      const fermeture = new Date(`1970-01-01T${propertyData.horaire_fermeture}:00`);
      
      if (ouverture >= fermeture) {
        throw new Error('L\'heure d\'ouverture doit être antérieure à l\'heure de fermeture');
      }
    }

    return await Property.create(propertyData);
  }

  static async getAllProperties() {
    return await Property.getAll();
  }

  static async getPropertyById(id) {
    if (!id) {
      throw new Error('ID du bien requis');
    }
    
    const property = await Property.getById(id);
    if (!property) {
      throw new Error('Bien non trouvé');
    }
    
    return property;
  }

  static async updateProperty(id, propertyData) {
    if (!id) {
      throw new Error('ID du bien requis');
    }

    // Vérifier que le bien existe
    const existingProperty = await Property.getById(id);
    if (!existingProperty) {
      throw new Error('Bien non trouvé');
    }

    // Validation des données (même que pour la création)
    if (propertyData.latitude && (propertyData.latitude < -90 || propertyData.latitude > 90)) {
      throw new Error('La latitude doit être comprise entre -90 et 90');
    }
    
    if (propertyData.longitude && (propertyData.longitude < -180 || propertyData.longitude > 180)) {
      throw new Error('La longitude doit être comprise entre -180 et 180');
    }

    if (propertyData.horaire_ouverture && propertyData.horaire_fermeture) {
      const ouverture = new Date(`1970-01-01T${propertyData.horaire_ouverture}:00`);
      const fermeture = new Date(`1970-01-01T${propertyData.horaire_fermeture}:00`);
      
      if (ouverture >= fermeture) {
        throw new Error('L\'heure d\'ouverture doit être antérieure à l\'heure de fermeture');
      }
    }

    return await Property.update(id, propertyData);
  }

  static async deleteProperty(id) {
    if (!id) {
      throw new Error('ID du bien requis');
    }

    const property = await Property.getById(id);
    if (!property) {
      throw new Error('Bien non trouvé');
    }

    return await Property.delete(id);
  }

  static async getPropertiesByType(type) {
    const allProperties = await Property.getAll();
    return allProperties.filter(property => 
      property.type.toLowerCase().includes(type.toLowerCase())
    );
  }

  static async searchProperties(searchTerm) {
    const allProperties = await Property.getAll();
    return allProperties.filter(property => 
      property.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.adresse && property.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
}

module.exports = PropertyService;