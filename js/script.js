window.addEventListener("load", () => {


    // Hacer que las secciones se muestren gradualmente
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });

    const logo = document.querySelector(".preloader-logo img");
  
    // Mostrar logo 
    setTimeout(() => {
      logo.style.opacity = 1;
    }, 200); 
  
    // Abrir paneles 
    setTimeout(() => {
      document.querySelector(".panel.left").style.transform = "translateX(-100%)";
      document.querySelector(".panel.right").style.transform = "translateX(100%)";
    }, 600);
  
    // Ocultar preloader 
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      preloader.style.opacity = 0;
      preloader.style.transition = "opacity 0.3s ease";
  
      // Habilitar scroll
      document.body.classList.remove("preloader-active");
  
      setTimeout(() => {
        preloader.style.display = "none";
      }, 300);
    }, 1200); 
  });


// Hacer que el header se quede fijo cuando se hace scroll
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');

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
});

// Hacer que el menú se actualice cuando se hace scroll
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

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

    const input = document.getElementById('archivo');
    const fileName = document.getElementById('file-name');

    
    
    // Manejo del modal de la galería
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const modalCaption = document.getElementById("modal-caption");
    const closeBtn = document.querySelector(".close");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    const cards = document.querySelectorAll(".galeria-card img");

    let currentIndex = 0;

    function showModal(index) {
        const img = cards[index];
        modal.style.display = "block";
        modalImg.src = img.src;
        modalCaption.textContent = img.alt;
        currentIndex = index;
    }

    cards.forEach((img, index) => {
        img.addEventListener("click", () => showModal(index));
    });

    closeBtn.onclick = () => modal.style.display = "none";

    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % cards.length;
        showModal(currentIndex);
    }

    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showModal(currentIndex);
    }

    // Cerrar modal al hacer clic fuera de la imagen
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    }
    
    // Mantener modo oscuro con localStorage
    const themeSwitch = document.getElementById("theme-switch");
    const body = document.body;

    const darkMode = localStorage.getItem("dark-mode");
    if (darkMode === "enabled") {
        body.classList.add("dark");
    }

    themeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");
        localStorage.setItem("dark-mode", body.classList.contains("dark") ? "enabled" : "disabled");
    });

    // Manejo del input de archivo
    input.addEventListener('change', () => {
        fileName.textContent = input.files.length > 0 ? input.files[0].name : 'Ningún archivo seleccionado';
        });
    const fileInput = document.getElementById('archivo');
    const fileName1 = document.getElementById('file-name');

    if (fileInput && fileName) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileName.textContent = this.files[0].name;
            } else {
                fileName.textContent = 'Ningún archivo seleccionado';
            }
        });
    }

});

// Menú hamburguesa
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('.mobile-nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Cerrar menú al hacer clic fuera de él
document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

