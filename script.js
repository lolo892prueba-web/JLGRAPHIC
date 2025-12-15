// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch((error) => {
                console.log('Error al registrar Service Worker:', error);
            });
    });
}

// Configuración de Firebase (reemplaza con tus credenciales reales desde Firebase Console)
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const description = document.getElementById('description').value.trim();

    if (!name) {
        alert('Por favor, ingresa tu nombre completo.');
        return false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return false;
    }
    if (!service) {
        alert('Por favor, selecciona un tipo de diseño.');
        return false;
    }
    if (!description) {
        alert('Por favor, describe tu proyecto.');
        return false;
    }
    return true;
}

// Referencia al formulario
const bookingForm = document.getElementById('booking-form');

// Event listener para el envío del formulario
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir el envío por defecto

    // Validar formulario
    if (!validateForm()) return;

    // Mostrar loading
    const submitButton = document.querySelector('.cta-button');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<div class="spinner"></div>Enviando...';
    submitButton.disabled = true;

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        company: document.getElementById('company').value.trim(),
        service: document.getElementById('service').value,
        description: document.getElementById('description').value.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('proyectos').add(formData);
        alert('¡Solicitud de proyecto enviada exitosamente! Nos pondremos en contacto pronto.');
        bookingForm.reset();
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('Hubo un error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

async function loadPortfolio() {
    const portfolioContainer = document.getElementById('portfolio-container');
    
    try {
        const querySnapshot = await db.collection('trabajos')
            .orderBy('orden', 'asc')
            .get();
        
        if (querySnapshot.empty) {
            portfolioContainer.innerHTML = '<p class="no-works">No hay trabajos cargados aún. Vuelve pronto para ver nuestros proyectos destacados.</p>';
            return;
        }

        portfolioContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';
            
            let imageHTML = '';
            if (data.imagen) {
                imageHTML = `<img src="${data.imagen}" alt="${data.titulo}">`;
            } else {
                imageHTML = '<i class="fas fa-image" style="font-size: 4rem; color: #fff;"></i>';
            }

            portfolioItem.innerHTML = `
                <div class="portfolio-image">
                    ${imageHTML}
                </div>
                <div class="portfolio-info">
                    <span class="portfolio-category">${data.categoria || 'Diseño'}</span>
                    <h3>${data.titulo}</h3>
                    <p>${data.descripcion || ''}</p>
                </div>
            `;
            
            portfolioContainer.appendChild(portfolioItem);
        });
    } catch (error) {
        console.error('Error al cargar el portafolio:', error);
        portfolioContainer.innerHTML = '<p class="no-works">Error al cargar los trabajos. Intenta de nuevo más tarde.</p>';
    }
}

loadPortfolio();