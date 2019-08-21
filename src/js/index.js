import Search from "./models/Search";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likeView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Like from "./models/Like";

/**
 * - search object
 * current recipe object
 * shopping list
 * liked recipe
 */
const state = {};

const controlSearch = async () => {
  // get the query from view
  const query = searchView.getInput();

  if (query) {
    // create new search object and add to state
    state.search = new Search(query);

    // prepare UI for result
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.resultsField);

    // search for recipe
    try {
      await state.search.getResult();

      // render result on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      console.log(error);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * Recipe Controller
 */

const controlRecipe = async () => {
  // get ID from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    // prepare UI for changes

    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // highlight selected search item
    if (state.search) {
      searchView.highlightSelected(id);
    }

    //create new Recipe Object
    state.recipe = new Recipe(id);
    // get Recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calc time and serving
      state.recipe.calcTime();
      state.recipe.calcServing();

      //render recipe
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      clearLoader();
    } catch (error) {
      console.log(error);
    }
  }
};

/**
 * LIST Controller
 */

const controlList = () => {
  // create a new list
  if (!state.list) state.list = new List();

  //add each ingredient to list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

/**
 * LIKE CONTROLLER
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Like();

  const currentID = state.recipe.id;

  // user not like current recipe yet
  if (!state.likes.isLiked(currentID)) {
    // Add like to state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // toggle like button
    likeView.toggleLikeButton(true);

    // Add like to the UI list

    // user likes current recipe yet
    likeView.renderLike(newLike);
  } else {
    // remove Like from state
    state.likes.deleteLike(currentID);
    // toggle Like button
    likeView.toggleLikeButton(false);
    //remove from UI list
    likeView.deleteLike(currentID);
  }

  likeView.toggleLikeMenu(state.likes.getNumLikes());
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

// restore like recipe when the page load
window.addEventListener("load", () => {
  state.likes = new Like();
  state.likes.readStorage();
  likeView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(el => likeView.renderLike(el));
});

// handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServing("dec");
      recipeView.updateServingIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.recipe.updateServing("inc");
    recipeView.updateServingIngredients(state.recipe);
  } else if (e.target.matches(".recipe__button--add, .recipe__button--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // like controller
    controlLike();
  }
});

// handle delete and update list item
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // handle delete button
  if (e.target.matches("shopping__delete, .shopping__delete *")) {
    // delete from state
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);

    // handle count update
  } else if (e.target.matches(".shopping__count-value")) {
    if (state.list.count > 1) {
      const val = parseFloat(e.target.value, 10);
      state.list.updateCount(id, val);
    }
  }
});
