import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const faceData = [
  {
    id: 'presentation',
    title: 'Présentation',
    content: "Bonjour, je m'appelle Mélissa Benzidane. Étudiante en troisième année de MIASHS Économie et Gestion, parcours MIAGE, à l'université Paris Nanterre. Passionnée par l'informatique, je recherche une alternance pour mettre en pratique mes compétences en développement, data et gestion de projet.",
    color: new THREE.Color(0xff6b9d),
    icon: '🎓'
  },
  {
    id: 'projects',
    title: 'Projets',
    content: "Mes projets sont en cours de développement ! Bientôt disponibles : une application de gestion de tâches en React, une analyse de données avec Python, et d'autres projets passionnants.",
    color: new THREE.Color(0x4ecdc4),
    icon: '💻'
  },
  {
    id: 'contact',
    title: 'Contact',
    content: "melissa.benzidane@gmail.com\n07 64 91 84 20\n\nCV disponible au téléchargement",
    color: new THREE.Color(0x45b7d1),
    icon: '📧'
  },
  {
    id: 'skills',
    title: 'Compétences',
    content: "HTML/CSS, JavaScript, React, Python\nSQL, Power BI, Excel avancé\nGestion de projet, communication\nToujours en apprentissage !",
    color: new THREE.Color(0x96ceb4),
    icon: '🚀'
  }
];

