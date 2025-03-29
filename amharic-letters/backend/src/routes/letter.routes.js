import { Router } from "express";
import { LetterController } from "../controllers/letter.controller.js";

const LetterRoute = Router();

/**
 * @route POST /api/letter/create
 * @description Create a post
 */
LetterRoute.post("/create", LetterController.createLetter);

/**
 * @route GET /api/letter/count/:name
 * @description Gets count of :name letter.
 */
LetterRoute.get("/count/:name", LetterController.getLetterCountByName);

/**
 * @route GET /api/letter/all
 * @description Get all letters
 */
LetterRoute.get("/all", LetterController.getAllLetters);

/**
 * @route GET /api/letter/grouped-by-name
 * @description Retrieve letters grouped by their name
 */
LetterRoute.get("/grouped-by-name", LetterController.getLettersGroupedByName);

/**
 * @route GET /api/letter/grouped-by-family
 * @description Retrieve letters grouped by their family
 */
LetterRoute.get(
  "/grouped-by-family",
  LetterController.getLettersGroupedByFamily
);

export default LetterRoute;
