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
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(":focus")
    focusables[0].focus()
    modal.style.display = "flex";
    modal.removeAttribute('aria-hidden');
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal) ; 
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal) ;
    modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation) ;
    createModalGallery(works)
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
    } else {
        console.error("Erreur lors de la suppression du travail");
    }
    
}


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

