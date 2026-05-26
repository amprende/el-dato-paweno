document.addEventListener('DOMContentLoaded', () => {
  const logoImg = document.getElementById('animated-logo');
  if (!logoImg) return;

  const totalFrames = 240;
  const pixelsPerCycle = 1200; // Un bucle completo de la animación cada 1200px de scroll
  
  // Precargar las imágenes para evitar parpadeos
  const preloadedImages = [];
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `img/logo_frames/frame_${i}.png`;
    preloadedImages.push(img);
  }

  let lastScrollY = window.scrollY;
  let currentFrame = 1;

  function updateLogo() {
    const scrollY = window.scrollY;
    
    let frameIndex = 1;
    
    if (scrollY >= pixelsPerCycle) {
      // Si ya pasó el primer ciclo de scroll, se congela en el fotograma 1
      frameIndex = 1;
    } else {
      // Si está en el primer ciclo, avanza la animación de forma lineal (sin módulo)
      const progress = scrollY / pixelsPerCycle;
      frameIndex = Math.floor(progress * totalFrames) + 1;
    }
    
    // Asegurarse de que esté en los límites
    if (frameIndex > totalFrames) frameIndex = totalFrames;
    if (frameIndex < 1) frameIndex = 1;

    // Solo actualiza el DOM si el fotograma cambió
    if (frameIndex !== currentFrame) {
      currentFrame = frameIndex;
      logoImg.src = `img/logo_frames/frame_${currentFrame}.png`;
    }
  }

  // Usamos un listener pasivo para mejor rendimiento y requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateLogo();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Llamada inicial para establecer el fotograma correcto si la página carga con scroll previo
  updateLogo();
});
