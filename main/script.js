document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Dapatkan target elemen dari href (misal: #about, #skills)
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Anda bisa menambahkan JavaScript interaktif lainnya untuk halaman portofolio di sini
    // Contoh: filter proyek, galeri gambar, atau animasi scroll
});