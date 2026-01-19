// --- CONFIGURATION ---

// 1. Your Google Sheet Link
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9PoHH3VX20l-dS_ip9vN5GVz1YagDIO0qvzA2_bfjStP4UM1vgXgShpBH67IvHXdmk7Ha-l3NAe-q/pub?output=csv';

// 2. Department Mapping
// "Key": Must match the EXACT spelling in your Google Sheet 'Department' column.
// "Value": Configuration for that section (Theme color, Logo path, etc.)
const DEPARTMENT_CONFIG = {
    "AKEPB": { 
        id: "akepb", 
        theme: "theme-akepb", 
        title: "Economic Planning Board (AKEPB)", 
        logo: "images/akepb-logo.png" 
    },
    "Arts & Culture": { 
        id: "arts", 
        theme: "theme-arts", 
        title: "Arts & Culture", 
        logo: "images/arts-logo.png" 
    },
    "Property": { 
        id: "property", 
        theme: "theme-property", 
        title: "Property Matters Portfolio", 
        logo: "images/property-logo.png" 
    },
    "Legal": { 
        id: "legal", 
        theme: "theme-legal", 
        title: "Legal Matters Portfolio", 
        logo: "images/legal-logo.png" 
    },
    "Communications": { 
        id: "communications", 
        theme: "theme-akepb", // Reusing blue theme for now
        title: "Communications & Publications", 
        logo: "images/comms-logo.png" 
    },
    "Settlement": { 
        id: "settlement", 
        theme: "theme-property", // Reusing green theme for now
        title: "Settlement Portfolio", 
        logo: "images/settlement-logo.png" 
    },
    "PMO": { 
        id: "pmo", 
        theme: "theme-legal", // Reusing red theme for now
        title: "Program Management Office", 
        logo: "images/pmo-logo.png" 
    }
    // Add more here if your sheet has other department names
};

// --- MAIN LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    const container = document.getElementById('dynamic-content');
    
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const rows = parseCSV(data);
        
        // Check if we actually got data
        if (rows.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No appointments found in the sheet.</p>';
            return;
        }

        generateHTML(rows);
        initializeScrollSpy();
        
    } catch (error) {
        console.error('Error loading sheet:', error);
        container.innerHTML = `
            <div style="text-align:center; padding: 20px; color: red;">
                <h3>Error Loading Data</h3>
                <p>Could not fetch the Google Sheet. Please check your internet connection.</p>
            </div>`;
    }
}

// Helper: Parse CSV Text into Objects
function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return []; // Only header or empty

    // Get Headers (Column names)
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        // Regex handles commas inside quotes: "Doe, John"
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let entry = {};
        
        headers.forEach((h, i) => {
            let val = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
            entry[h] = val;
        });
        return entry;
    });
}

// Helper: Generate the actual HTML
function generateHTML(people) {
    const container = document.getElementById('dynamic-content');
    const sidebarList = document.getElementById('nav-list');
    
    // Clear Loading Text
    container.innerHTML = '';
    sidebarList.innerHTML = '';

    // Group rows by Department
    const departments = {};
    
    people.forEach(person => {
        // Validation: Skip rows where Name or Dept is missing
        if (!person.Department || !person.Name) return;

        const deptName = person.Department.trim();
        if (!departments[deptName]) departments[deptName] = [];
        departments[deptName].push(person);
    });

    // Build the UI
    for (const [deptName, team] of Object.entries(departments)) {
        
        // 1. Get Config (or use default if not in config list)
        // If the Sheet has a Dept name not in our config, we create a generic one
        let config = DEPARTMENT_CONFIG[deptName];
        if (!config) {
            config = { 
                id: deptName.toLowerCase().replace(/[^a-z0-9]/g, '-'), 
                theme: '', 
                title: deptName, 
                logo: '' // No logo for unknown depts
            };
        }

        // 2. Add Sidebar Link
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${config.id}" class="nav-link">${config.title}</a>`;
        sidebarList.appendChild(li);

        // 3. Build Section HTML
        const section = document.createElement('section');
        section.id = config.id;
        section.className = `department-section ${config.theme}`;
        
        // Only show image tag if logo path exists
        const logoHTML = config.logo 
            ? `<img src="${config.logo}" class="board-logo" onerror="this.style.display='none'">` 
            : '';
        
        // Create Cards
        let cardsHTML = '';
        team.forEach(p => {
            cardsHTML += `
                <div class="card">
                    <h3>${p.Name}</h3>
                    <span class="role">${p.Role}</span>
                </div>
            `;
        });

        section.innerHTML = `
            <div class="section-header">
                ${logoHTML}
                <h2>${config.title}</h2>
                <div class="section-line"></div>
            </div>
            <div class="roster-grid">
                ${cardsHTML}
            </div>
        `;

        container.appendChild(section);
    }
}

// 4. ScrollSpy Logic (Highlights menu as you scroll)
function initializeScrollSpy() {
    const main = document.getElementById('main-content');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    main.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // The -150 offset triggers the highlight before the section hits the exact top
            if (main.scrollTop >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// 5. Global Search Filter
window.filterContent = function() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    let cards = document.getElementsByClassName('card');
    let sections = document.getElementsByTagName('section');

    // Filter Cards
    for (let i = 0; i < cards.length; i++) {
        let name = cards[i].querySelector('h3').innerText.toLowerCase();
        let role = cards[i].querySelector('.role').innerText.toLowerCase();
        
        if (name.includes(input) || role.includes(input)) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }

    // Hide Empty Sections
    for (let sec of sections) {
        let visibleCards = sec.querySelectorAll('.card:not([style*="display: none"])');
        if (visibleCards.length === 0 && input !== "") {
            sec.style.display = "none";
        } else {
            sec.style.display = "";
        }
    }
};