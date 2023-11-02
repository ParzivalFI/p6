// Fonction pour créer un élément HTML
function createHTMLElement(tagName, attributes = {}, textContent = null) {
	const element = document.createElement(tagName);
	for (const key in attributes) {
	  element.setAttribute(key, attributes[key]);
	}
	if (textContent) {
	  element.textContent = textContent;
	}
	return element;
  }
  
  // Fonction pour ajouter un travail à la galerie
  function addWorkToGallery(work) {
	const gallery = document.querySelector("div.gallery");
	const workItem = createHTMLElement('figure', {
	  class: `work-item category-id-0 category-id-${work.categoryId}`,
	  id: `work-item-${work.id}`
	});
  
	const img = createHTMLElement('img', {
	  src: work.imageUrl,
	  alt: work.title
	});
	workItem.appendChild(img);
  
	const figCaption = createHTMLElement('figcaption', {}, work.title);
	workItem.appendChild(figCaption);
  
	gallery.appendChild(workItem);
  }
  
  // Fonction pour ajouter des filtres de catégories
  function addCategoryFilters(categories) {
	const filtersContainer = document.querySelector("div.filters");
  
	categories.forEach((category, index) => {
	  const filterButton = createHTMLElement('button', {
		class: 'work-filter filters-design',
		'data-filter': category.id
	  }, category.name);
  
	  if (category.id === 0) {
		filterButton.classList.add('filter-active', 'filter-all');
	  }
  
	  filterButton.addEventListener('click', function(event) {
		event.preventDefault();
  
		document.querySelectorAll('.work-filter').forEach(workFilter => {
		  workFilter.classList.remove('filter-active');
		});
  
		filterButton.classList.add('filter-active');
  
		const categoryId = filterButton.getAttribute('data-filter');
		document.querySelectorAll('.work-item').forEach(workItem => {
		  workItem.style.display = 'none';
		});
		document.querySelectorAll(`.work-item.category-id-${categoryId}`).forEach(workItem => {
		  workItem.style.display = 'block';
		});
	  });
  
	  filtersContainer.appendChild(filterButton);
	});
  }
  
  document.addEventListener('DOMContentLoaded', function() {
	// Récupération des travaux existants depuis l'API
	fetch("http://localhost:5678/api/works")
	  .then(function(response) {
		if (response.ok) {
		  return response.json();
		}
	  })
	  .then(function(data) {
		let works = data;
		console.log(works);
		works.forEach((work, index) => {
		  addWorkToGallery(work);
		});
	  })
	  .catch(function(err) {
		console.log(err);
	  });
  
	// Récupération des catégories existantes depuis l'API
	fetch("http://localhost:5678/api/categories")
	  .then(function(response) {
		if (response.ok) {
		  return response.json();
		}
	  })
	  .then(function(data) {
		let categories = data;
		categories.unshift({ id: 0, name: 'Tous' });
		console.log(categories);
		addCategoryFilters(categories);
	  })
	  .catch(function(err) {
		console.log(err);
	  });
  });




  
  
  document.addEventListener('DOMContentLoaded', function() {

	// Verification des jeton et l'userId si ils sont présents dans le localStorage
	if(localStorage.getItem('token') != null && localStorage.getItem('userId') != null) {
		// Changer le visuel de la page quand on est connecter
		document.querySelector('body').classList.add('connected');
		let topBar = document.getElementById('top-bar');
		topBar.style.display = "flex";
		let filters = document.getElementById('all-filters');
		filters.style.display = "none";
		let space = document.getElementById('space-only-admin');
		space.style.paddingBottom = "100px";
		let introduction = document.getElementById('space-introduction-in-mode-admin');
		introduction.style.marginTop = "-50px";
	}

	// Cliquez sur déconnexion pour vous déconnecter
	document.getElementById('nav-logout').addEventListener('click', function(event) {
		event.preventDefault();
		localStorage.removeItem('userId');
		localStorage.removeItem('token');
		// Changer le visuel de la page quand on est deconnecter
		document.querySelector('body').classList.remove(`connected`);
		let topBar = document.getElementById('top-bar');
		topBar.style.display = "none";
		let filters = document.getElementById('all-filters');
		filters.style.display = "flex";
		let space = document.getElementById('space-only-admin');
		space.style.paddingBottom = "0";
	});

	// Ouverture du modal avec le bouton "modifier" quand on est connecter pour voir toutes les œuvres
	document.getElementById('update-works').addEventListener('click', function(event) {
		event.preventDefault();

		fetch("http://localhost:5678/api/works")
		.then(function(response) {
			if(response.ok) {
				return response.json();
			}
		})
		.then(function(works) {
			
			// Suppression d'anciennes œuvres
			document.querySelector('#modal-works.modal-gallery .modal-content').innerText = '';
			// En boucle sur chaque œuvre
			works.forEach((work, index) => {
				// Creation <figure>
				let myFigure = document.createElement('figure');
				myFigure.setAttribute('class', `work-item category-id-0 category-id-${work.categoryId}`);
				myFigure.setAttribute('id', `work-item-popup-${work.id}`);
				// Creation <img>
				let myImg = document.createElement('img');
				myImg.setAttribute('src', work.imageUrl);
				myImg.setAttribute('alt', work.title);
				myFigure.appendChild(myImg);
				// Creation <figcaption>
				let myFigCaption = document.createElement('figcaption');
				myFigCaption.textContent = 'éditer';
				myFigure.appendChild(myFigCaption);
				// Creation cross icon
				let crossDragDrop = document.createElement('i');
				crossDragDrop.classList.add('fa-solid','fa-arrows-up-down-left-right', 'cross');
				myFigure.appendChild(crossDragDrop);
				// Creation trash icon
				let trashIcon = document.createElement('i');
				trashIcon.classList.add('fa-solid', 'fa-trash-can', 'trash');
				myFigure.appendChild(trashIcon);
				// Gestion de la suppression
				trashIcon.addEventListener('click', function(event) {
					event.preventDefault();
					if(confirm("T'es sur de vouloir supprimer ?")) {
						// Récupérer pour supprimer le travail dans le modal de travail et dans la galerie de portfolio de la page
						fetch(`http://localhost:5678/api/works/${work.id}`, {
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': 'Bearer ' + localStorage.getItem('token')
							}
						})
						.then(function(response) {
							switch(response.status) {
								
								case 503:
									alert("Comportement inattendu!");
								break;
								case 401:
									alert("Suppresion impossible!");
								break;
							
								case 204:
									console.log("Projet supprimé.");
									// Supprimer une image de la page
									document.getElementById(`work-item-${work.id}`).remove();
									console.log(`work-item-${work.id}`);
									// Supprimer un travail de la fenêtre contextuelle
									document.getElementById(`work-item-popup-${work.id}`).remove();
									console.log(`work-item-popup-${work.id}`);
									return false
								break;
								default:
									alert("Erreur inconnue!");
								break;
							}
						})
						.catch(function(err) {
							console.log(err);
						});
					}
				});
				// Ajout du nouveau <figure> dans le contenu div.modal existant
				document.querySelector("div.modal-content").appendChild(myFigure);
				// Modal de travail d'ouverture
				let modal = document.getElementById('modal');
				modal.style.display = "flex";
				let modalWorks = document.getElementById('modal-works');
				modalWorks.style.display = "block";
			});
		})
		.catch(function(err) {
			console.log(err);
		});
	});

	// Gestion de la fermeture modale en cliquant à l'extérieur
	// Le modal de travail ne peut pas se fermer si vous cliquez à l'intérieur de son contenu
	document.querySelectorAll('#modal-works').forEach(modalWorks => {
		modalWorks.addEventListener('click', function(event) {
			event.stopPropagation();
		});
		// Le modal d'édition ne peut pas se fermer si vous cliquez à l'intérieur de son contenu
		document.querySelectorAll('#modal-edit').forEach(modalEdit => {
			modalEdit.addEventListener('click', function(event) {
				event.stopPropagation();
			});
			// Fermer les deux fenêtres modales avec un clic extérieur
			document.getElementById('modal').addEventListener('click', function(event) {
				event.preventDefault();
				let modal = document.getElementById('modal');
				modal.style.display = "none";
				let modalWorks = document.getElementById('modal-works');
				modalWorks.style.display = "none";
				let modalEdit = document.getElementById('modal-edit');
				modalEdit.style.display = "none";
				// Réinitialiser tout le formulaire dans la modification modale 
				// Supprimer l'image si elle existe
				if(document.getElementById('form-image-preview') != null) {
					document.getElementById('form-image-preview').remove();
				}
				// Revenir à la conception originale du formulaire
				document.getElementById('modal-edit-work-form').reset();	
				let iconNewPhoto = document.getElementById('photo-add-icon');
				iconNewPhoto.style.display= "block";
				let buttonNewPhoto = document.getElementById('new-image');
				buttonNewPhoto.style.display= "block";
				let photoMaxSize = document.getElementById('photo-size');
				photoMaxSize.style.display= "block";	
				let modalEditPhoto = document.getElementById('modal-edit-new-photo');
				modalEditPhoto.style.padding = "30px 0 19px 0";
				document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
			});
		});
	});

	// Fermeture de la première fenêtre du modal avec le bouton "x"
	document.getElementById('button-to-close-first-window').addEventListener('click', function(event) {
		event.preventDefault();
		let modal = document.getElementById('modal');
		modal.style.display = "none";
		let modalWorks = document.getElementById('modal-works');
		modalWorks.style.display = "none";
	});

	// Fermeture de la deuxième fenêtre modale avec le bouton "x"
	document.getElementById('button-to-close-second-window').addEventListener('click', function(event) {
		event.preventDefault();
		let modal = document.getElementById('modal');
		modal.style.display = "none";
		let modalEdit = document.getElementById('modal-edit');
		modalEdit.style.display = "none";
		// Réinitialiser tout le formulaire dans la modification modale
		// Supprime l'image si elle existe
		if(document.getElementById('form-image-preview') != null) {
			document.getElementById('form-image-preview').remove();
		}
		// Revenir à la conception originale du formulaire
		document.getElementById('modal-edit-work-form').reset();
		let iconNewPhoto = document.getElementById('photo-add-icon');
		iconNewPhoto.style.display= "block";
		let buttonNewPhoto = document.getElementById('new-image');
		buttonNewPhoto.style.display= "block";
		let photoMaxSize = document.getElementById('photo-size');
		photoMaxSize.style.display= "block";	
		let modalEditPhoto = document.getElementById('modal-edit-new-photo');
		modalEditPhoto.style.padding = "30px 0 19px 0";
		document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
	});

	// Ouverture deuxième fenêtre de modale avec bouton "Ajouter photo"
	document.getElementById('modal-edit-add').addEventListener('click', function(event) {
		event.preventDefault();
		let modalWorks = document.getElementById('modal-works');
		modalWorks.style.display = "none";
		let modalEdit = document.getElementById('modal-edit');
		modalEdit.style.display = "block";
	});

	// Retourner la première fenêtre du modal avec la flèche
	document.getElementById('arrow-return').addEventListener('click', function(event) {
		event.preventDefault();
		let modalWorks = document.getElementById('modal-works');
		modalWorks.style.display = "block";
		let modalEdit = document.getElementById('modal-edit');
		modalEdit.style.display = "none";
		// Réinitialiser tout le formulaire dans la modification modale
		if(document.getElementById('form-image-preview') != null) {
			document.getElementById('form-image-preview').remove();
		}
		// Revenir à la conception originale du formulaire
		document.getElementById('modal-edit-work-form').reset();
		let iconNewPhoto = document.getElementById('photo-add-icon');
		iconNewPhoto.style.display= "block";
		let buttonNewPhoto = document.getElementById('new-image');
		buttonNewPhoto.style.display= "block";
		let photoMaxSize = document.getElementById('photo-size');
		photoMaxSize.style.display= "block";	
		let modalEditPhoto = document.getElementById('modal-edit-new-photo');
		modalEditPhoto.style.padding = "30px 0 19px 0";
		document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
	});
	
	// Récupérer pour ajouter des options de catégorie dans la modification modale
	fetch("http://localhost:5678/api/categories")
		.then(function(response) {
			if(response.ok) {
				return response.json();
			}
		})
		.then(function(data) {
			let categories = data;
			// Boucle sur chaque catégorie
			categories.forEach((category, index) => {
			// Création <options> en édition modale
			let myOption = document.createElement('option');
			myOption.setAttribute('value', category.id);
			myOption.textContent = category.name;
			// Ajout du nouveau <option> dans la catégorie select.choice existante
			document.querySelector("select.choice-category").appendChild(myOption);
			});
		})
		.catch(function(err) {
			console.log(err);
		});

	// Formulaire de traitement
	document.getElementById('modal-edit-work-form').addEventListener('submit', function(event) {
		event.preventDefault();
		let formData = new FormData();
		formData.append('title', document.getElementById('form-title').value);
		formData.append('category', document.getElementById('form-category').value);
		formData.append('image', document.getElementById('form-image').files[0]);
		// Nouvelle récupération pour publier un nouveau travail

		fetch('http://localhost:5678/api/works', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + localStorage.getItem('token'),
			},
			body: formData
		})
		.then(function(response) {
			switch(response.status) {
				
				case 503:
					alert("Erreur inattendue!");
				break;
				
				case 404:
					alert("Impossible d'ajouter !");
				break;
				
				case 201:
					console.log("Projet ajouté avec succés!");
					return response.json();
				break;
				default:
					alert("Erreur inconnue!");
				break;
			}
		})
		.then(function(json) {
			console.log(json);
			// Creation d'un element HTML 
			// Creation <figure>
			let myFigure = document.createElement('figure');
			myFigure.setAttribute('class', `work-item category-id-0 category-id-${json.categoryId}`);
			myFigure.setAttribute('id', `work-item-${json.id}`);
			// Creation <img>
			let myImg = document.createElement('img');
			myImg.setAttribute('src', json.imageUrl);
			myImg.setAttribute('alt', json.title);
			myFigure.appendChild(myImg);
			// Creation <figcaption>
			let myFigCaption = document.createElement('figcaption');
			myFigCaption.textContent = json.title;
			myFigure.appendChild(myFigCaption);
			// Ajout du nouveau <figure> dans la div.gallery existante
			document.querySelector("div.gallery").appendChild(myFigure);
			// Fermer le mode d'édition
			let modal = document.getElementById('modal');
			modal.style.display = "none";
			let modalEdit = document.getElementById('modal-edit');
			modalEdit.style.display = "none";
			// Réinitialiser tout le formulaire dans la modification modale
			// Supprimer l'image si elle existe
			if(document.getElementById('form-image-preview') != null) {
				document.getElementById('form-image-preview').remove();
			}
			// Revenir à la conception originale du formulaire
			document.getElementById('modal-edit-work-form').reset();
			let iconNewPhoto = document.getElementById('photo-add-icon');
			iconNewPhoto.style.display= "block";
			let buttonNewPhoto = document.getElementById('new-image');
			buttonNewPhoto.style.display= "block";
			let photoMaxSize = document.getElementById('photo-size');
			photoMaxSize.style.display= "block";	
			let modalEditPhoto = document.getElementById('modal-edit-new-photo');
			modalEditPhoto.style.padding = "30px 0 19px 0";
			document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
		})
		.catch(function(err) {
			console.log(err);
		});
	});

	// Vérifiez la taille du fichier image
	document.getElementById('form-image').addEventListener('change', () => {
		let fileInput = document.getElementById('form-image');
		const maxFileSize = 4 * 1024 * 1024; // 4 MB
		if(fileInput.files[0].size > maxFileSize) {
			alert("Le fichier sélectionné est trop volumineux. La taille maximale est de 4 Mo.");
			document.getElementById('form-image').value = '';
		}
		else {
			if(fileInput.files.length > 0) {
            	// Création de l'aperçu de l'image
				let myPreviewImage = document.createElement('img');
				myPreviewImage.setAttribute('id','form-image-preview');
				myPreviewImage.src = URL.createObjectURL(fileInput.files[0]);
				document.querySelector('#modal-edit-new-photo').appendChild(myPreviewImage);
				myPreviewImage.style.display = "block";	
				myPreviewImage.style.height ="169px";
				let iconNewPhoto = document.getElementById('photo-add-icon');
				iconNewPhoto.style.display= "none";
				let buttonNewPhoto = document.getElementById('new-image');
				buttonNewPhoto.style.display= "none";
				let photoMaxSize = document.getElementById('photo-size');
				photoMaxSize.style.display= "none";	
				let modalEditPhoto = document.getElementById('modal-edit-new-photo');
				modalEditPhoto.style.padding = "0";
			}
		}
	});

	// Lier la fonction checkNewProjectFields() sur les 3 champs en écoutant les événements "input"
	document.getElementById('form-title').addEventListener('input', checkNewProjectFields);
	document.getElementById('form-category').addEventListener('input', checkNewProjectFields);
	document.getElementById('form-image').addEventListener('input', checkNewProjectFields);

	// Création de la fonction checkNewProjectFields() qui vérifie les champs image + titre + catégorie

	function checkNewProjectFields() {
		let title = document.getElementById('form-title');
		let category = document.getElementById('form-category');
		let image = document.getElementById('form-image');
		let submitWork = document.getElementById('submit-new-work');
		if(title.value.trim() === "" || category.value.trim() === "" || image.files.length === 0) {
			submitWork.style.backgroundColor= "#A7A7A7";
		} else {
			submitWork.style.backgroundColor= "#1D6154";
		}
	};
});






// const liItem = document.querySelectorAll('ul li');
// const imgItem = document.querySelectorAll('.product img');

// liItem.forEach(li => {
//   li.onclick = function () {
//     //active
//     liItem.forEach(li => {
//       li.className = "";
//     })
//     li.className = "filter";

//     //Filter
//     const value = li.textContent;
//     imgItem.forEach(img => {
//       img.style.display = 'none';
//       if (img.getAttribute('categoryId') == value.toLowerCase() || value == "tous") {
//         img.style.display = 'block';
//       }
//     })
//   }
// });



