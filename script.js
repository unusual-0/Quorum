import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Switch login/register
const container = document.querySelector('.container');
const LoginLink = document.querySelector('.SignInLink');
const RegisterLink = document.querySelector('.SignUpLink');
RegisterLink.addEventListener('click', () => container.classList.add('active'));
LoginLink.addEventListener('click', () => container.classList.remove('active'));

// REGISTER
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    createUserWithEmailAndPassword(auth,email,password)
    .then(userCredential=>{
        const user = userCredential.user;
        set(ref(database,'users/' + user.uid), {
            username: username,
            email: email,
            uid: user.uid
        });
        alert('Registration successful! You can login now.');
        container.classList.remove('active');
        registerForm.reset();
    })
    .catch(error=>alert(error.message));
});

// LOGIN
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth,email,password)
    .then(userCredential=>{
        const user = userCredential.user;
        sessionStorage.setItem('userId', user.uid); // pass to chat.html
        window.location.href = 'chat.html';
    })
    .catch(error=>alert(error.message));
});
