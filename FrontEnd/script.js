let works;
const galleryhtml = document.querySelector(".gallery");

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (response.ok) {
        works = await response.json();
        createGallery(works);
        createModalGallery(works);
    } else {
        console.error("Erreur lors du chargement des travaux");
    }
}

function createGallery(data) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) {
        console.error("Erreur : .gallery n'existe pas !");
        return;
    }

    gallery.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        setFigure(data[i], gallery, false); // false = pas d'icône poubelle
    }
}

getWorks();

function setFigure(data, targetGallery, isModal = false) {

    const figure = document.createElement("figure");

    figure.classList.add("figure-work-" + data.id)

    let figureContent = `<img src="${data.imageUrl}" alt="${data.title}">`;

    if (!isModal) {
        figureContent += `<figcaption>${data.title}</figcaption>`;
    }

    figure.innerHTML = figureContent;

    // Si on est dans la modale, on ajoute une icône poubelle
    if (isModal) {
        const deleteIcon = document.createElement("button");
        deleteIcon.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        deleteIcon.classList.add("delete-icon");
        deleteIcon.addEventListener("click", () => {
        deleteImage(data.id);
    });
        figure.append(deleteIcon);
    }

    targetGallery.append(figure);
}

async function deleteImage(Id) {
    const response = await fetch("http://localhost:5678/api/works/" + Id,
        {
            headers: {
                accept: "application/json",
                Authorization: "Bearer " + token,
              },
              method: "DELETE"
        }
    );
    if (response.ok) {
        const elements = document.querySelectorAll(".figure-work-" + Id);
        elements.forEach(element => {
            element.remove();
          });
          works = works.filter(work => work.id !== Id);
    } else {
        console.error("Erreur lors de la suppression du travail");
    }
    
}



let categories;

async function getcategories(){
    const response = await fetch("http://localhost:5678/api/categories")
        if(response.ok){
            categories = await response.json();
            createCategories();
        }
}

function createCategories(){
    for (let i = 0; i < categories.length; i++){
        setFiltres(categories[i]);
    }
}

getcategories();

function setFiltres(data) {
    const button = document.createElement("button");
    button.textContent = data.name;
    button.dataset.categoryId = data.id;
    button.addEventListener("click", (event) => filterGallery(event.target.dataset.categoryId));

    document.querySelector(".filtres").append(button);
}

function filterGallery(categoryId) {
    const filteredworks = works.filter((work) => work.categoryId == categoryId)
    createGallery(filteredworks);
}

const allButton = document.createElement ("button");
allButton.textContent = "tous"
allButton.addEventListener("click", () => {
    galleryhtml.innerHTML = "";
    works.forEach(work => setFigure(work, galleryhtml, false));
})
document.querySelector(".filtres").appendChild(allButton);

const token = sessionStorage.getItem("authToken");
if (token) {
    let expiration = new Date (parseJwt(token).exp * 1000)
    const isLogin = expiration > Date.now();
    if (isLogin) {
    const editionMode = document.createElement("div");
    editionMode.className = "edition-mode";
    editionMode.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>Mode édition`;
    document.querySelector("body").prepend(editionMode);
    document.querySelector(".login").textContent = "logout"
    const lienModifier = document.createElement("a")
    lienModifier.href = "#modal1"
    lienModifier.className = "js-modal"
    lienModifier.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>Modifier`
    document.querySelector(".mesProjets").appendChild(lienModifier)
    const createModal = document.createElement("div")
    createModal.classList = "divModal"
    createModal.innerHTML = `
        <aside id="modal1" class="modal" aria-hidden="true" role="dialog" aria-modal="false" aria-labelledby="modification-gallery" style="display: none;">
			<div class="modal-wrapper js-modal-stop">
				<div class="premieremodal">
					<div class="close-button-modal"><button class="js-modal-close"><i class="fa-solid fa-xmark"></i></button></div>
					<h3 id= "modification-gallery">Galerie photo</h2>
					<div class="modal-design">
						<div class="gallery-modal"></div>
						<hr>
						<button class="open-second-modal">Ajouter une photo</button>
					</div>
				</div>
				<div class="second-modal">
					<div class="back-button-modal">
						<button class="back-modal"><i class="fa-solid fa-arrow-left"></i></button>
						<button class="js-modal-close"><i class="fa-solid fa-xmark"></i></button>
					</div>
					<h3 id= "modification-gallery">Ajout photo</h2>
					<div class="div-add-photo">
						<form action="#" method="post" id="photoForm">
							<div id="photo-container"></div>
							<div class="add-picture-button">
								<i class="fa-regular fa-image"></i>
								<label for="fileInput">+ Ajouter Photo</label>
								<input type="file" id="fileInput" name="file" accept="image/png, image/jpeg" style="display: none;" required/>
								<p>jpg. png : 4mo max</p>
							</div >
							<label for="title" class="labelTitle">Titre</label>
							<input type="text" name="title" id="title" required>
							<label for="category" class ="labelCategory">Catégorie</label>
							<select name="category" id="category" size="1">
								<option value="1">Objets</option>
								<option value="2">Appartements</option>
								<option value="3">Hotels & restaurants</option>
							</select>
							<p id="errorMessage"></p>
							<hr>
							<button class="addPicture" id="addPicture">Valider</button>
						</form>

					</div>
				</div>
			</div>
		</aside>
    `
    document.querySelector(".main").appendChild(createModal)
}}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}



