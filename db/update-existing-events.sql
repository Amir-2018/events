-- =====================================================
-- SCRIPT POUR METTRE À JOUR LES ÉVÉNEMENTS EXISTANTS
-- =====================================================

-- Ce script associe automatiquement des types et des biens aux événements existants
-- basé sur des mots-clés dans le nom de l'événement

-- 1. MISE À JOUR PAR MOTS-CLÉS DANS LE NOM
-- =========================================

-- Événements musicaux -> Type "Concert" + Salle appropriée
UPDATE events 
SET 
    type_evenement_id = (SELECT id FROM types_evenements WHERE nom = 'Concert' LIMIT 1),
    bien_id = (SELECT id FROM biens WHERE type IN ('Salle', 'Théâtre') ORDER BY RANDOM() LIMIT 1)
WHERE (
    nom ILIKE '%concert%' OR 
    nom ILIKE '%musique%' OR 
    nom ILIKE '%jazz%' OR 
    nom ILIKE '%rock%' OR 
    nom ILIKE '%classique%' OR
    nom ILIKE '%opéra%' OR
    nom ILIKE '%symphonie%'
) AND type_evenement_id IS NULL;

-- Événements de conférence -> Type "Conférence" + Auditorium/Salle
UPDATE events 
SET 
    type_evenement_id = (SELECT id FROM types_evenements WHERE nom = 'Conférence' LIMIT 1),
    bien_id = (SELECT id FROM biens WHERE type IN ('Auditorium', 'Salle') ORDER BY RANDOM() LIMIT 1)
WHERE (
    nom ILIKE '%conférence%' OR 
    nom ILIKE '%présentation%' OR 
    nom ILIKE '%séminaire%' OR 
    nom ILIKE '%colloque%' OR
    nom ILIKE '%symposium%'
) AND type_evenement_id IS NULL;

-- Événements de formation -> Type "Formation" + Salle/École
UPDATE events 
SET 
    type_evenement_id = (SELECT id FROM types_evenements WHERE nom = 'Formation' LIMIT 1),
    bien_id = (SELECT id FROM biens WHERE type IN ('École', 'Salle', 'Centre communautaire') ORDER BY RANDOM() LIMIT 1)
WHERE (
    nom ILIKE '%formation%' OR 
    nom ILIKE '%atelier%' OR 
    nom ILIKE '%cours%' OR 
    nom ILIKE '%apprentissage%' OR
    nom ILIKE '%workshop%'
) AND type_evenement_id IS NULL;

-- Événements festifs -> Type "Festival" + Parc/Salle
UPDATE events 
SET 
    type_evenement_id = (SELECT id FROM types_evenements WHERE nom = 'Festival' LIMIT 1),
    bien_id = (SELECT id FROM biens WHERE type IN ('Parc', 'Salle') ORDER BY RANDOM() LIMIT 1)
WHERE (
    nom ILIKE '%festival%' OR 
    nom ILIKE '%fête%' OR 
    nom ILIKE '%célébration%' OR 
    nom ILIKE '%carnaval%' OR
    nom ILIKE '%kermesse%'
) AND type_evenement_id IS NULL;

-- Événements sportifs -> Type "Compétition" + Stade/Gymnase
UPDATE events 
SET 
    type_evenement_id = (SELECT id FROM types_evenements WHERE nom = 'Compétition' LIMIT 1),
    bien_id = (SELECT id FROM biens WHERE type IN ('Stade', 'Gymnase') ORDER BY RANDOM() LIMIT 1)
WHERE (
    nom ILIKE '%championnat%' OR 
    nom ILIKE '%compétition%' OR 
    nom ILIKE '%match%' OR 
    nom ILIKE '%sport%' OR
    nom ILIKE '%tournoi%' OR
    nom ILIKE '%course%'
) AND type_evenement_id IS NULL;

-- 2. MISE À JOUR PAR ADRESSE
-- ==========================

-- Si l'adresse contient certains mots-clés, associer le bien correspondant
UPDATE events 
SET bien_id = b.id
FROM biens b
WHERE events.adresse IS NOT NULL 
AND events.bien_id IS NULL
AND (
    events.adresse ILIKE '%' || b.adresse || '%' OR
    b.adresse ILIKE '%' || events.adresse || '%'
);

-- 3. ATTRIBUTION ALÉATOIRE POUR LES ÉVÉNEMENTS SANS TYPE
-- =======================================================

-- Attribuer un type aléatoire aux événements qui n'en ont pas
UPDATE events 
SET type_evenement_id = (
    SELECT id FROM types_evenements 
    ORDER BY RANDOM() 
    LIMIT 1
)
WHERE type_evenement_id IS NULL;

-- Attribuer un bien aléatoire aux événements qui n'en ont pas
UPDATE events 
SET bien_id = (
    SELECT id FROM biens 
    ORDER BY RANDOM() 
    LIMIT 1
)
WHERE bien_id IS NULL;

-- 4. REQUÊTES DE VÉRIFICATION
-- ===========================

-- Compter les événements par type
SELECT 
    COALESCE(te.nom, 'Sans type') as type_evenement,
    COUNT(*) as nombre_evenements
FROM events e
LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
GROUP BY te.nom
ORDER BY nombre_evenements DESC;

-- Compter les événements par bien
SELECT 
    COALESCE(b.nom, 'Sans bien') as bien,
    b.type as type_bien,
    COUNT(*) as nombre_evenements
FROM events e
LEFT JOIN biens b ON e.bien_id = b.id
GROUP BY b.nom, b.type
ORDER BY nombre_evenements DESC;

-- Afficher les événements mis à jour
SELECT 
    e.nom as evenement,
    e.date,
    te.nom as type_evenement,
    b.nom as bien,
    b.type as type_bien
FROM events e
LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
LEFT JOIN biens b ON e.bien_id = b.id
ORDER BY e.date DESC
LIMIT 20;

-- 5. NETTOYAGE (OPTIONNEL)
-- ========================

-- Supprimer les associations pour recommencer (décommentez si nécessaire)
-- UPDATE events SET type_evenement_id = NULL, bien_id = NULL;

-- Réinitialiser seulement les types
-- UPDATE events SET type_evenement_id = NULL;

-- Réinitialiser seulement les biens
-- UPDATE events SET bien_id = NULL;