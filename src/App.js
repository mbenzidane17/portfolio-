// src/App.js
import React, { useState } from 'react';
import './App.css';
import CubeIllustration from './components/CubeIllustration';

function App() {
  const [faceIndex, setFaceIndex] = useState(0);

  const faceTexts = [
    // Face 1 – Présentation
    "Bonjour, je m'appelle Mélissa Benzidane. Étudiante en troisième année de MIASHS Économie et Gestion, parcours MIAGE, à l’université Paris Nanterre. Passionnée par l'informatique, je recherche une alternance pour mettre en pratique mes compétences en développement, data et gestion de projet.",

    // Face 2 – Projets (à venir)
    "🛠️ Projets en cours de préparation... Un lien sera bientôt disponible pour les découvrir !",

    // Face 3 – Contact
    <span>
      📄 <a href="/CV_Melissa.pdf" download className="cv-download">Télécharger mon CV</a><br />
      ✉️ <a href="mailto:melissa.benzidane@gmail.com">melissa.benzidane@gmail.com</a><br />
      📞 07 64 91 84 20
    </span>,

    // Face 4 – Compétences
    "💻 Compétences clés : SQL, Python, HTML/CSS, JavaScript, Power BI, Excel avancé, gestion de projet, rédaction fonctionnelle, communication pro."
  ];

  return (
    <div className="app-container vertical-layout">
      <div className="cube-placeholder">
        <CubeIllustration onFaceChange={setFaceIndex} />
      </div>

      <div className="text-panel">
        <div className="face-description">
          {faceTexts[faceIndex]}
        </div>
      </div>
    </div>
  );
}

export default App;