// partie modal

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusables = []
let previouslyFocusedElement = null

function createModalGallery(data) {
    const modalgallery = document.querySelector(".gallery-modal");
    if (!modalgallery) {
        console.error("Erreur : .gallery-modal n'existe pas !");
        return;
    }

    modalgallery.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        setFigure(data[i], modalgallery, true); // true = ajoute l'icône poubelle
    }
}


const openModal = function (e) {
    e.preventDefault();
    modal = document.querySelector(e.target.getAttribute("href"));

    const premiereModal = modal.querySelector(".premieremodal");
    const secondModal = modal.querySelector(".second-modal");
    if (premiereModal && secondModal) {
        premiereModal.style.display = "block";
        secondModal.style.display = "none";
    }

    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(":focus")
    focusables[0].focus();
    modal.style.display = "flex";
    modal.removeAttribute('aria-hidden');
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal); 
    modal.querySelectorAll(".js-modal-close").forEach(button => {
        button.addEventListener("click", closeModal);
    });
    modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
    createModalGallery(works);
}




const closeModal = function (e) {
    if (modal === null) return
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus()
    e.preventDefault()
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
    modal = null;
}

const stopPropagation = function (e) {
    e.stopPropagation()
}

const focusInModal = function (e) {
    e.preventDefault()
    let index = focusables.findIndex(f => f === modal.querySelector(":focus"))
    if (e.shiftKey === true){
        index--
    } else {
        index++
    }
    index++ 
    if (index >=  focusables.length) {
        index = 0
    }
    if (index < 0) {
        index = focusables - 1
    }
    focusables[index].focus()
}



document.querySelectorAll(".js-modal").forEach(a => {
    a.addEventListener("click", openModal)
    
})

window.addEventListener("keydown", function(e){
    if (e.key === "Escape" || e.key === "esc") {
        closeModal(e)
    }
    if (e.key === "tab" && modal !== null) {
        focusInModal(e)
    }
})



// toggle function  

const addPhotoButton = document.querySelector(".open-second-modal")
const backButton = document.querySelector(".back-modal")

addPhotoButton.addEventListener("click", toggleModal)
backButton.addEventListener("click", toggleModal)

function toggleModal() {
    const premiereModal = document.querySelector(".premieremodal")
    const secondModal = document.querySelector(".second-modal")

    if (
        premiereModal.style.display === "block" ||
        premiereModal.style.display === ""
    ) {
        premiereModal.style.display = "none"
        secondModal.style.display = "block"
    } else {
        premiereModal.style.display = "block"
        secondModal.style.display = "none"
    }
}

// add photo input


document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = document.createElement("img");
            img.src = e.target.result; 
            img.alt = "Uploaded Photo";
            img.style.maxWidth = "200px";
            document.getElementById("photo-container").appendChild(img);
            document.querySelector(".add-picture-button").style.display = "none";
        };

        reader.readAsDataURL(file);
    } else {
        alert("Veuillez sélectionner une image au format JPG ou PNG.");
    }
});


 
document.getElementById("addPicture").addEventListener("click", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les champs du formulaire
    const fileInput = document.getElementById("fileInput");
    const titleInput = document.getElementById("title");
    const categoryInput = document.getElementById("category");
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
        errorMessage.textContent = "Projet ajouté avec succès !";
        errorMessage.style.color = "green";
    }
    
    // Vérification des champs
    if (!fileInput.files[0] || !titleInput.value || !categoryInput.value) {
        errorMessage.textContent = "Veuillez remplir tous les champs et ajouter une image.";
        errorMessage.style.color = "red";
        return;
    }



    // Création d'un objet FormData
    const formData = new FormData();
    formData.append("image", fileInput.files[0]); // Fichier
    formData.append("title", titleInput.value); // Titre
    formData.append("category", categoryInput.value); // Catégorie

    try {

        // Envoi de la requête POST
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("authToken") // Token d'authentification
            },
            body: formData, // Utilisation de FormData
        });

        // Vérification de la réponse
        if (!response.ok) {
            throw new Error(`Erreur lors de l’envoi du projet. Statut : ${response.status}`);
        }

        const newProject = await response.json();
        works.push(newProject);
        addProjectToGallery(newProject);

        function addProjectToGallery(project) {
            const gallery = document.querySelector(".gallery");
            if (!gallery) {
                console.error("Erreur : La galerie principale n'existe pas !");
                return;
            }
            const figure = document.createElement("figure");
            figure.classList.add("figure-work-" + project.id);
            const img = document.createElement("img");
            img.src = project.imageUrl;
            img.alt = project.title;
            const figcaption = document.createElement("figcaption");
            figcaption.textContent = project.title;
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        }
        

        

        // Réinitialiser le formulaire
        document.getElementById("photoForm").reset();
        errorMessage.textContent = "Projet ajouté avec succès !";
        errorMessage.style.color = "green"; 
        document.querySelector(".add-picture-button").style.display = "flex";
        document.querySelector("#photo-container").style.display = "none";

    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
        errorMessage.style.color = "red";
    }
});
