document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing site initialized');

    const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});// TODO: Build this section in the next step
