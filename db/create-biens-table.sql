-- =====================================================
-- CRÉATION COMPLÈTE DE LA TABLE BIENS
-- =====================================================

-- Supprimer la table si elle existe (ATTENTION: cela supprime toutes les données)
-- DROP TABLE IF EXISTS biens CASCADE;

-- Créer l'extension pour les UUID si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer la table biens complète
CREATE TABLE IF NOT EXISTS biens (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informations de base (obligatoires)
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    
    -- Informations optionnelles
    adresse TEXT,
    description TEXT,
    
    -- Coordonnées GPS (optionnelles)
    latitude DECIMAL(10, 8),  -- Précision: 8 décimales après la virgule
    longitude DECIMAL(11, 8), -- Précision: 8 décimales après la virgule
    
    -- Horaires d'ouverture (optionnels)
    horaire_ouverture TIME,
    horaire_fermeture TIME,
    jours_ouverture VARCHAR(50) DEFAULT 'Lundi-Dimanche',
    
    -- Timestamps automatiques
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_biens_type ON biens(type);
CREATE INDEX IF NOT EXISTS idx_biens_nom ON biens(nom);
CREATE INDEX IF NOT EXISTS idx_biens_gps ON biens(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Ajouter des contraintes de validation
ALTER TABLE biens ADD CONSTRAINT IF NOT EXISTS chk_latitude 
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE biens ADD CONSTRAINT IF NOT EXISTS chk_longitude 
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_biens_updated_at ON biens;
CREATE TRIGGER update_biens_updated_at
    BEFORE UPDATE ON biens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vérifier la structure créée
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'biens'
ORDER BY ordinal_position;