document.addEventListener('DOMContentLoaded', () => {

    // --- Login Form Handler ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMsg = document.getElementById('loginError');
            errorMsg.style.display = 'none';

            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token/user data in local storage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    alert('Login successful! Redirecting...');
                    
                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (data.user.role === 'doctor') {
                        window.location.href = 'doctor-dashboard.html';
                    } else {
                        window.location.href = 'patient-dashboard.html';
                    }
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                errorMsg.textContent = 'Server error. Please try again.';
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- Register Form Handler ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMsg = document.getElementById('registerError');
            errorMsg.style.display = 'none';

            // Gather elements manually
            const payload = {
                username: registerForm.username.value,
                password: registerForm.password.value,
                fullName: registerForm.fullName.value,
                dob: registerForm.dob.value,
                gender: registerForm.gender.value,
                phone: registerForm.phone.value,
                role: 'patient' // default
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    errorMsg.textContent = data.message || 'Registration failed';
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                errorMsg.textContent = 'Server error. Please try again.';
                errorMsg.style.display = 'block';
            }
        });
    }
});
