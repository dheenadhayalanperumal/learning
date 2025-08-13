import { describe, it, expect } from 'vitest'
import {
  tamilVowels,
  tamilConsonants,
  englishCapitalLetters,
  englishSmallLetters,
  letterTypes,
  getLettersForType,
  getTitleForLetterType,
  getFontForLetterType,
  getColorForLetterType,
  getLetterSize
} from '../../data/letters.js'

describe('Letters Data Module', () => {
  describe('Tamil Vowels', () => {
    it('should have 12 vowels', () => {
      expect(tamilVowels).toHaveLength(12)
    })

    it('should have correct structure for each vowel', () => {
      tamilVowels.forEach(vowel => {
        expect(vowel).toHaveProperty('letter')
        expect(vowel).toHaveProperty('transliteration')
        expect(vowel).toHaveProperty('audio')
        expect(typeof vowel.letter).toBe('string')
        expect(typeof vowel.transliteration).toBe('string')
        expect(typeof vowel.audio).toBe('string')
      })
    })

    it('should have unique letters', () => {
      const letters = tamilVowels.map(v => v.letter)
      const uniqueLetters = [...new Set(letters)]
      expect(uniqueLetters).toHaveLength(letters.length)
    })

    it('should have audio paths in correct format', () => {
      tamilVowels.forEach(vowel => {
        expect(vowel.audio).toMatch(/^\/audio\/tamil\/.*\.mp3$/)
      })
    })
  })

  describe('Tamil Consonants', () => {
    it('should have 18 consonants', () => {
      expect(tamilConsonants).toHaveLength(18)
    })

    it('should have correct structure for each consonant', () => {
      tamilConsonants.forEach(consonant => {
        expect(consonant).toHaveProperty('letter')
        expect(consonant).toHaveProperty('transliteration')
        expect(consonant).toHaveProperty('audio')
      })
    })

    it('should have unique letters', () => {
      const letters = tamilConsonants.map(c => c.letter)
      const uniqueLetters = [...new Set(letters)]
      expect(uniqueLetters).toHaveLength(letters.length)
    })
  })

  describe('English Capital Letters', () => {
    it('should have 26 letters', () => {
      expect(englishCapitalLetters).toHaveLength(26)
    })

    it('should be in alphabetical order', () => {
      const letters = englishCapitalLetters.map(l => l.letter)
      const expectedOrder = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      expect(letters).toEqual(expectedOrder)
    })

    it('should have correct audio paths', () => {
      englishCapitalLetters.forEach(letter => {
        expect(letter.audio).toMatch(/^\/audio\/english\/.*\.mp3$/)
      })
    })
  })

  describe('English Small Letters', () => {
    it('should have 26 letters', () => {
      expect(englishSmallLetters).toHaveLength(26)
    })

    it('should be in alphabetical order', () => {
      const letters = englishSmallLetters.map(l => l.letter)
      const expectedOrder = 'abcdefghijklmnopqrstuvwxyz'.split('')
      expect(letters).toEqual(expectedOrder)
    })

    it('should have correct audio paths', () => {
      englishSmallLetters.forEach(letter => {
        expect(letter.audio).toMatch(/^\/audio\/english\/.*-small\.mp3$/)
      })
    })
  })

  describe('Letter Types Configuration', () => {
    it('should have all four letter types', () => {
      expect(letterTypes).toHaveProperty('uyir')
      expect(letterTypes).toHaveProperty('uyirMei')
      expect(letterTypes).toHaveProperty('englishCapital')
      expect(letterTypes).toHaveProperty('englishSmall')
    })

    it('should have correct structure for each type', () => {
      Object.values(letterTypes).forEach(type => {
        expect(type).toHaveProperty('id')
        expect(type).toHaveProperty('title')
        expect(type).toHaveProperty('subtitle')
        expect(type).toHaveProperty('color')
        expect(type).toHaveProperty('letters')
        expect(type).toHaveProperty('font')
        expect(Array.isArray(type.letters)).toBe(true)
      })
    })

    it('should have unique colors for each type', () => {
      const colors = Object.values(letterTypes).map(type => type.color)
      const uniqueColors = [...new Set(colors)]
      expect(uniqueColors).toHaveLength(colors.length)
    })

    it('should have correct letter counts', () => {
      expect(letterTypes.uyir.letters).toHaveLength(12)
      expect(letterTypes.uyirMei.letters).toHaveLength(18)
      expect(letterTypes.englishCapital.letters).toHaveLength(26)
      expect(letterTypes.englishSmall.letters).toHaveLength(26)
    })
  })

  describe('Helper Functions', () => {
    describe('getLettersForType', () => {
      it('should return correct letters for valid types', () => {
        expect(getLettersForType('uyir')).toEqual(tamilVowels)
        expect(getLettersForType('uyirMei')).toEqual(tamilConsonants)
        expect(getLettersForType('englishCapital')).toEqual(englishCapitalLetters)
        expect(getLettersForType('englishSmall')).toEqual(englishSmallLetters)
      })

      it('should return empty array for invalid types', () => {
        expect(getLettersForType('invalid')).toEqual([])
        expect(getLettersForType(null)).toEqual([])
        expect(getLettersForType(undefined)).toEqual([])
      })
    })

    describe('getTitleForLetterType', () => {
      it('should return correct titles for valid types', () => {
        expect(getTitleForLetterType('uyir')).toBe('உயிர் எழுத்து')
        expect(getTitleForLetterType('uyirMei')).toBe('மெய் எழுத்து')
        expect(getTitleForLetterType('englishCapital')).toBe('English Capital')
        expect(getTitleForLetterType('englishSmall')).toBe('English Small')
      })

      it('should return empty string for invalid types', () => {
        expect(getTitleForLetterType('invalid')).toBe('')
        expect(getTitleForLetterType(null)).toBe('')
        expect(getTitleForLetterType(undefined)).toBe('')
      })
    })

    describe('getFontForLetterType', () => {
      it('should return Tamil fonts for Tamil letter types', () => {
        const tamilFont = 'serif, "Tamil Sangam MN", "Tamil MN", "Noto Sans Tamil", Arial, sans-serif'
        expect(getFontForLetterType('uyir')).toBe(tamilFont)
        expect(getFontForLetterType('uyirMei')).toBe(tamilFont)
      })

      it('should return English fonts for English letter types', () => {
        const englishFont = 'Arial, "Helvetica Neue", Helvetica, sans-serif'
        expect(getFontForLetterType('englishCapital')).toBe(englishFont)
        expect(getFontForLetterType('englishSmall')).toBe(englishFont)
      })

      it('should return default font for invalid types', () => {
        expect(getFontForLetterType('invalid')).toBe('Arial, sans-serif')
      })
    })

    describe('getColorForLetterType', () => {
      it('should return correct colors for valid types', () => {
        expect(getColorForLetterType('uyir')).toBe('#4caf50')
        expect(getColorForLetterType('uyirMei')).toBe('#2196f3')
        expect(getColorForLetterType('englishCapital')).toBe('#ff9800')
        expect(getColorForLetterType('englishSmall')).toBe('#9c27b0')
      })

      it('should return default color for invalid types', () => {
        expect(getColorForLetterType('invalid')).toBe('#4caf50')
      })
    })

    describe('getLetterSize', () => {
      it('should return smaller size for oversized letters', () => {
        const baseSize = 100
        const oversizedLetters = ['ஒ', 'ஔ', 'ம', 'ழ', 'W', 'M']
        
        oversizedLetters.forEach(letter => {
          expect(getLetterSize(letter, baseSize)).toBe(85)
        })
      })

      it('should return larger size for undersized letters', () => {
        const baseSize = 100
        const undersizedLetters = ['இ', 'ஈ', 'உ', 'ஊ', 'I', 'l']
        
        undersizedLetters.forEach(letter => {
          expect(getLetterSize(letter, baseSize)).toBe(110)
        })
      })

      it('should return base size for normal letters', () => {
        const baseSize = 100
        const normalLetters = ['அ', 'A', 'a', 'க', 'B', 'b']
        
        normalLetters.forEach(letter => {
          expect(getLetterSize(letter, baseSize)).toBe(baseSize)
        })
      })

      it('should handle different base sizes correctly', () => {
        expect(getLetterSize('ம', 50)).toBe(43) // 50 * 0.85 rounded
        expect(getLetterSize('இ', 50)).toBe(55) // 50 * 1.1 rounded
        expect(getLetterSize('அ', 50)).toBe(50)
      })
    })
  })

  describe('Data Integrity', () => {
    it('should not have overlapping letters between Tamil vowels and consonants', () => {
      const vowelLetters = new Set(tamilVowels.map(v => v.letter))
      const consonantLetters = new Set(tamilConsonants.map(c => c.letter))
      
      const intersection = [...vowelLetters].filter(letter => consonantLetters.has(letter))
      expect(intersection).toHaveLength(0)
    })

    it('should not have overlapping letters between English capital and small', () => {
      const capitalLetters = new Set(englishCapitalLetters.map(l => l.letter))
      const smallLetters = new Set(englishSmallLetters.map(l => l.letter))
      
      const intersection = [...capitalLetters].filter(letter => smallLetters.has(letter))
      expect(intersection).toHaveLength(0)
    })

    it('should have valid hex colors', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/
      
      Object.values(letterTypes).forEach(type => {
        expect(type.color).toMatch(hexColorRegex)
      })
    })
  })
})