function EpicThreeDScene({ onFaceChange }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cubeRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetCameraRef = useRef({ x: 0, y: 0, z: 8 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup avec brouillard atmosphérique
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);
    sceneRef.current = scene;

    // Camera avec FOV dynamique
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer avec post-processing
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ===== CUBE PRINCIPAL AVEC MATÉRIAUX AVANCÉS =====
    const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
    
    // Matériaux avec des effets visuels pour chaque face
    const materials = faceData.map((face, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      // Fond avec dégradé radial
      const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
      gradient.addColorStop(0, `#${face.color.getHexString()}`);
      gradient.addColorStop(0.7, `#${face.color.getHexString()}80`);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Effet de grille hexagonale
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 1024; x += 60) {
        for (let y = 0; y < 1024; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Icône principale
      ctx.font = 'bold 200px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(face.icon, 512, 400);
      
      // Titre avec effet de glow
      ctx.shadowColor = `#${face.color.getHexString()}`;
      ctx.shadowBlur = 20;
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(face.title, 512, 600);
      
      // Bordure lumineuse
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `#${face.color.getHexString()}`;
      ctx.lineWidth = 8;
      ctx.strokeRect(50, 50, 924, 924);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      
      return new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: face.color,
        emissiveIntensity: 0.2
      });
    });

    // Ajouter les matériaux pour toutes les faces
    while (materials.length < 6) {
      materials.push(materials[materials.length - 1].clone());
    }

    const cube = new THREE.Mesh(cubeGeometry, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    cubeRef.current = cube;

    // ===== SYSTÈME DE PARTICULES MULTIPLES =====
    
    // 1. Particules d'étoiles
    const createStarField = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const starsVertices = [];
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        starsVertices.push(x, y, z);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      return stars;
    };

    // 2. Particules flottantes colorées
    const createFloatingParticles = () => {
      const particles = [];
      
      for (let i = 0; i < 200; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: faceData[i % faceData.length].color,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30
        );
        
        // Propriétés d'animation personnalisées
        particle.userData = {
          originalPosition: particle.position.clone(),
          speed: Math.random() * 0.02 + 0.01,
          amplitude: Math.random() * 2 + 1,
          phase: Math.random() * Math.PI * 2
        };
        
        scene.add(particle);
        particles.push(particle);
      }
      
      return particles;
    };

    // 3. Anneaux d'énergie autour du cube
    const createEnergyRings = () => {
      const rings = [];
      
      for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(5 + i * 1.5, 0.1, 8, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: faceData[i % faceData.length].color,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ring.userData = { rotationSpeed: (Math.random() + 0.5) * 0.01 };
        
        scene.add(ring);
        rings.push(ring);
      }
      
      return rings;
    };

    const stars = createStarField();
    const floatingParticles = createFloatingParticles();
    const energyRings = createEnergyRings();
    
    particleSystemsRef.current = { stars, floatingParticles, energyRings };

    // ===== ÉCLAIRAGE DYNAMIQUE =====
    
    // Lumière ambiante douce
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Lumières directionnelles colorées qui bougent
    const lights = [];
    const lightColors = [0xff6b9d, 0x4ecdc4, 0x45b7d1, 0x96ceb4];
    
    lightColors.forEach((color, index) => {
      const light = new THREE.DirectionalLight(color, 0.8);
      const angle = (index / lightColors.length) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 10,
        Math.sin(angle) * 5,
        5
      );
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);
      lights.push({ light, angle, originalAngle: angle });
    });

    // ===== INTERACTIONS SOURIS AVANCÉES =====
    const handleMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Caméra suit la souris avec parallaxe
      targetCameraRef.current.x = mouseRef.current.x * 2;
      targetCameraRef.current.y = mouseRef.current.y * 2;
      targetCameraRef.current.z = 8 - Math.abs(mouseRef.current.x) * 2;
    };

    const handleMouseClick = () => {
      // Effet de pulse sur le cube
      const scale = 1.2;
      cube.scale.set(scale, scale, scale);
      setTimeout(() => {
        cube.scale.set(1, 1, 1);
      }, 200);
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);
    mountRef.current.addEventListener('click', handleMouseClick);

    // ===== BOUCLE D'ANIMATION PRINCIPALE =====
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Animation du cube principal
      if (cubeRef.current) {
        cubeRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
        cubeRef.current.rotation.y += 0.008;
        cubeRef.current.rotation.z = Math.cos(time * 0.2) * 0.05;
        
        // Léger mouvement vertical
        cubeRef.current.position.y = Math.sin(time * 0.5) * 0.3;
        
        // Déterminer la face visible
        const faceIndex = Math.floor(((cubeRef.current.rotation.y % (Math.PI * 2)) / (Math.PI * 2)) * 4);
        onFaceChange(faceIndex);
      }

      // Animation de la caméra (mouvement fluide)
      camera.position.x += (targetCameraRef.current.x - camera.position.x) * 0.05;
      camera.position.y += (targetCameraRef.current.y - camera.position.y) * 0.05;
      camera.position.z += (targetCameraRef.current.z - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      // Animation des particules flottantes
      floatingParticles.forEach((particle, index) => {
        const userData = particle.userData;
        particle.position.y = userData.originalPosition.y + 
          Math.sin(time * userData.speed + userData.phase) * userData.amplitude;
        particle.position.x = userData.originalPosition.x + 
          Math.cos(time * userData.speed * 0.7 + userData.phase) * userData.amplitude * 0.5;
        particle.rotation.x += 0.02;
        particle.rotation.y += 0.015;
        
        // Pulsation d'opacité
        particle.material.opacity = 0.4 + Math.sin(time * 2 + index) * 0.3;
      });

      // Animation des anneaux d'énergie
      energyRings.forEach((ring, index) => {
        ring.rotation.x += ring.userData.rotationSpeed;
        ring.rotation.z += ring.userData.rotationSpeed * 0.5;
        
        // Changement de couleur cyclique
        const colorIndex = Math.floor(time + index) % faceData.length;
        ring.material.color = faceData[colorIndex].color;
      });

      // Animation des étoiles (rotation lente)
      if (stars) {
        stars.rotation.x += 0.0005;
        stars.rotation.y += 0.001;
      }

      // Animation des lumières
      lights.forEach((lightData, index) => {
        const { light, originalAngle } = lightData;
        const newAngle = originalAngle + time * 0.2;
        light.position.x = Math.cos(newAngle) * 12;
        light.position.z = Math.sin(newAngle) * 12;
        light.position.y = Math.sin(time + index) * 3;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ===== GESTION DU REDIMENSIONNEMENT =====
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // ===== NETTOYAGE =====
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
        mountRef.current.removeEventListener('click', handleMouseClick);
      }
      
      // Dispose des ressources Three.js
      cubeGeometry.dispose();
      materials.forEach(material => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
      
      floatingParticles.forEach(particle => {
        particle.geometry.dispose();
        particle.material.dispose();
      });
      
      energyRings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      
      if (stars) {
        stars.geometry.dispose();
        stars.material.dispose();
      }
      
      renderer.dispose();
    };
  }, [onFaceChange]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-pointer"
      style={{ minHeight: '600px', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)' }}
    />
  );
}

