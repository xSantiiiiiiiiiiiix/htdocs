window.addEventListener("load", () => {
    initSections();
    initLogo();
    initPanels();
    initPreloader();
    initThemeSwitch();
    initFileInput();
    initMenuToggle();
    initFormPedido();
});

function initSections() {
    const sections = document.querySelectorAll('section');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });
}

function initLogo() {
    const logo = document.querySelector(".preloader-logo img");
    if (!logo) return;
    setTimeout(() => {
        logo.style.opacity = 1;
    }, 200);
}

function initPanels() {
    setTimeout(() => {
        togglePanelVisibility(".panel.left", "-100%");
        togglePanelVisibility(".panel.right", "100%");
    }, 600);
}

function togglePanelVisibility(selector, translateValue) {
    const panel = document.querySelector(selector);
    if (!panel) return;
    panel.style.transform = `translateX(${translateValue})`;
}

function initPreloader() {
    setTimeout(() => {
        const preloader = document.getElementById("preloader");
        if (!preloader) return;
        
        preloader.style.opacity = 0;
        preloader.style.transition = "opacity 0.3s ease";
        document.body.classList.remove("preloader-active");

        setTimeout(() => {
            preloader.style.display = "none";
        }, 300);
    }, 1200);
}

function initThemeSwitch() {
    const themeSwitch = document.getElementById("theme-switch");
    if (!themeSwitch) return;

    const body = document.body;
    const darkMode = localStorage.getItem("dark-mode");

    if (darkMode === "enabled") {
        body.classList.add("dark");
    }

    themeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");
        localStorage.setItem("dark-mode", body.classList.contains("dark") ? "enabled" : "disabled");
    });
}

function initFileInput() {
    const input = document.getElementById('archivo');
    const fileName = document.getElementById('file-name');
    if (!input || !fileName) return;

    input.addEventListener('change', () => {
        updateFileName(input, fileName);
    });
}

function updateFileName(input, fileName) {
    fileName.textContent = input.files.length > 0 ? input.files[0].name : 'Ningún archivo seleccionado';
}

function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!menuToggle || !mobileNav) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.mobile-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    initHeaderObserver();
    initSectionObserver();
});

function initHeaderObserver() {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    if (!nav || !header) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            nav.classList.toggle('fixed', !entry.isIntersecting);
        },
        {
            threshold: 0,
            rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`
        }
    );

    observer.observe(header);
}

function initSectionObserver() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.7
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}


function initFormPedido() {
    const formPedido = document.getElementById('form-pedido');
    if (!formPedido) return;

    formPedido.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email')?.value || '';
        const descripcion = document.getElementById('descripcion')?.value || '';
        const material = document.getElementById('material')?.value || '';
        const color = document.getElementById('color')?.value || '';
        const ancho = document.getElementById('ancho')?.value || '';
        const alto = document.getElementById('alto')?.value || '';
        const profundidad = document.getElementById('profundidad')?.value || '';

        const asunto = encodeURIComponent("Nuevo pedido de impresión 3D");
        const cuerpo = encodeURIComponent(
            `Hola AMedida3D,\n\n` +
            `Les escribo para realizar la siguiente cotización/pedido:\n` +
            `${descripcion}\n\n` +
            `Detalles técnicos:\n` +
            `- Material: ${material}\n` +
            `- Color: ${color}\n` +
            `- Dimensiones: ${ancho}mm (Ancho) x ${alto}mm (Alto) x ${profundidad}mm (Profundidad)\n\n` +
            `Mi email de contacto es: ${email}\n\n` +
            `IMPORTANTE: Si tengo un archivo 3D (.stl, .obj, etc) o imagen de referencia, lo adjunto a este correo.`
        );

        window.location.href = `mailto:galvanlaureano39@gmail.com?subject=${asunto}&body=${cuerpo}`;
    });
}


const modal = document.getElementById("modal");
if (modal) {
    const modalImg = document.getElementById("modal-img");
    const modalCaption = document.getElementById("modal-caption");
    const closeBtn = document.querySelector(".close");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    const cards = document.querySelectorAll(".galeria-card img");

    let currentIndex = 0;

    function showModal(index) {
        const img = cards[index];
        if (!img) return;
        modal.style.display = "block";
        modalImg.src = img.src;
        modalCaption.textContent = img.alt;
        currentIndex = index;
    }

    cards.forEach((img, index) => {
        img.addEventListener("click", () => showModal(index));
    });

    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";

    if (nextBtn) nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % cards.length;
        showModal(currentIndex);
    }

    if (prevBtn) prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showModal(currentIndex);
    }

    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    }
}