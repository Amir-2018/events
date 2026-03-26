-- =====================================================
-- MIGRATION: Ajouter les colonnes GPS aux biens existants
-- =====================================================

-- Ajouter les colonnes GPS si elles n'existent pas
DO $$
BEGIN
    -- Ajouter latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE biens ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Colonne latitude ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne latitude existe déjà dans la table biens';
    END IF;

    -- Ajouter longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE biens ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Colonne longitude ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne longitude existe déjà dans la table biens';
    END IF;

    -- Ajouter horaire_ouverture
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'horaire_ouverture'
    ) THEN
        ALTER TABLE biens ADD COLUMN horaire_ouverture TIME;
        RAISE NOTICE 'Colonne horaire_ouverture ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne horaire_ouverture existe déjà dans la table biens';
    END IF;

    -- Ajouter horaire_fermeture
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'horaire_fermeture'
    ) THEN
        ALTER TABLE biens ADD COLUMN horaire_fermeture TIME;
        RAISE NOTICE 'Colonne horaire_fermeture ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne horaire_fermeture existe déjà dans la table biens';
    END IF;

    -- Ajouter jours_ouverture
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'jours_ouverture'
    ) THEN
        ALTER TABLE biens ADD COLUMN jours_ouverture VARCHAR(50) DEFAULT 'Lundi-Dimanche';
        RAISE NOTICE 'Colonne jours_ouverture ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne jours_ouverture existe déjà dans la table biens';
    END IF;

    -- Ajouter description si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE biens ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne description existe déjà dans la table biens';
    END IF;

    -- Ajouter adresse si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'biens' 
        AND column_name = 'adresse'
    ) THEN
        ALTER TABLE biens ADD COLUMN adresse TEXT;
        RAISE NOTICE 'Colonne adresse ajoutée à la table biens';
    ELSE
        RAISE NOTICE 'Colonne adresse existe déjà dans la table biens';
    END IF;
END $$;

-- Vérification finale - afficher la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'biens'
ORDER BY ordinal_position;