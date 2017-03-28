module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
    "rules": {
      // Class names are Pascal
      // Function and Object names are Camel
      // Attribute and Cariable names are Snake
      "camelcase": [0, { "properties": "never" }],
      // Sometimes arrays and hashes could be copied to JSON files or a different language.
      // Disallowing dangling commas will prevent errors in these cases.
      "comma-dangle": ["error", "never"],
      // We denote privates and reserved values with a leading _.
      "no-underscore-dangle": [0]
    }
};
