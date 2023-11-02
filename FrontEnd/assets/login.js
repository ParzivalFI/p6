// Exécuter du code JS lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('user-login-form').addEventListener('submit', function(event) {
		event.preventDefault();
		// Collecte de données à partir d'un formulaire
		const user = {
			email: document.querySelector('#email').value,
			password: document.querySelector('#password').value,
		};
		// Envoi d'une demande afin de s'authentifier
		fetch('http://localhost:5678/api/users/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(user),
		})
		.then(function(response) {
			switch(response.status) {
				
				case 503:
					alert("Erreur côté serveur!");
				break;
				
				case 200:
					console.log("Authentification réussie.");
					return response.json();
				break;
				default:
					case 404:
					alert("Email ou le mot de passe incorrect!");
				break;
			}
		})
		.then(function(data) {
			console.log(data);
			localStorage.setItem('token', data.token);
			localStorage.setItem('userId', data.userId);
			// Rediriger vers'index.html'
			location.href = 'index.html';
		})
		.catch(function(err) {
			console.log(err);
		});
	});
});
