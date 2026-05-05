document.addEventListener('DOMContentLoaded', () => {
    // Fetch test route or doctors from our Node.js Backend
    fetchDoctors();

    // Event listeners
    document.getElementById('bookBtn').addEventListener('click', () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('Please securely login first to access the Appointment Booking portal!');
            window.location.href = 'login.html';
        } else {
            // Auto trigger booking modal smoothly using URL param routing
            window.location.href = 'patient-dashboard.html?action=book';
        }
    });
});

async function fetchDoctors() {
    try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        
        const doctors = await response.json();
        const container = document.getElementById('doctors-container');
        
        if (doctors.length === 0) {
            container.innerHTML = '<p>No doctors available at the moment.</p>';
            return;
        }

        container.innerHTML = ''; // clear loading state
        
        // Show only the top 3 featured doctors on the Home Page
        const featuredDoctors = doctors.slice(0, 3);
        
        featuredDoctors.forEach(doctor => {
            const initial = doctor.name.replace('Dr. ', '').charAt(0);
            const card = document.createElement('div');
            card.className = 'doctor-card';
            card.innerHTML = `
                <div class="doctor-avatar">${initial}</div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <button class="btn-outline" style="width: 100%" onclick="window.location.href='doctor-profile.html?id=${doctor.id}'">View Profile</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        const container = document.getElementById('doctors-container');
        container.innerHTML = '<p style="color: red;">Failed to load doctors list. Is the backend running?</p>';
    }
}
