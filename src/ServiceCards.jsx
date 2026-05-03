import React from 'react';
import './ServiceCards.css';

const ServiceCards = () => {
  return (
    <div className="service-cards-container">
      <div className="service-card gold-card">
        <h3>Cours de langue allemande — présentiel et en ligne</h3>
        <p>Maîtrisez l'allemand avec nos formateurs certifiés, en salle à Casablanca (bientôt a Tanger) ou à distance depuis partout au Maroc. Des cours adaptés à votre niveau et à vos objectifs : études, travail ou Ausbildung.</p>
        <ul>
          <li>Tous niveaux : A1, A2, B1, B2, C1</li>
          <li>Cours présentiel à Casablanca (et bientôt a Tanger)</li>
          <li>Cours en ligne (sessions live & flexibles)</li>
          <li>Préparation aux examens : Goethe, ÖSD, TestDaF</li>
          <li>Cours de langue professionels</li>
        </ul>
      </div>

      <div className="service-card silver-card">
        <h3>Conseil & Orientation</h3>
        <p>Notre équipe accompagne chaque candidat à Casablanca et dans tout le Maroc : étudiants, apprentis (Ausbildung), professionnels qualifiés (Fachkräfte) et entreprises allemandes.</p>
        <ul>
          <li>Étudiants – Choix d'université, admission, visas</li>
          <li>Apprentis (Ausbildung) – Sélection de programmes, tests linguistiques, entretien</li>
          <li>Professionnels qualifiés (Fachkräfte) – Placement, reconnaissance, permis de travail</li>
          <li>Entreprises allemandes – Recrutement de talents marocains formés et certifiés</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceCards;