export default function EpicPortfolio() {
  const [currentFace, setCurrentFace] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulation de chargement pour l'effet
    setTimeout(() => setIsLoaded(true), 1000);
  }, []);

  const handleFaceChange = (faceIndex) => {
    setCurrentFace(faceIndex);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-white text-xl">Chargement de l'expérience 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Header avec effet de typing */}
      <header className="relative z-10 text-center py-8 px-4">
        <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4 animate-pulse">
          MÉLISSA BENZIDANE
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4">
          ✨ Étudiante MIASHS • Développeuse 3D • Future experte en tech ✨
        </p>
        <div className="text-sm text-cyan-400 animate-bounce">
          🎮 Clique et déplace ta souris pour explorer l'univers !
        </div>
      </header>

      <div className="relative grid lg:grid-cols-5 gap-8 px-4 max-w-7xl mx-auto">
        
        {/* Zone 3D - Plus grande */}
        <div className="lg:col-span-3 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <EpicThreeDScene onFaceChange={handleFaceChange} />
            
            {/* Overlay d'information */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs text-gray-300 mb-1">Face active:</div>
              <div className="text-sm font-bold text-white">
                {faceData[currentFace].icon} {faceData[currentFace].title}
              </div>
            </div>
          </div>
        </div>

        {/* Panel d'information - Plus stylé */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-8 border border-gray-800 relative overflow-hidden"
          >
            {/* Effet de néon sur le bord */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{ 
                boxShadow: `inset 0 0 20px ${faceData[currentFace].color.getHexString()}`
              }}
            ></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4 animate-bounce">{faceData[currentFace].icon}</span>
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: `#${faceData[currentFace].color.getHexString()}` }}
                >
                  {faceData[currentFace].title}
                </h2>
              </div>
              
              <div className="text-gray-300 leading-relaxed">
                {currentFace === 2 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 hover:text-cyan-400 transition-colors">
                      <span className="text-lg">✉️</span>
                      <a href="mailto:melissa.benzidane@gmail.com">
                        melissa.benzidane@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📞</span>
                      <span>07 64 91 84 20</span>
                    </div>
                    <div className="pt-4">
                      <a 
                        href="/CV_Melissa.pdf" 
                        download 
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:scale-105"
                      >
                        📄 Télécharger CV
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line">{faceData[currentFace].content}</p>
                )}
              </div>
            </div>
          </div>

          {/* Indicateurs avec style futuriste */}
          <div className="flex justify-center space-x-4">
            {faceData.map((face, index) => (
              <div
                key={face.id}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  currentFace === index
                    ? 'scale-125 shadow-lg'
                    : 'opacity-50 hover:opacity-75 hover:scale-110'
                }`}
                style={{ 
                  backgroundColor: currentFace === index ? `#${face.color.getHexString()}` : '#374151',
                  boxShadow: currentFace === index ? `0 0 20px #${face.color.getHexString()}50` : 'none'
                }}
                onClick={() => setCurrentFace(index)}
              >
                <span className="text-lg">{face.icon}</span>
                {currentFace === index && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer avec style cyber */}
      <footer className="text-center py-12 relative z-10">
        <div className="text-gray-500 text-sm">
          <div className="mb-2">⚡ Portfolio réalisé avec Three.js & React ⚡</div>
          <div className="text-xs opacity-75">Version 3D Épique • Optimisé pour l'expérience</div>
        </div>
      </footer>
    </div>
  );
}