window.addEventListener("load", () => {
    const logo = document.querySelector(".preloader-logo img");
  
    // Mostrar logo más rápido
    setTimeout(() => {
      logo.style.opacity = 1;
    }, 200); // antes: 300ms
  
    // Abrir paneles antes
    setTimeout(() => {
      document.querySelector(".panel.left").style.transform = "translateX(-100%)";
      document.querySelector(".panel.right").style.transform = "translateX(100%)";
    }, 600); // antes: 1000ms
  
    // Ocultar preloader antes
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      preloader.style.opacity = 0;
      preloader.style.transition = "opacity 0.3s ease";
  
      // Habilitar scroll
      document.body.classList.remove("preloader-active");
  
      setTimeout(() => {
        preloader.style.display = "none";
      }, 300);
    }, 1200); // antes: 2000ms
  });



document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    let lastScrollY = window.scrollY;
    
    //eliminar barra flotante en pantallas chicas
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) { 
            if (window.scrollY > lastScrollY && window.scrollY > nav.offsetHeight) {
                nav.classList.add('floating');
            } else {
                nav.classList.remove('floating');
            }
        } else {
            nav.classList.remove('floating'); 
        }
        lastScrollY = window.scrollY;
    });
});

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
        threshold: 0.6
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    const input = document.getElementById('archivo');
    const fileName = document.getElementById('file-name');

    input.addEventListener('change', () => {
    fileName.textContent = input.files.length > 0 ? input.files[0].name : 'Ningún archivo seleccionado';
    });
    
});

document.addEventListener('DOMContentLoaded', () => {
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
});

document.getElementById('input').addEventListener('change', () =>{
    if(document.body.className.indexOf('dark') === -1) {
        document.body.classList.add('dark');
    }
    else {
        document.body.classList.remove('dark');
    }
}
);

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("input");
    const body = document.body;

    // 1. Leer estado guardado
    const darkMode = localStorage.getItem("dark-mode");
    if (darkMode === "enabled") {
        body.classList.add("dark");
        toggle.checked = true;
    }

    // 2. Función para activar/desactivar modo
    toggle.addEventListener("change", () => {
        if (toggle.checked) {
            body.classList.add("dark");
            localStorage.setItem("dark-mode", "enabled");
        } else {
            body.classList.remove("dark");
            localStorage.setItem("dark-mode", "disabled");
        }
    });
});


