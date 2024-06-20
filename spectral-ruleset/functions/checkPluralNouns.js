export default (path) => {

    const EXCEPTIONS = [
        'me',
        '.*'
      ];

    const kebabCase = (str) => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

    const isPlural = (word) => {
        // Cover some common irregular plural forms
        const irregularNouns = {
            'child': 'children',
            'person': 'people',
            'man': 'men',
            'woman': 'women',
            'tooth': 'teeth',
            'goose': 'geese',
            'mouse': 'mice',
            'cactus': 'cacti',
            'focus': 'foci',
            'fungus': 'fungi',
            'nucleus': 'nuclei',
            'syllabus': 'syllabi',
            'phenomenon': 'phenomena',
            'criterion': 'criteria',
        };
        let singularForm = word;

        // Look for an irregular plural form
        for (let singular in irregularNouns) {
            if (irregularNouns[singular] === word.toLowerCase()) {
                singularForm = singular;
            }
        }

        // Check for regular plural forms
        if (singularForm === word) {
            if (word.endsWith('es')) {
                singularForm = word.slice(0, -2);
            }
            else if (word.endsWith('s')) {
                singularForm = word.slice(0, -1);
            }
        }

        // Compare the singular form to the input word
        return singularForm !== word;
    }

    const pathComponents = path.split('/');
    // eslint-disable-next-line no-restricted-syntax
    for (const component of pathComponents) {
      if (!component) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const componentWords = kebabCase(component).split('-');
      const lastComponentWord = componentWords[componentWords.length - 1];
      if (!EXCEPTIONS.includes(lastComponentWord) && !component.match(/^{[a-z-A-Z0-9]+}$/) && !isPlural(lastComponentWord)) {
        return [{
          message: `"${component}" is not a plural noun`,
        }];
      }
    }
  };
