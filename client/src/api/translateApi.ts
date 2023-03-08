import axios from "axios";

const PATH = {
    wordDefinitions: 'word-definitions.p.rapidapi.com',
    translatePlus: 'translate-plus.p.rapidapi.com',
    twinWordWordGraphDictionary: 'twinword-word-graph-dictionary.p.rapidapi.com',
    AITranslate: 'ai-translate.p.rapidapi.com'
}

interface ITranslate {
    wordNative: string
    wordTranslate: string
    examples:{
        native: string
        translate: string
    }[]
}

interface ITranslatePlus {
    wordNative: '',
    wordTranslate: '',
    examples: string[],
}

interface IAITranslateApi {
    native: string
    translate: string
}

const dictionaryApiDev = async (rapidApiKey:string, word: string): Promise<string[] | undefined> => {
    try {
        const phonetics: string[] = [];
        const {data} = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        if (data?.[0]) {
            if (data?.[0]?.phonetic)
                phonetics.push(data?.[0]?.phonetic.replaceAll('/', '').trim());
            if (data?.[0]?.phonetics && data?.[0]?.phonetics.length > 0)
                data?.[0]?.phonetics.forEach((el: any) => {
                    if (el?.text)
                        phonetics.push(el.text.replaceAll('/', '').trim());
                });
        }
        return phonetics;
    } catch (e) {

    }
}

const wordDefinitionsApi = async (rapidApiKey:string, word: string): Promise<string[] | undefined> => {
    try {
        const phonetics: string[] = [];

        let {data} = await axios.get(`https://${PATH.wordDefinitions}/v2/`, {
            params: {action: 'getDefinition', word: word},
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': PATH.wordDefinitions
            }
        });

        if (data?.message?.definition?.[0]) {
            if (data?.message?.definition[0].phonetic)
                phonetics.push(data.message.definition[0].phonetic.replaceAll('/', '').trim());

            if (data.message.definition[0]?.phonetics && data.message.definition[0].phonetics.length > 0)
                data.message.definition[0].phonetics.forEach((el: any) => {
                    if (el?.text)
                        phonetics.push(el.text.replaceAll('/', '').trim());
                });
        }

        return phonetics;
    } catch (e) {

    }
}

const delay = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}

export const getPhoneticsApi = async (rapidApiKey:string, word: string): Promise<string[]> => {
    try {
        let words = word.replaceAll(/\s+/g, ' ').trim().split(' ');

        let fullWord = [];
        let resultData:string[] = [];

        for (const w of words) {
            let phonetics = await dictionaryApiDev(rapidApiKey, w);
            if (typeof phonetics !== 'undefined' && !phonetics.length) {
                phonetics = await wordDefinitionsApi(rapidApiKey, w);
            }

            if(typeof phonetics !== 'undefined')
            {
                if(words.length > 1) {
                    fullWord.push(phonetics[0]);
                    await delay();
                }
                else
                    resultData = phonetics;
            }
        }

        if(fullWord.length)
            resultData.push(fullWord.join(' '));

        return resultData.length ? resultData.map((item: string) => item.replaceAll('ɹ', 'r').replaceAll('d͡ʒ', 'dʒ').replaceAll(/\.|ˌ|/g, '')).filter((value, index, self) => self.indexOf(value) === index) : [];

    } catch (e) {
        return [];
    }
}


const translatePlusApi = async (rapidApiKey:string, word: string): Promise<ITranslatePlus | undefined> => {
    const translate:ITranslatePlus = {
        wordNative: '',
        wordTranslate: '',
        examples: [],
    };

    try {
        let {data} = await axios.post(`https://${PATH.translatePlus}/translate`, {
            text: word,
            source: "en",
            target: "uk"
        }, {
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': PATH.translatePlus
            }
        });

        if(data?.translations?.text && data?.translations?.translation) {
            translate.wordNative = data.translations.text;
            translate.wordTranslate = data.translations.translation;
        }

        if (data?.details?.examples && data.details.examples.length > 0)
            translate.examples = data.details.examples.map((i: any) => i.replaceAll(/\<\/?b\>/ig, ''));

        return translate;
    } catch (e) {

    }
}

const twinWordWordGraphDictionary = async (rapidApiKey:string, word: string):Promise<string[] | []> => {
    try {
        const {data} =  await axios.get(`https://${PATH.twinWordWordGraphDictionary}/example/`, {
            params: {entry: word},
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': PATH.twinWordWordGraphDictionary
            }
        })
        if(data?.example && data.example.length > 0)
            return data.example;
    } catch (e) {

    }
    return [];
}

const AITranslateApi = async (rapidApiKey:string, examples: string[]):Promise<IAITranslateApi[] | []> => {
    const translate:IAITranslateApi[] = [];

    if(!examples.length)
        return [];

    try {
        let {data} = await axios.post(`https://${PATH.AITranslate}/translates`, {
            texts: examples,
            "tls": ["uk"],
            "sl": "en"
        }, {
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': PATH.AITranslate
            }
        });

        let examplesTranslate: string[] = [];

        if(data?.[0]?.texts)
            examplesTranslate = data[0].texts;

        if(examplesTranslate.length === examples.length) {
            examples.forEach((item: string, index: number) => {
                let native = item.charAt(0).toUpperCase() + item.slice(1) + (/.+(\.|\?)$/.test(item) !== true ? '.' : '');
                translate.push({
                    native,
                    translate: examplesTranslate[index].charAt(0).toUpperCase() + examplesTranslate[index].slice(1).replace(/(\?|\.)$/, '') + native.slice(-1)
                });
            });
        }
    } catch (e) {
    }



    return translate;

    // return translate.map(item => ({
    //     native: '',
    //     translate: ''
    // }));
}

export const getTranslate = async (rapidApiKey:string, word: string): Promise<ITranslate | undefined> => {
    const translateData:ITranslate = {
        wordNative: '',
        wordTranslate: '',
        examples:[]
    }

    try {
        const translate:ITranslatePlus | undefined = await translatePlusApi(rapidApiKey, word);

        if(typeof translate !== 'undefined')
        {
            translateData.wordNative = translate.wordNative;
            translateData.wordTranslate = translate.wordTranslate;

            const examples: string[] = await twinWordWordGraphDictionary(rapidApiKey, word);
            if(translate.examples.length > 0 && examples.length)
                translate.examples = [
                    ...translate.examples,
                    ...examples
                ].map((i: any) => i.replaceAll(/\<\/?b\>/ig, ''));

            let examplesRes = await AITranslateApi(rapidApiKey, translate.examples.filter((value, index, self) => self.indexOf(value) === index));
            if(examplesRes.length)
                translateData.examples = examplesRes;

            return translateData;
        }
    } catch (e) {

    }
}