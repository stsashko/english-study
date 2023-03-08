export interface IWordSentence {
    id: number
    name: string
    transcription: string
    translation: string
    sentenceText: string
    sentenceTranslation: string
    transcriptionList: string[]
    sentenceTextList: string[]
    sentenceTranslationList: string[]
}

export interface IWordMultiple {
    name: string
    transcription: string
    translation: string
    sentenceText: string
    sentenceTranslation: string
}