import Letter from "../models/letter.model.js";

export class LetterController {
  static createLetter = async (req, res) => {
    try {
      const { name, family, position, rank, translation, image } = req.body;
      if (!(name && family && position && rank && translation && image)) {
        console.log(req.body);
        return res
          .status(400)
          .json({
            message:
              "All fields (name, family, position, rank, translation, image) are required.",
          });
      }

      const newLetter = new Letter({
        name,
        family,
        position,
        rank,
        family,
        translation,
        image,
      });
      await newLetter.save();

      res
        .status(201)
        .json({ message: "Letter added successfully", data: newLetter });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  static getLetterCountByName = async (req, res) => {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({ message: "Name parameter is required." });
      }

      const count = await Letter.countDocuments({ name });

      res.status(200).json({ message: "Count retrieved successfully", count });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  static getAllLetters = async (req, res) => {
    try {
      const letters = await Letter.find();

      res
        .status(200)
        .json({ message: "Letters retrieved successfully", data: letters });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  static getLettersGroupedByName = async (req, res) => {
    try {
      const groupedLetters = await Letter.aggregate([
        {
          $group: {
            _id: "$name",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            name: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      res
        .status(200)
        .json({
          message: "Letters grouped by name retrieved successfully",
          data: groupedLetters,
        });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  static getLettersGroupedByFamily = async (req, res) => {
    try {
      const groupedLetters = await Letter.aggregate([
        {
          $group: {
            _id: "$family",
            letters: {
              $addToSet: {
                name: "$name",
                position: "$position",
                family: "$family",
                rank: "$rank",
                translation: "$translation",
              },
            },
          },
        },
        {
          $project: {
            family: "$_id",
            letters: {
              $sortArray: { input: "$letters", sortBy: { position: 1 } },
            },
            _id: 0,
            rank: { $min: "$letters.rank" },
          },
        },
        {
          $sort: { rank: 1 },
        },
      ]);

      res
        .status(200)
        .json({
          message: "Letters grouped by family retrieved successfully",
          data: groupedLetters,
        });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
}
