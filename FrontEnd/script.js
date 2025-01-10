let works;
const galleryhtml = document.querySelector(".gallery");

async function getWorks(){
    const response = await fetch("http://localhost:5678/api/works");
        if(response.ok){
            works = await response.json();
            createGallery(works);
        }
}

function createGallery(data){
        galleryhtml.innerHTML = "";
    for (let i = 0; i < data.length; i++){
        setFigure(data[i]);
    }

}

getWorks();

function setFigure(data) {
    const figure = document.createElement("figure");
    figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
                        <figcaption>${data.title}</figcaption>` ;

    galleryhtml.append(figure);
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
    works.forEach(work => setFigure(work));
})
document.querySelector(".filtres").appendChild(allButton)

