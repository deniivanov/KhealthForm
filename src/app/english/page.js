'use client';
import React, { useState } from 'react';
import { Sparkles, Home, Heart, BookOpen, Activity, Cloud, Play, Check, X } from 'lucide-react';

const EnglishLearningGame = () => {
    const [gameMode, setGameMode] = useState('menu');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState({ correct: 0, sortOf: 0, wrong: 0 });
    const [answers, setAnswers] = useState([]);
    const [showEnglish, setShowEnglish] = useState(false);

    const vocabulary = {
        'Home & Family': {
            icon: Home,
            color: 'bg-blue-500',
            words: [
                { word: 'table', bg: 'маса', type: 'noun', image: '🪑' },
                { word: 'window', bg: 'прозорец', type: 'noun', image: '🪟' },
                { word: 'kitchen', bg: 'кухня', type: 'noun', image: '👨‍🍳' },
                { word: 'brother', bg: 'брат', type: 'noun', image: '👦' },
                { word: 'sister', bg: 'сестра', type: 'noun', image: '👧' },
                { word: 'door', bg: 'врата', type: 'noun', image: '🚪' },
                { word: 'bed', bg: 'легло', type: 'noun', image: '🛏️' },
                { word: 'chair', bg: 'стол', type: 'noun', image: '💺' },
            ]
        },
        'Animals': {
            icon: Heart,
            color: 'bg-green-500',
            words: [
                { word: 'dog', bg: 'куче', type: 'noun', image: '🐕' },
                { word: 'cat', bg: 'котка', type: 'noun', image: '🐱' },
                { word: 'bird', bg: 'птица', type: 'noun', image: '🐦' },
                { word: 'fish', bg: 'риба', type: 'noun', image: '🐟' },
                { word: 'horse', bg: 'кон', type: 'noun', image: '🐴' },
                { word: 'elephant', bg: 'слон', type: 'noun', image: '🐘' },
                { word: 'lion', bg: 'лъв', type: 'noun', image: '🦁' },
                { word: 'monkey', bg: 'маймуна', type: 'noun', image: '🐵' },
            ]
        },
        'Body & Clothes': {
            icon: Heart,
            color: 'bg-purple-500',
            words: [
                { word: 'hand', bg: 'ръка', type: 'noun', image: '✋' },
                { word: 'foot', bg: 'крак', type: 'noun', image: '🦶' },
                { word: 'head', bg: 'глава', type: 'noun', image: '🙂' },
                { word: 'shirt', bg: 'риза', type: 'noun', image: '👕' },
                { word: 'pants', bg: 'панталони', type: 'noun', image: '👖' },
                { word: 'shoes', bg: 'обувки', type: 'noun', image: '👟' },
                { word: 'hat', bg: 'шапка', type: 'noun', image: '🎩' },
                { word: 'eyes', bg: 'очи', type: 'noun', image: '👀' },
            ]
        },
        'School & Objects': {
            icon: BookOpen,
            color: 'bg-orange-500',
            words: [
                { word: 'book', bg: 'книга', type: 'noun', image: '📚' },
                { word: 'pencil', bg: 'молив', type: 'noun', image: '✏️' },
                { word: 'bag', bg: 'чанта', type: 'noun', image: '🎒' },
                { word: 'desk', bg: 'бюро', type: 'noun', image: '🪑' },
                { word: 'teacher', bg: 'учител', type: 'noun', image: '👨‍🏫' },
                { word: 'paper', bg: 'хартия', type: 'noun', image: '📄' },
                { word: 'pen', bg: 'химикалка', type: 'noun', image: '🖊️' },
                { word: 'ball', bg: 'топка', type: 'noun', image: '⚽' },
            ]
        },
        'Actions': {
            icon: Activity,
            color: 'bg-red-500',
            words: [
                { word: 'run', bg: 'бягам', type: 'verb', image: '🏃' },
                { word: 'jump', bg: 'скачам', type: 'verb', image: '🤸' },
                { word: 'draw', bg: 'рисувам', type: 'verb', image: '🎨' },
                { word: 'eat', bg: 'ям', type: 'verb', image: '🍽️' },
                { word: 'sleep', bg: 'спя', type: 'verb', image: '😴' },
                { word: 'play', bg: 'играя', type: 'verb', image: '🎮' },
                { word: 'read', bg: 'чета', type: 'verb', image: '📖' },
                { word: 'swim', bg: 'плувам', type: 'verb', image: '🏊' },
            ]
        },
        'Feelings & Weather': {
            icon: Cloud,
            color: 'bg-yellow-500',
            words: [
                { word: 'happy', bg: 'щастлив', type: 'adjective', image: '😊' },
                { word: 'sad', bg: 'тъжен', type: 'adjective', image: '😢' },
                { word: 'angry', bg: 'ядосан', type: 'adjective', image: '😠' },
                { word: 'sunny', bg: 'слънчево', type: 'adjective', image: '☀️' },
                { word: 'rainy', bg: 'дъждовно', type: 'adjective', image: '🌧️' },
                { word: 'cold', bg: 'студено', type: 'adjective', image: '🥶' },
                { word: 'hot', bg: 'горещо', type: 'adjective', image: '🥵' },
                { word: 'tired', bg: 'уморен', type: 'adjective', image: '😫' },
            ]
        }
    };

    const currentWords = selectedCategory ? vocabulary[selectedCategory].words : [];

    const handleAnswer = (result) => {
        const newAnswers = [...answers, { word: currentWords[currentQuestion], result }];
        setAnswers(newAnswers);

        const newScore = { ...score };
        if (result === 'correct') newScore.correct++;
        else if (result === 'sortOf') newScore.sortOf++;
        else newScore.wrong++;
        setScore(newScore);

        if (currentQuestion < currentWords.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowEnglish(false);
        } else {
            setGameMode('results');
        }
    };

    const resetGame = () => {
        setGameMode('menu');
        setSelectedCategory(null);
        setCurrentQuestion(0);
        setScore({ correct: 0, sortOf: 0, wrong: 0 });
        setAnswers([]);
    };

    const startCategory = (category) => {
        setSelectedCategory(category);
        setGameMode('quiz');
        setCurrentQuestion(0);
        setScore({ correct: 0, sortOf: 0, wrong: 0 });
        setAnswers([]);
        setShowEnglish(false);
    };

    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
                            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                                Word Treasure Hunt
                            </h1>
                            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
                        </div>
                        <p className="text-xl text-white font-medium">
                            Избери категория и покажи колко думи знаеш! 🎯
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(vocabulary).map(([category, data]) => {
                            const Icon = data.icon;
                            return (
                                <button
                                    key={category}
                                    onClick={() => startCategory(category)}
                                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <div className={`${data.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category}</h3>
                                    <p className="text-gray-600 text-sm">{data.words.length} думи</p>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-semibold">
                                        <Play className="w-5 h-5" />
                                        <span>Започни!</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (gameMode === 'quiz' && currentWords.length > 0) {
        const word = currentWords[currentQuestion];
        const progress = ((currentQuestion + 1) / currentWords.length) * 100;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-full h-4 mb-6 overflow-hidden shadow-lg">
                        <div
                            className="bg-green-500 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="text-center mb-6">
            <span className="text-white text-xl font-bold">
              Дума {currentQuestion + 1} от {currentWords.length}
            </span>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-6">{word.image}</div>

                            {showEnglish ? (
                                <div className="animate-fadeIn">
                                    <h2 className="text-5xl font-bold text-gray-800 mb-4">{word.word}</h2>
                                    <p className="text-2xl text-gray-500 italic">({word.bg})</p>
                                </div>
                            ) : (
                                <div>
                                    <button
                                        onClick={() => setShowEnglish(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
                                    >
                                        👁️ Покажи думата на английски
                                    </button>
                                    <p className="text-2xl text-gray-700 font-semibold">({word.bg})</p>
                                </div>
                            )}

                            <span className="inline-block mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {word.type === 'verb' ? '🏃 Действие' : word.type === 'adjective' ? '🎨 Качество' : '📦 Предмет'}
              </span>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-lg text-gray-700 font-medium">
                                Знаеш ли тази дума на английски?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleAnswer('correct')}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                <Check className="w-6 h-6" />
                                <span className="text-xl">Да! Знам я! ✅</span>
                            </button>

                            <button
                                onClick={() => handleAnswer('sortOf')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                <span className="text-xl">Малко я знам 🤔</span>
                            </button>

                            <button
                                onClick={() => handleAnswer('wrong')}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                <X className="w-6 h-6" />
                                <span className="text-xl">Не я знам ❌</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="flex justify-around text-center">
                            <div>
                                <div className="text-3xl font-bold text-green-600">{score.correct}</div>
                                <div className="text-sm text-gray-600">Знам</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-yellow-600">{score.sortOf}</div>
                                <div className="text-sm text-gray-600">Малко</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-600">{score.wrong}</div>
                                <div className="text-sm text-gray-600">Не знам</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameMode === 'results') {
        const totalWords = currentWords.length;
        const percentage = Math.round((score.correct / totalWords) * 100);

        let message = '';
        let emoji = '';
        if (percentage >= 80) {
            message = 'Невероятно! Ти си звезда! 🌟';
            emoji = '🏆';
        } else if (percentage >= 60) {
            message = 'Много добре! Продължавай така! 💪';
            emoji = '🎉';
        } else if (percentage >= 40) {
            message = 'Добро начало! Ще станеш още по-добър! 🚀';
            emoji = '👏';
        } else {
            message = 'Продължавай да се учиш! Ще успееш! 💙';
            emoji = '📚';
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4">{emoji}</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">{message}</h2>
                            <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
                            <p className="text-xl text-gray-600">
                                Знаеш {score.correct} от {totalWords} думи!
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">{score.correct}</div>
                                <div className="text-sm text-gray-600">Знам добре ✅</div>
                            </div>
                            <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold text-yellow-600 mb-2">{score.sortOf}</div>
                                <div className="text-sm text-gray-600">Малко знам 🤔</div>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold text-red-600 mb-2">{score.wrong}</div>
                                <div className="text-sm text-gray-600">Не знам ❌</div>
                            </div>
                        </div>

                        {(score.sortOf > 0 || score.wrong > 0) && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Думи за практикуване:</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {answers.filter(a => a.result !== 'correct').map((answer, idx) => (
                                        <div key={idx} className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                                            <span className="text-3xl">{answer.word.image}</span>
                                            <div>
                                                <div className="font-bold text-gray-800">{answer.word.word}</div>
                                                <div className="text-sm text-gray-600">{answer.word.bg}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={resetGame}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                🏠 Главно меню
                            </button>
                            <button
                                onClick={() => startCategory(selectedCategory)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                🔄 Опитай отново
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default EnglishLearningGame;