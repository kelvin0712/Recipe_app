import axios from "axios";
import { key } from "../config";
import { inherits } from "util";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const period = Math.ceil(numIng / 3);
    this.time = period * 3;
  }

  calcServing() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds"
    ];
    const unitShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound"
    ];

    const units = [...unitShort, "kg", "g"];

    const newIngredients = this.ingredients.map(el => {
      // Uniform Unit
      let ingredient = el.toLowerCase();
      unitLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, units[i]);
      });
      // Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      // parse ingredients into count, unit and ingredients
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex(el1 => units.includes(el1));

      let objIng;
      if (unitIndex > -1) {
        // there is a unit
        const arrCount = arrIng.slice(0, unitIndex); // 4 1/2 cup => [4, 1/2]
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        //there is no unit but the 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        // there is no unit and no number in the 1st position
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServing(type) {
    // servings
    const newServing = type === "dec" ? this.servings - 1 : this.servings + 1;

    // ingredients

    this.ingredients.forEach(el => {
      el.count = el.count * (newServing / this.servings);
    });

    this.servings = newServing;
  }
}
