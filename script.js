document.addEventListener('DOMContentLoaded', function() {
    const idCardWrapper = document.getElementById('id-card-wrapper');
    const draggableIdCardGroup = document.getElementById('draggable-id-card-group');
    const loadingScreen = document.getElementById('loading-screen');
    const splashOverlay = document.getElementById('splash-overlay');
    const idCardSling = document.getElementById('id-card-sling'); 

    let isDragging = false;
    let startX, startY;
    let initialCardGroupX, initialCardGroupY; // Posisi awal saat drag dimulai (untuk perhitungan perpindahan)
    let currentOffsetX = 0; // Offset X saat ini dari posisi tengah aslinya
    let currentOffsetY = 0; // Offset Y saat ini dari posisi tengah aslinya
    let velocityX = 0, velocityY = 0;
    let lastMoveTime = 0;
    let moveThreshold = 5; // Jarak minimum gerakan untuk dianggap "drag"
    let hasMoved = false; // Flag untuk melacak apakah ada gerakan signifikan

    // Titik jangkar tali ketapel (tengah layar) - akan tetap di tengah
    let slingAnchorX = window.innerWidth / 2;
    let slingAnchorY = window.innerHeight / 2;

    // Langsung sembunyikan loading screen setelah DOM dasar dimuat
    loadingScreen.classList.add('hidden');
    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.style.display = 'none';
    }, { once: true });

    // Posisi awal ID card group (terpusat)
    function resetCardGroupPosition() {
        const rect = draggableIdCardGroup.getBoundingClientRect();
        // Memusatkan ID card di tengah layar
        const centerX = (window.innerWidth / 2) - (rect.width / 2);
        const centerY = (window.innerHeight / 2) - (rect.height / 2);
        
        draggableIdCardGroup.style.left = `${centerX}px`;
        draggableIdCardGroup.style.top = `${centerY}px`;
        
        // Reset offset dan transform untuk memastikan posisi awal yang bersih
        currentOffsetX = 0;
        currentOffsetY = 0;
        draggableIdCardGroup.style.transform = 'rotate(0deg)'; // Rotasi awal 0
        
        initialCardGroupX = centerX; // Posisi awal absoulte X
        initialCardGroupY = centerY; // Posisi awal absoulte Y
        
        // Posisi anchor tali ketapel juga tetap di tengah
        slingAnchorX = window.innerWidth / 2;
        slingAnchorY = window.innerHeight / 2;
    }
    resetCardGroupPosition();

    window.addEventListener('resize', resetCardGroupPosition);

    function updateSling() {
        if (!isDragging || !idCardSling) {
            if (idCardSling) idCardSling.classList.remove('active');
            return;
        }

        const cardGroupRect = draggableIdCardGroup.getBoundingClientRect();
        const cardGroupCenterX = cardGroupRect.left + cardGroupRect.width / 2;
        const cardGroupCenterY = cardGroupRect.top + cardGroupRect.height / 2;

        const dx = cardGroupCenterX - slingAnchorX;
        const dy = cardGroupCenterY - slingAnchorY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        idCardSling.style.width = `${distance}px`;
        idCardSling.style.left = `${slingAnchorX}px`;
        idCardSling.style.top = `${slingAnchorY}px`;
        idCardSling.style.transform = `rotate(${angle}deg)`;
        idCardSling.classList.add('active');
    }

    // Fungsi untuk memulai transisi ke halaman utama
    function triggerMainPageTransition(animationType) {
        if (draggableIdCardGroup.classList.contains('launched')) {
            return;
        }
        draggableIdCardGroup.classList.add('launched'); 

        const finalRotation = Math.random() * 720 - 360; // Rotasi acak 360 derajat ke kedua arah

        if (animationType === 'catapult') {
            const launchForce = 1500;
            const targetX = draggableIdCardGroup.offsetLeft + (velocityX * launchForce);
            const targetY = draggableIdCardGroup.offsetTop + (velocityY * launchForce);
            draggableIdCardGroup.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.5s ease';
            // Gabungkan translate dan rotate untuk animasi meluncur
            draggableIdCardGroup.style.transform = `translate(${targetX - draggableIdCardGroup.offsetLeft}px, ${targetY - draggableIdCardGroup.offsetTop}px) rotate(${finalRotation}deg) scale(0.1)`;
        } else if (animationType === 'fade') { // Animasi untuk klik
            draggableIdCardGroup.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
            // Gabungkan translate dan rotate untuk animasi fade
            draggableIdCardGroup.style.transform = `scale(0.8) translateY(20px) rotate(${finalRotation}deg)`; // Sedikit mengecil, turun, dan berputar
            draggableIdCardGroup.style.opacity = '0';
        }

        splashOverlay.classList.add('active');

        setTimeout(() => {
            window.location.href = 'main/index.html'; 
        }, animationType === 'catapult' ? 800 : 500); 
    }


    const startDrag = (e) => {
        isDragging = true;
        hasMoved = false; 
        draggableIdCardGroup.classList.add('dragging');
        lastMoveTime = Date.now();

        if (e.type.startsWith('mouse')) {
            startX = e.clientX;
            startY = e.clientY;
        } else {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }

        // Posisi awal ID card saat memulai drag (relative terhadap layar)
        initialCardGroupX = draggableIdCardGroup.getBoundingClientRect().left;
        initialCardGroupY = draggableIdCardGroup.getBoundingClientRect().top;

        draggableIdCardGroup.style.transition = 'none';
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }
        updateSling();
    };

    const doDrag = (e) => {
        if (!isDragging) return;

        let clientX, clientY;
        if (e.type.startsWith('mouse')) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const dx_total = clientX - startX; // Perubahan dari posisi mulai drag X
        const dy_total = clientY - startY; // Perubahan dari posisi mulai drag Y

        if (Math.abs(dx_total) > moveThreshold || Math.abs(dy_total) > moveThreshold) {
            hasMoved = true;
        }

        // Perbarui posisi kartu secara absolut
        draggableIdCardGroup.style.left = `${initialCardGroupX + dx_total}px`;
        draggableIdCardGroup.style.top = `${initialCardGroupY + dy_total}px`;

        // === LOGIKA ROTASI BARU SAAT DRAG ===
        // Rotasi berdasarkan perpindahan horizontal dari posisi awal drag
        const rotationSensitivity = 0.05; // Sesuaikan untuk seberapa banyak berputar
        const rotationAngle = dx_total * rotationSensitivity; 
        draggableIdCardGroup.style.transform = `rotate(${rotationAngle}deg)`; // Terapkan rotasi
        // === AKHIR LOGIKA ROTASI BARU ===

        const now = Date.now(); 
        const dt = now - lastMoveTime;
        if (dt > 0) {
            velocityX = (clientX - startX) / dt;
            velocityY = (clientY - startY) / dt;
        }
        startX = clientX;
        startY = clientY;
        lastMoveTime = now;

        updateSling();
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        draggableIdCardGroup.classList.remove('dragging');
        if (idCardSling) idCardSling.classList.remove('active'); 

        const speedThreshold = 0.5; 

        if (hasMoved && (Math.abs(velocityX) > speedThreshold || Math.abs(velocityY) > speedThreshold)) {
            triggerMainPageTransition('catapult'); 
        } else {
            triggerMainPageTransition('fade'); 
        }
        hasMoved = false;
    };

    // Event Listeners for Dragging (sekarang pada group)
    draggableIdCardGroup.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    draggableIdCardGroup.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // Auto-slide background untuk ID card wrapper (opsional)
    const heroBackgrounds = [
        'images/hero-bg.jpg', 
    ];
    let currentBgIndex = 0;

    function slideBackground() {
        if (heroBackgrounds.length <= 1) return;
        currentBgIndex = (currentBgIndex + 1) % heroBackgrounds.length;
        idCardWrapper.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${heroBackgrounds[currentBgIndex]}')`;
    }

    if (heroBackgrounds.length > 1) {
        setInterval(slideBackground, 5000); 
    }
});