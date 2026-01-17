// 1. SCROLLSPY LOGIC
// This handles highlighting the left menu as you scroll down
const main = document.getElementById('main-content');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

main.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Offset of 100px triggers the highlight slightly before you hit the section
        if (main.scrollTop >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Check if the link href matches the current section ID
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// 2. SEARCH FILTER LOGIC
// Filters names and also hides empty sections
function filterContent() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    let cards = document.getElementsByClassName('card');
    let sections = document.getElementsByTagName('section');

    // Filter individual cards
    for (let i = 0; i < cards.length; i++) {
        let name = cards[i].querySelector('h3').innerText.toLowerCase();
        let role = cards[i].querySelector('.role').innerText.toLowerCase();
        
        if (name.includes(input) || role.includes(input)) {
            cards[i].style.display = ""; // Show
        } else {
            cards[i].style.display = "none"; // Hide
        }
    }

    // Hide sections if all their cards are hidden
    for (let sec of sections) {
        let visibleCards = sec.querySelectorAll('.card:not([style*="display: none"])');
        
        // If input is empty, show all sections. If searching, hide empty ones.
        if (visibleCards.length === 0 && input !== "") {
            sec.style.display = "none";
        } else {
            sec.style.display = "";
        }
    }
}