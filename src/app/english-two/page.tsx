'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Trophy, Volume2, Eye, EyeOff, Home as HomeIcon, RotateCcw, Play, BookOpen } from 'lucide-react';

// Import vocabulary data - you can move this to a separate file
import vocabulary from '../vocabularyData';

interface VocabularyWord {
    word: string;
    translation: string;
    level: number;
    category: string;
}

const VocabularyTest = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [knownWords, setKnownWords] = useState(new Set());
    const [unknownWords, setUnknownWords] = useState(new Set());
    const [showTranslation, setShowTranslation] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [filterLevel, setFilterLevel] = useState('all');
    const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([]);

    // 1000 common English words - abbreviated for demo, expand to full list
    // const vocabulary = [
    //     // Level 1 - 250 most common words
    //     { word: 'the', translation: 'определителен член', level: 1, category: 'grammar' },
    //     { word: 'be', translation: 'съм, бъда', level: 1, category: 'verb' },
    //     { word: 'and', translation: 'и', level: 1, category: 'grammar' },
    //     { word: 'of', translation: 'от, на', level: 1, category: 'grammar' },
    //     { word: 'a', translation: 'един', level: 1, category: 'grammar' },
    //     { word: 'to', translation: 'към, до', level: 1, category: 'grammar' },
    //     { word: 'in', translation: 'в', level: 1, category: 'grammar' },
    //     { word: 'have', translation: 'имам', level: 1, category: 'verb' },
    //     { word: 'I', translation: 'аз', level: 1, category: 'pronoun' },
    //     { word: 'it', translation: 'то', level: 1, category: 'pronoun' },
    //     { word: 'for', translation: 'за', level: 1, category: 'grammar' },
    //     { word: 'not', translation: 'не', level: 1, category: 'grammar' },
    //     { word: 'on', translation: 'на', level: 1, category: 'grammar' },
    //     { word: 'with', translation: 'с, със', level: 1, category: 'grammar' },
    //     { word: 'he', translation: 'той', level: 1, category: 'pronoun' },
    //     { word: 'as', translation: 'като', level: 1, category: 'grammar' },
    //     { word: 'you', translation: 'ти, вие', level: 1, category: 'pronoun' },
    //     { word: 'do', translation: 'правя', level: 1, category: 'verb' },
    //     { word: 'at', translation: 'на, в', level: 1, category: 'grammar' },
    //     { word: 'this', translation: 'този, това', level: 1, category: 'pronoun' },
    //     { word: 'but', translation: 'но', level: 1, category: 'grammar' },
    //     { word: 'his', translation: 'негов', level: 1, category: 'pronoun' },
    //     { word: 'by', translation: 'от, при', level: 1, category: 'grammar' },
    //     { word: 'from', translation: 'от', level: 1, category: 'grammar' },
    //     { word: 'they', translation: 'те', level: 1, category: 'pronoun' },
    //     { word: 'we', translation: 'ние', level: 1, category: 'pronoun' },
    //     { word: 'say', translation: 'казвам', level: 1, category: 'verb' },
    //     { word: 'her', translation: 'нейн', level: 1, category: 'pronoun' },
    //     { word: 'she', translation: 'тя', level: 1, category: 'pronoun' },
    //     { word: 'or', translation: 'или', level: 1, category: 'grammar' },
    //     { word: 'an', translation: 'един', level: 1, category: 'grammar' },
    //     { word: 'will', translation: 'ще', level: 1, category: 'verb' },
    //     { word: 'my', translation: 'мой', level: 1, category: 'pronoun' },
    //     { word: 'one', translation: 'един', level: 1, category: 'number' },
    //     { word: 'all', translation: 'всички', level: 1, category: 'pronoun' },
    //     { word: 'would', translation: 'бих, би', level: 1, category: 'verb' },
    //     { word: 'there', translation: 'там', level: 1, category: 'adverb' },
    //     { word: 'their', translation: 'техен', level: 1, category: 'pronoun' },
    //     // ... Add remaining 212 level 1 words here ...
    //
    //     // Level 2 - 250 intermediate words
    //     { word: 'brother', translation: 'брат', level: 2, category: 'noun' },
    //     { word: 'sister', translation: 'сестра', level: 2, category: 'noun' },
    //     { word: 'parent', translation: 'родител', level: 2, category: 'noun' },
    //     { word: 'son', translation: 'син', level: 2, category: 'noun' },
    //     { word: 'daughter', translation: 'дъщеря', level: 2, category: 'noun' },
    //     { word: 'husband', translation: 'съпруг', level: 2, category: 'noun' },
    //     { word: 'wife', translation: 'съпруга', level: 2, category: 'noun' },
    //     { word: 'grandfather', translation: 'дядо', level: 2, category: 'noun' },
    //     // ... Add remaining 242 level 2 words here ...
    //
    //     // Level 3 - 250 advanced words
    //     { word: 'important', translation: 'важен', level: 3, category: 'adjective' },
    //     { word: 'possible', translation: 'възможен', level: 3, category: 'adjective' },
    //     { word: 'necessary', translation: 'необходим', level: 3, category: 'adjective' },
    //     // ... Add remaining 247 level 3 words here ...
    //
    //     // Level 4 - 250 expert words
    //     { word: 'significant', translation: 'значителен', level: 4, category: 'adjective' },
    //     { word: 'essential', translation: 'съществен', level: 4, category: 'adjective' },
    //     { word: 'fundamental', translation: 'основен', level: 4, category: 'adjective' },
    //     // ... Add remaining 247 level 4 words here ...
    // ];

    useEffect(() => {
        const filtered = filterLevel === 'all'
            ? vocabulary
            : vocabulary.filter(v => v.level === parseInt(filterLevel));
        setFilteredWords(filtered);
    }, [filterLevel]);

    const currentWord = filteredWords[currentIndex];
    const progress = ((knownWords.size + unknownWords.size) / filteredWords.length) * 100;
    const proficiency = filteredWords.length > 0
        ? Math.round((knownWords.size / (knownWords.size + unknownWords.size)) * 100) || 0
        : 0;

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleKnow = () => {
        setKnownWords(new Set([...knownWords, currentIndex]));
        setShowTranslation(false);
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleDontKnow = () => {
        setUnknownWords(new Set([...unknownWords, currentIndex]));
        setShowTranslation(false);
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setKnownWords(new Set());
        setUnknownWords(new Set());
        setShowTranslation(false);
        setShowResults(false);
    };

    // Results Screen
    if (showResults) {
        const totalAnswered = knownWords.size + unknownWords.size;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-6 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full">
                    <div className="text-center">
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-5xl font-bold text-gray-800 mb-4">
                            Тест завършен!
                        </h2>

                        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6">
                            <div className="text-7xl font-bold text-purple-600 mb-2">
                                {proficiency}%
                            </div>
                            <p className="text-xl text-gray-700">Познаване на думи</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="text-3xl font-bold text-green-600">
                                    {knownWords.size}
                                </div>
                                <p className="text-gray-600">Знам</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4">
                                <div className="text-3xl font-bold text-red-600">
                                    {unknownWords.size}
                                </div>
                                <p className="text-gray-600">Не знам</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <p className="text-lg text-gray-700">
                                Отговорени: <span className="font-bold">{totalAnswered}</span> от <span className="font-bold">{filteredWords.length}</span> думи
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={handleReset}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 transition-all"
                            >
                                <RotateCcw className="w-6 h-6" />
                                Започни отново
                            </button>
                            <button
                                onClick={() => {
                                    setShowResults(false);
                                    setFilterLevel('all');
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 transition-all"
                            >
                                <HomeIcon className="w-6 h-6" />
                                Смени нивото
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Level Selection Screen
    if (filteredWords.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <BookOpen className="w-16 h-16 text-yellow-300 animate-pulse" />
                            <h1 className="text-6xl font-bold text-white drop-shadow-lg">
                                Речников Тест
                            </h1>
                            <Sparkles className="w-16 h-16 text-yellow-300 animate-pulse" />
                        </div>
                        <p className="text-2xl text-white font-medium">
                            Избери ниво за тестване
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setFilterLevel('all')}
                            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                        >
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🌟</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Всички думи</h3>
                            <p className="text-gray-600 mb-3">1000 думи</p>
                            <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                                <Play className="w-5 h-5" />
                                <span>Започни теста</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setFilterLevel('1')}
                            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                        >
                            <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🟢</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ниво 1 - Основно</h3>
                            <p className="text-gray-600 mb-3">250 най-чести думи</p>
                            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                <Play className="w-5 h-5" />
                                <span>Започни</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setFilterLevel('2')}
                            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                        >
                            <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🔵</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ниво 2 - Средно</h3>
                            <p className="text-gray-600 mb-3">250 ежедневни думи</p>
                            <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                                <Play className="w-5 h-5" />
                                <span>Започни</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setFilterLevel('3')}
                            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                        >
                            <div className="bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🟠</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ниво 3 - Напреднало</h3>
                            <p className="text-gray-600 mb-3">250 по-редки думи</p>
                            <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
                                <Play className="w-5 h-5" />
                                <span>Започни</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setFilterLevel('4')}
                            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 md:col-span-2"
                        >
                            <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🔴</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ниво 4 - Експертно</h3>
                            <p className="text-gray-600 mb-3">250 академични думи</p>
                            <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                                <Play className="w-5 h-5" />
                                <span>Започни</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Test Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <Star className="w-8 h-8 text-yellow-500" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Речников Тест</h2>
                                <p className="text-gray-600">
                                    Дума {currentIndex + 1} от {filteredWords.length}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">{proficiency}%</div>
                            <p className="text-sm text-gray-600">познаване</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-700">{knownWords.size + unknownWords.size}</div>
                            <div className="text-xs text-gray-600">Отговорени</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-green-600">{knownWords.size}</div>
                            <div className="text-xs text-gray-600">Знам ✓</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-red-600">{unknownWords.size}</div>
                            <div className="text-xs text-gray-600">Не знам ✗</div>
                        </div>
                    </div>
                </div>

                {/* Word Card */}
                {currentWord && (
                    <div className="bg-white rounded-3xl p-12 shadow-2xl">
                        <div className="text-center mb-8">
                            {/* Category Badge */}
                            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                {currentWord.category} • Level {currentWord.level}
                            </div>

                            {/* English Word */}
                            <div className="mb-8">
                                <h1 className="text-7xl font-bold text-gray-800 mb-6">
                                    {currentWord.word}
                                </h1>
                                <button
                                    onClick={() => speak(currentWord.word)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
                                >
                                    <Volume2 className="w-6 h-6" />
                                    <span className="font-semibold">Произнеси</span>
                                </button>
                            </div>

                            {/* Translation Toggle */}
                            <div className="mb-8">
                                <button
                                    onClick={() => setShowTranslation(!showTranslation)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-8 rounded-xl flex items-center gap-3 mx-auto transition-all transform hover:scale-105 font-bold text-lg"
                                >
                                    {showTranslation ? (
                                        <>
                                            <EyeOff className="w-6 h-6" />
                                            Скрий превода
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-6 h-6" />
                                            Покажи превода
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Bulgarian Translation */}
                            {showTranslation && (
                                <div className="bg-blue-50 rounded-2xl p-6 mb-8 animate-fadeIn">
                                    <p className="text-4xl font-bold text-blue-700">
                                        {currentWord.translation}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleKnow}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 text-xl"
                            >
                                <span className="text-3xl">✓</span>
                                Знам
                            </button>
                            <button
                                onClick={handleDontKnow}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 text-xl"
                            >
                                <span className="text-3xl">✗</span>
                                Не знам
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => {
                                    setShowResults(false);
                                    setFilterLevel('all');
                                    handleReset();
                                }}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                            >
                                ← Назад към менюто
                            </button>
                            {currentIndex > 0 && (
                                <button
                                    onClick={() => setCurrentIndex(currentIndex - 1)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                                >
                                    ← Предишна
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabularyTest;