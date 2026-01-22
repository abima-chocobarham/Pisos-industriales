document.addEventListener('DOMContentLoaded', () => {
    /* --- MENÚ MÓVIL --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            // Alternar clases para abrir/cerrar
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    /* --- STICKY HEADER --- */
    const header = document.querySelector('.main-header');
    const body = document.body;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
            body.classList.add('sticky-active');
        } else {
            header.classList.remove('sticky');
            body.classList.remove('sticky-active');
        }
    });

    /* --- SCROLL ANIMATIONS (REVEAL) --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animación solo una vez
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Se activa cuando el 15% del elemento es visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* --- FORMULARIO AJAX --- */
    const form = document.querySelector('.form-contact');
    const statusMsg = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault(); // Evita la recarga de la página

            const data = new FormData(event.target);

            // Mostrar estado "Enviando..."
            statusMsg.innerHTML = "Enviando...";
            statusMsg.className = "form-status-msg"; // Reset clases
            statusMsg.style.opacity = '1';

            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    statusMsg.innerHTML = "¡Gracias! Tu mensaje ha sido enviado con éxito.";
                    statusMsg.classList.add('success');
                    form.reset(); // Limpiar formulario
                } else {
                    statusMsg.innerHTML = "Hubo un problema al enviar. Intenta de nuevo.";
                    statusMsg.classList.add('error');

                    /* Si Formspree devuelve errores específicos en JSON, podríamos mostrarlos:
                    const errorData = await response.json();
                    if (errorData.errors) console.error(errorData.errors); */
                }
            } catch (error) {
                statusMsg.innerHTML = "Error de conexión. Verifica tu internet.";
                statusMsg.classList.add('error');
                console.error('Error:', error);
            }

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                statusMsg.style.opacity = '0';
            }, 5000);
        });
    }

    /* --- CARRUSEL DE GALERÍA --- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselWrapper = document.querySelector('.gallery-carousel-wrapper');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    let currentSlideIndex = 0;
    let visibleSlides = [];
    let autoplayInterval;

    // Función para obtener slides visibles según filtro activo
    function getVisibleSlides() {
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

        visibleSlides = Array.from(carouselSlides).filter(slide => {
            const category = slide.getAttribute('data-category');
            return filterValue === 'all' || category === filterValue;
        });

        return visibleSlides;
    }

    // Función para crear indicadores
    function createIndicators() {
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';
        visibleSlides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    // Función para mostrar slide específico
    function showSlide(index) {
        // Ocultar todos los slides
        carouselSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Mostrar solo el slide actual
        if (visibleSlides[index]) {
            visibleSlides[index].classList.add('active');
        }

        // Actualizar indicadores
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    // Navegar al slide específico
    function goToSlide(index) {
        currentSlideIndex = index;
        showSlide(currentSlideIndex);
        resetAutoplay();
    }

    // Slide anterior
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + visibleSlides.length) % visibleSlides.length;
        showSlide(currentSlideIndex);
        resetAutoplay();
    }

    // Slide siguiente
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % visibleSlides.length;
        showSlide(currentSlideIndex);
        resetAutoplay();
    }

    // Inicializar carrusel
    function initCarousel() {
        getVisibleSlides();
        currentSlideIndex = 0;
        createIndicators();
        showSlide(currentSlideIndex);
    }

    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Event listeners para botones de navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Filtros
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover clase active de todos los botones
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar clase active al botón clickeado
                button.classList.add('active');

                // Reinicializar carrusel con nuevo filtro
                initCarousel();
                resetAutoplay();
            });
        });
    }

    // Soporte táctil para móvil
    if (carouselWrapper) {
        let touchStartX = 0;
        let touchEndX = 0;

        carouselWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                nextSlide(); // Swipe izquierda
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                prevSlide(); // Swipe derecha
            }
        }

        // Pausar autoplay cuando el mouse está sobre el carrusel
        carouselWrapper.addEventListener('mouseenter', stopAutoplay);
        carouselWrapper.addEventListener('mouseleave', startAutoplay);
    }

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Inicializar y comenzar autoplay
    if (carouselSlides.length > 0) {
        initCarousel();
        startAutoplay();
    }

    /* --- LIGHTBOX --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const lightboxPrevBtn = document.querySelector('.lightbox-prev');
    const lightboxNextBtn = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let visibleImages = [];

    // Función para actualizar las imágenes visibles
    // function updateVisibleImages() {
    //     visibleImages = Array.from(document.querySelectorAll('.carousel-slide.active img'));
    // }

    // Abrir lightbox al hacer clic en una imagen (deshabilitado para carrusel)
    // Las imágenes ahora se muestran en el carrusel directamente
    /*
    if (carouselSlides.length > 0) {
        carouselSlides.forEach((item, index) => {
            item.addEventListener('click', () => {
                updateVisibleImages();
                const img = item.querySelector('img');
                const imgIndex = visibleImages.indexOf(img);

                if (imgIndex !== -1) {
                    openLightbox(imgIndex);
                }
            });
        });
    }
    */

    function openLightbox(index) {
        currentImageIndex = index;
        lightbox.classList.add('active');
        updateLightboxImage();
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }

    function updateLightboxImage() {
        if (visibleImages.length > 0) {
            const img = visibleImages[currentImageIndex];
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;

            // Obtener caption del overlay
            const overlay = img.parentElement.querySelector('.gallery-overlay');
            if (overlay) {
                const title = overlay.querySelector('h4').textContent;
                const location = overlay.querySelector('p').textContent;
                lightboxCaption.textContent = `${title} - ${location}`;
            }
        }
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        updateLightboxImage();
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        updateLightboxImage();
    }

    // Event listeners para lightbox
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', showNextImage);
    }

    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', showPrevImage);
    }

    // Cerrar lightbox al hacer clic fuera de la imagen
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });

    /* --- TOGGLE DE MODO OSCURO --- */
    const themeToggle = document.querySelector('.theme-toggle');

    // Detectar preferencia guardada o usar el valor del sistema
    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Detectar preferencia del sistema
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Aplicar tema
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // Aplicar tema inicial
    setTheme(getPreferredTheme());

    // Event listener para el toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    /* --- FAQ ACORDEONES --- */
    const faqQuestions = document.querySelectorAll('.faq-question');

    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const answer = faqItem.querySelector('.faq-answer');
                const isExpanded = question.getAttribute('aria-expanded') === 'true';

                // Cerrar todos los demás acordeones (opcional: comentar si quieres mantener múltiples abiertos)
                faqQuestions.forEach(q => {
                    if (q !== question) {
                        q.setAttribute('aria-expanded', 'false');
                        q.parentElement.querySelector('.faq-answer').classList.remove('active');
                    }
                });

                // Toggle del acordeón actual
                if (isExpanded) {
                    question.setAttribute('aria-expanded', 'false');
                    answer.classList.remove('active');
                } else {
                    question.setAttribute('aria-expanded', 'true');
                    answer.classList.add('active');
                }
            });
        });
    }
});
