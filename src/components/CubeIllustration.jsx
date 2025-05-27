// src/components/CubeIllustration.jsx
import React, { useEffect, useRef, useState } from 'react';
import './CubeIllustration.css';
import plante from '../assets/plante.png';
import mail from '../assets/mail.png';
import bureau from '../assets/bureau.png';
import sphere from '../assets/sphere.png';

const faceTexts = [
  "Bonjour, je m'appelle Mélissa Benzidane. Étudiante en troisième année de MIASHS Économie et Gestion, parcours MIAGE, à l’université Paris Nanterre. Passionnée par l’informatique, je recherche une alternance pour mettre en pratique mes compétences en développement, data et gestion de projet.",
  "Mes projets seront bientôt disponibles ici. Restez connecté(e) !",
  "Contact : \n✉ melissa.benzidane@email.com\n☎ 06 00 00 00 00\n\n[Télécharger mon CV](CV_Melissa.pdf)",
  "Compétences : HTML, CSS, JavaScript, React, SQL, Power BI, Python, Git..."
];

export default function CubeIllustration() {
  const cubeRef = useRef(null);
  const [faceIndex, setFaceIndex] = useState(0);
  const rotation = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      rotation.current += 0.5;
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateY(${rotation.current}deg)`;
        const index = Math.round((rotation.current % 360) / 90) % 4;
        setFaceIndex(index);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="illustration-wrapper">
      <div className="cube" ref={cubeRef}>
        <div className="face front">
          <img src={bureau} alt="Présentation" />
        </div>
        <div className="face right">
          <img src={sphere} alt="Projets" />
        </div>
        <div className="face back">
          <img src={mail} alt="Contact" />
        </div>
        <div className="face left">
          <img src={plante} alt="Compétences" />
        </div>
      </div>
      <div className="face-text">
        <p>{faceTexts[faceIndex]}</p>
      </div>
    </div>
  );
}
