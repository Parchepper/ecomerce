// js/carousel.js

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    let currentIndex = 0;

    function showSlide(index) {
        if (index >= slides.length) { currentIndex = 0; }
        if (index < 0) { currentIndex = slides.length - 1; }
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    nextButton.addEventListener('click', function() {
        currentIndex++;
        showSlide(currentIndex);
    });

    prevButton.addEventListener('click', function() {
        currentIndex--;
        showSlide(currentIndex);
    });

    // Auto-play (optional)
    // setInterval(function() {
    //     currentIndex++;
    //     showSlide(currentIndex);
    // }, 5000);
});
