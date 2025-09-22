// This function handles smooth scrolling for all anchor links.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Get the target element's ID from the href attribute.
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Scroll to the target element smoothly.
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});