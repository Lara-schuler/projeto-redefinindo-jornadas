document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.top-nav ul');

    menuIcon.addEventListener('click', function () {
        navLinks.classList.toggle('open');
    });
});
