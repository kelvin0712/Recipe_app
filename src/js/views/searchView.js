import { elements } from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = "";
};

export const clearResult = () => {
  elements.searchResList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
  const resultArr = Array.from(document.querySelectorAll(".results__link"));
  resultArr.forEach(el => el.classList.remove("results__link--active"));
  document
    .querySelector(`.results__link[href*="${id}"]`)
    .classList.add("results__link--active");
};

// pasta with tomato
/**
 * acc: 0 / acc + current.length = 5 / newTitle = ['pasta', ]
 * acc: 5 / acc + current.length = 9 / newTitle = ['pasta', 'with']
 * acc: 9 / acc + current.length = 17 / newTitle = ['pasta', 'with']
 */

export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, current) => {
      if (acc + current.length <= limit) {
        newTitle.push(current);
      }
      return acc + current.length;
    }, 0);
    // return result
    return `${newTitle.join(" ")} ...`;
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const createButton = (page, type) =>
  `
    <button class="btn-inline results__btn--${type}" data-goto=${
    type === "prev" ? page - 1 : page + 1
  }>
  <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${
              type === "prev" ? "left" : "right"
            }"></use>
        </svg>
        
 `;

const renderButton = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;
  if (page === 1 && pages > 1) {
    button = createButton(page, "next");
  } else if (page === pages && pages > 1) {
    button = `${createButton(page, "prev")}
              ${createButton(page, "next")}`;
  } else if (page < pages) {
    button = createButton(page, "prev");
  }

  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);
  renderButton(page, recipes.length, resPerPage);
};
