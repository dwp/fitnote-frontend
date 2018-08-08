/**
* I18n utilities.
*
* When this module is first required, be sure to invoke with the directories
* and list of supported locales, e.g:
*   const I18n = require('govuk-casa/lib/I18n')(localeDirs, supportedLocales);
*
* This essentially iniialises the I18n singleton object.
*
* Thereafter, subsequent requires may be carried out with no params, e.g:
*   const I18n = require('govuk-casa/lib/I18n')();
*/

const npath = require('path');
const fs = require('fs');

const LOCALE_DATA = {};

/**
* Translator class.
*/
class Translator {
    /**
    * Constructor.
    *
    * @param  {string} lang Language to use for all translations
    */
    constructor(lang) {
        if (typeof lang !== 'string') {
            throw new TypeError('Translator must be instantiated with a language');
        }
        this.language = lang;
    }

    /**
    * Retrieve the language.
    *
    * @return {string} Language code
    */
    getLanguage() {
        return this.language;
    }

    /**
    * Translate string.
    *
    * The replacements can be primitives, a function or a object containing such
    * values. For example, the following are all valid:
    *   t('Hello, %s', 'World') = Hello, World
    *   t('Pay £${fee}', {fee:100}) = Pay £100
    *
    * @param  {string} key String to translate
    * @param  {...mixed} subs Replacements
    * @return {string} Translated string
    */
    t(key, ...subs) {
        const k = (key || '').split(':');
        let str = key;
        if (typeof LOCALE_DATA[this.language][k[0]] !== 'undefined') {
            str = typeof LOCALE_DATA[this.language][k[0]][k[1]] === 'undefined' ?
                key :
                LOCALE_DATA[this.language][k[0]][k[1]];
        }

        subs.forEach((sub) => {
            if (typeof sub === 'object') {
                Object.keys(sub).forEach((k) => {
                    str = str.replace(new RegExp('\\$\\{' + k + '\\}'), sub[k]);
                });
            } else if (typeof sub === 'function') {
                throw new Error('Function substitions are not yet supported');
            } else {
                str = str.replace(/\%s/, sub);
            }
        });

        return str;
    }
}

module.exports = function(localeDirs, supportedLocales) {
    /**
    * Flattens a JSON object structure into a "flat" object indexed by paths in a
    * dot-notation. For example, calling `flatten()` on the structure ...
    *  {
    *    "person": {
    *      "title": {
    *        "label": "Miss"
    *      }
    *    }
    *  }
    *
    * ... results in the new object, written to `tgt`:
    *  {
    *    "person.title.label": "Miss"
    *  }
    *
    * @param  {string} path Current path (used by recursive element)
    * @param  {object} src Source object to flatten
    * @param  {object} tgt Object into which the resulting data is written
    */
    function flatten(path, src, tgt) {
        Object.keys(src).forEach(function(key) {
            const npath = path ? [path, key].join('.') : key;
            if (typeof src[key] === 'object') {
                flatten(npath, src[key], tgt);
            } else {
                tgt[npath] = src[key];
            }
        });
    }

    /**
    * Load the locale into the `LOCALE_DATA` object.
    *
    * @param  {string} locale Locale to load (e.g. "en")
    * @return {void}
    */
    function loadLocale(locale) {
        try {
            LOCALE_DATA[locale] = {};
            localeDirs.forEach(function(localeDir) {
                const langDir = npath.resolve(localeDir, locale);
                if (fs.existsSync(langDir)) {
                    logger.info(`Loading ${locale} locale from ${langDir} ...`);
                    fs.readdirSync(langDir).forEach(function(file) {
                        const ns = npath.basename(file, '.json');
                        if (typeof LOCALE_DATA[locale][ns] === 'undefined') {
                            LOCALE_DATA[locale][ns] = {};
                        }

                        // Load file and strip newlines out, otherwise JSON.parse will fail.
                        // Newlines may be in the file to make them more readable during
                        // content creation, but they are invalid in JSON.
                        let json = fs.readFileSync(npath.resolve(langDir, file), 'utf8');
                        json = json.replace(/[\r\n]/g, '');
                        json = JSON.parse(json);
                        flatten(null, json, LOCALE_DATA[locale][ns]);
                    });
                }
            });
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    // Load data for all supported locales
    if (!Array.isArray(supportedLocales) || !supportedLocales.length) {
        throw new Error('You must define at least one supported locale');
    }
    supportedLocales.forEach(function(l) {
        loadLocale(l);
    });

    return {
        Translator : Translator
    };
};
