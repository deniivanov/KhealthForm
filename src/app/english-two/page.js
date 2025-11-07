'use client';
import React, { useState } from 'react';
import { Sparkles, Star, Trophy, Play, Volume2, Home as HomeIcon } from 'lucide-react';

const EnglishLessonTwo = () => {
    const [section, setSection] = useState('menu');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [xp, setXp] = useState(0);
    const [showScene, setShowScene] = useState(true);

    // Section 1: What's Missing Data
    const missingGameScenes = [
        {
            scene: '🛏️ Bedroom',
            items: ['🛏️ bed', '🪟 window', '🧸 toy', '📚 books'],
            missing: '🧸 toy',
            emoji: '🛏️'
        },
        {
            scene: '🍳 Kitchen',
            items: ['🍳 pan', '🍞 bread', '🥛 milk', '🍎 apple'],
            missing: '🥛 milk',
            emoji: '🍳'
        },
        {
            scene: '🚿 Bathroom',
            items: ['🧼 soap', '🪥 toothbrush', '🚿 shower', '🪞 mirror'],
            missing: '🪥 toothbrush',
            emoji: '🚿'
        }
    ];

    // Section 2: Action Match Data
    const actionMatches = [
        {
            sentence: 'I get up at seven',
            options: ['🛏️ Wake up', '🍽️ Eat lunch', '⚽ Play football'],
            correct: 0,
            emoji: '🛏️'
        },
        {
            sentence: 'I go to school',
            options: ['🏠 Stay home', '🏫 Go to school', '🌙 Sleep'],
            correct: 1,
            emoji: '🏫'
        },
        {
            sentence: 'I play with my friends',
            options: ['📖 Read alone', '👥 Play with friends', '🍕 Eat pizza'],
            correct: 1,
            emoji: '👥'
        },
        {
            sentence: 'I eat breakfast',
            options: ['🍳 Eat breakfast', '🌙 Go to bed', '🚌 Take the bus'],
            correct: 0,
            emoji: '🍳'
        }
    ];

    // Section 3: Story Builder
    const storyPieces = [
        { id: 1, text: 'I get up', emoji: '☀️', order: 1 },
        { id: 2, text: 'I eat breakfast', emoji: '🍳', order: 2 },
        { id: 3, text: 'I brush my teeth', emoji: '🪥', order: 3 },
        { id: 4, text: 'I go to school', emoji: '🏫', order: 4 },
        { id: 5, text: 'I play with my friends', emoji: '👥', order: 5 }
    ];

    // Section 4: Grammar Game (I vs He/She)
    const grammarExercises = [
        {
            prompt: 'I play football',
            subject: 'Tom',
            correct: 'He plays football',
            emoji: '⚽'
        },
        {
            prompt: 'I eat pizza',
            subject: 'Sara',
            correct: 'She eats pizza',
            emoji: '🍕'
        },
        {
            prompt: 'I read books',
            subject: 'Mike',
            correct: 'He reads books',
            emoji: '📚'
        },
        {
            prompt: 'I drink milk',
            subject: 'Anna',
            correct: 'She drinks milk',
            emoji: '🥛'
        }
    ];

    // Section 5: Reading Story
    const readingStory = {
        title: "Tom's Day",
        text: "Tom wakes up early. He eats toast and drinks milk. He goes to school by bus. At school, he reads, draws, and plays football. In the afternoon, he goes home and plays games with his sister.",
        questions: [
            {
                q: "What does Tom eat?",
                options: ['Pizza', 'Toast', 'Burger'],
                correct: 1
            },
            {
                q: "How does he go to school?",
                options: ['By car', 'By bike', 'By bus'],
                correct: 2
            },
            {
                q: "Who does he play with at home?",
                options: ['His brother', 'His sister', 'His friend'],
                correct: 1
            }
        ]
    };

    // Section 6: Creative Talk
    const creativePrompts = [
        {
            question: "What do you eat for breakfast?",
            options: ['I eat cereal', 'I eat toast', 'I eat pancakes', 'I eat eggs'],
            emoji: '🍳'
        },
        {
            question: "What time do you go to school?",
            options: ['I go at 7 o\'clock', 'I go at 8 o\'clock', 'I go at 9 o\'clock'],
            emoji: '🏫'
        },
        {
            question: "What games do you play?",
            options: ['I play football', 'I play video games', 'I play with toys'],
            emoji: '🎮'
        }
    ];

    const sections = [
        { id: 'missing', name: 'What\'s Missing?', emoji: '🔍', color: 'bg-blue-500' },
        { id: 'actions', name: 'Daily Actions', emoji: '🏃', color: 'bg-green-500' },
        { id: 'story', name: 'Story Builder', emoji: '📖', color: 'bg-purple-500' },
        { id: 'grammar', name: 'I or He/She?', emoji: '✏️', color: 'bg-orange-500' },
        { id: 'reading', name: 'Reading Corner', emoji: '📚', color: 'bg-red-500' },
        { id: 'creative', name: 'Your Turn', emoji: '💬', color: 'bg-yellow-500' },
        { id: 'quiz', name: 'Final Quiz', emoji: '🏅', color: 'bg-pink-500' }
    ];

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleAnswer = (isCorrect, points = 10) => {
        if (isCorrect) {
            setScore(score + 1);
            setXp(xp + points);
        }
    };

    const nextQuestion = () => {
        setCurrentQuestion(currentQuestion + 1);
    };

    const resetSection = () => {
        setCurrentQuestion(0);
        setShowScene(true);
    };

    // Main Menu
    if (section === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
                            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                                My World - Daily Activities
                            </h1>
                            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
                        </div>
                        <p className="text-xl text-white font-medium mb-4">
                            Lesson 2: Things I Do Every Day 🌟
                        </p>
                        <div className="bg-white rounded-full px-6 py-3 inline-block shadow-lg">
                            <span className="text-2xl font-bold text-purple-600">XP: {xp}</span>
                            <Star className="inline w-6 h-6 text-yellow-500 ml-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((sec) => (
                            <button
                                key={sec.id}
                                onClick={() => { setSection(sec.id); resetSection(); }}
                                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                            >
                                <div className={`${sec.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                    <span className="text-4xl">{sec.emoji}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{sec.name}</h3>
                                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-semibold">
                                    <Play className="w-5 h-5" />
                                    <span>Започни!</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Section 1: What's Missing?
    if (section === 'missing') {
        if (currentQuestion >= missingGameScenes.length) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-400 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                        <div className="text-center">
                            <div className="text-8xl mb-4">🎉</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Section Complete!</h2>
                            <p className="text-xl text-gray-600 mb-6">Score: {score}/{missingGameScenes.length}</p>
                            <button
                                onClick={() => setSection('menu')}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const scene = missingGameScenes[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-400 to-cyan-400 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                            🔍 What's Missing?
                        </h2>

                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">{scene.emoji}</div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">{scene.scene}</h3>

                            {showScene ? (
                                <div>
                                    <div className="flex justify-center gap-4 mb-6 flex-wrap">
                                        {scene.items.map((item, idx) => (
                                            <div key={idx} className="text-5xl bg-blue-50 p-4 rounded-xl">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowScene(false)}
                                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
                                    >
                                        Hide Items
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xl text-gray-700 mb-6">What's missing?</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {scene.items.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const isCorrect = item === scene.missing;
                                                    handleAnswer(isCorrect, 15);
                                                    if (isCorrect) speak("Correct!");
                                                    setTimeout(() => {
                                                        nextQuestion();
                                                        setShowScene(true);
                                                    }, 1500);
                                                }}
                                                className="bg-blue-100 hover:bg-blue-200 text-xl font-bold py-4 px-6 rounded-xl transition-all"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center text-gray-600">
                            Question {currentQuestion + 1} of {missingGameScenes.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Section 2: Action Match
    if (section === 'actions') {
        if (currentQuestion >= actionMatches.length) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-400 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                        <div className="text-center">
                            <div className="text-8xl mb-4">🎉</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Great Job!</h2>
                            <p className="text-xl text-gray-600 mb-6">Score: {score}/{actionMatches.length}</p>
                            <button
                                onClick={() => setSection('menu')}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const action = actionMatches[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-400 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                            🏃 Match the Action
                        </h2>

                        <div className="text-center mb-8">
                            <div className="text-7xl mb-6">{action.emoji}</div>
                            <div className="bg-blue-50 rounded-xl p-6 mb-8">
                                <p className="text-3xl font-bold text-gray-800">{action.sentence}</p>
                                <button
                                    onClick={() => speak(action.sentence)}
                                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 mx-auto"
                                >
                                    <Volume2 className="w-5 h-5" />
                                    Listen
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {action.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const isCorrect = idx === action.correct;
                                            handleAnswer(isCorrect, 15);
                                            if (isCorrect) speak("Perfect!");
                                            setTimeout(() => nextQuestion(), 1500);
                                        }}
                                        className="bg-green-100 hover:bg-green-200 text-xl font-bold py-4 px-6 rounded-xl transition-all"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-gray-600">
                            Action {currentQuestion + 1} of {actionMatches.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Section 3: Story Builder
    if (section === 'story') {
        const StoryBuilder = () => {
            const [available, setAvailable] = useState(storyPieces);
            const [ordered, setOrdered] = useState([]);

            const addToStory = (piece) => {
                setOrdered([...ordered, piece]);
                setAvailable(available.filter(p => p.id !== piece.id));
            };

            const removeFromStory = (piece) => {
                setAvailable([...available, piece].sort((a, b) => a.order - b.order));
                setOrdered(ordered.filter(p => p.id !== piece.id));
            };

            const checkOrder = () => {
                const isCorrect = ordered.every((piece, idx) => piece.order === idx + 1);
                if (isCorrect) {
                    handleAnswer(true, 25);
                    speak("Perfect! Your story is in the right order!");
                    setTimeout(() => setSection('menu'), 2000);
                } else {
                    speak("Try again! Think about what you do first in the morning.");
                }
            };

            return (
                <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                                📖 Build Your Morning Story
                            </h2>
                            <p className="text-center text-gray-600 mb-8">
                                Click sentences to build your story!
                            </p>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Your Story:</h3>
                                <div className="bg-blue-50 rounded-xl p-6 min-h-64">
                                    {ordered.length === 0 ? (
                                        <p className="text-gray-400 text-center">Click sentences below to build your story...</p>
                                    ) : (
                                        ordered.map((piece, idx) => (
                                            <div
                                                key={piece.id}
                                                onClick={() => removeFromStory(piece)}
                                                className="bg-white rounded-lg p-4 mb-3 shadow cursor-pointer hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <span className="text-3xl">{idx + 1}.</span>
                                                <span className="text-2xl">{piece.emoji}</span>
                                                <span className="text-xl font-semibold">{piece.text}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-700 mb-4">Available Sentences:</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {available.map((piece) => (
                                        <button
                                            key={piece.id}
                                            onClick={() => addToStory(piece)}
                                            className="bg-purple-100 hover:bg-purple-200 rounded-lg p-4 shadow flex items-center gap-3 transition-all"
                                        >
                                            <span className="text-2xl">{piece.emoji}</span>
                                            <span className="text-xl font-semibold">{piece.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={checkOrder}
                                    disabled={ordered.length !== storyPieces.length}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-xl"
                                >
                                    Check My Story!
                                </button>
                                <button
                                    onClick={() => setSection('menu')}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return <StoryBuilder />;
    }

    // Section 4: Grammar Game
    if (section === 'grammar') {
        const GrammarGame = () => {
            const [userAnswer, setUserAnswer] = useState('');
            const [showFeedback, setShowFeedback] = useState(false);

            if (currentQuestion >= grammarExercises.length) {
                return (
                    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-400 p-6 flex items-center justify-center">
                        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                            <div className="text-center">
                                <div className="text-8xl mb-4">🎉</div>
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">Excellent!</h2>
                                <p className="text-xl text-gray-600 mb-6">Score: {score}/{grammarExercises.length}</p>
                                <button
                                    onClick={() => setSection('menu')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl"
                                >
                                    Back to Menu
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            const exercise = grammarExercises[currentQuestion];

            return (
                <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-400 p-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                                ✏️ I or He/She?
                            </h2>

                            <div className="text-center mb-8">
                                <div className="text-7xl mb-6">{exercise.emoji}</div>

                                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                                    <p className="text-2xl font-bold text-gray-800 mb-2">{exercise.prompt}</p>
                                    <p className="text-xl text-gray-600">Change to: <span className="font-bold text-orange-600">{exercise.subject}</span></p>
                                </div>

                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full text-2xl p-4 border-4 border-orange-300 rounded-xl mb-6 text-center"
                                />

                                {showFeedback && (
                                    <div className={`p-4 rounded-xl mb-6 ${userAnswer.toLowerCase() === exercise.correct.toLowerCase() ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <p className="text-xl font-bold">
                                            {userAnswer.toLowerCase() === exercise.correct.toLowerCase()
                                                ? '✅ Correct!'
                                                : `❌ Try again! Answer: ${exercise.correct}`}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setShowFeedback(true);
                                            const isCorrect = userAnswer.toLowerCase() === exercise.correct.toLowerCase();
                                            handleAnswer(isCorrect, 20);
                                            if (isCorrect) speak("Great job!");
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl"
                                    >
                                        Check Answer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserAnswer('');
                                            setShowFeedback(false);
                                            nextQuestion();
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            <div className="text-center text-gray-600">
                                Question {currentQuestion + 1} of {grammarExercises.length}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return <GrammarGame />;
    }

    // Section 5: Reading Corner
    if (section === 'reading') {
        if (currentQuestion >= readingStory.questions.length) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-400 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                        <div className="text-center">
                            <div className="text-8xl mb-4">📚</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Story Complete!</h2>
                            <p className="text-xl text-gray-600 mb-6">Score: {score}/{readingStory.questions.length}</p>
                            <button
                                onClick={() => setSection('menu')}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const question = readingStory.questions[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-400 to-orange-400 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                            📚 {readingStory.title}
                        </h2>

                        {currentQuestion === 0 && (
                            <div className="bg-blue-50 rounded-xl p-6 mb-8">
                                <p className="text-xl leading-relaxed text-gray-800 mb-4">
                                    {readingStory.text}
                                </p>
                                <button
                                    onClick={() => speak(readingStory.text)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 mx-auto"
                                >
                                    <Volume2 className="w-5 h-5" />
                                    Read Story Aloud
                                </button>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">{question.q}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {question.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const isCorrect = idx === question.correct;
                                            handleAnswer(isCorrect, 15);
                                            if (isCorrect) speak("Correct answer!");
                                            setTimeout(() => nextQuestion(), 1500);
                                        }}
                                        className="bg-red-100 hover:bg-red-200 text-xl font-bold py-4 px-6 rounded-xl transition-all"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-gray-600">
                            Question {currentQuestion + 1} of {readingStory.questions.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Section 6: Creative Talk
    if (section === 'creative') {
        if (currentQuestion >= creativePrompts.length) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-green-400 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                        <div className="text-center">
                            <div className="text-8xl mb-4">🎤</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Great Talking!</h2>
                            <p className="text-xl text-gray-600 mb-6">You answered {creativePrompts.length} questions!</p>
                            <button
                                onClick={() => setSection('menu')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-xl"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const prompt = creativePrompts[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-400 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                            💬 Your Turn to Talk!
                        </h2>

                        <div className="text-center mb-8">
                            <div className="text-7xl mb-6">{prompt.emoji}</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-8">{prompt.question}</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {prompt.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            speak(option);
                                            handleAnswer(true, 10);
                                            setTimeout(() => nextQuestion(), 1500);
                                        }}
                                        className="bg-yellow-100 hover:bg-yellow-200 text-xl font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <span>{option}</span>
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-gray-600">
                            Question {currentQuestion + 1} of {creativePrompts.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Section 7: Final Quiz
    if (section === 'quiz') {
        const quizQuestions = [
            {
                type: 'match',
                question: 'Match the picture to the sentence',
                sentence: 'I brush my teeth',
                options: ['🪥', '🍕', '⚽'],
                correct: 0
            },
            {
                type: 'fill',
                question: 'Fill in the missing verb',
                sentence: 'I ___ breakfast',
                options: ['eat', 'sleep', 'run'],
                correct: 0
            },
            {
                type: 'pronoun',
                question: 'Pick the correct sentence for Tom',
                options: ['I play football', 'He plays football', 'She plays football'],
                correct: 1
            },
            {
                type: 'order',
                question: 'What do you do first in the morning?',
                options: ['I go to school', 'I get up', 'I eat lunch'],
                correct: 1
            }
        ];

        if (currentQuestion >= quizQuestions.length) {
            const finalScore = Math.round((score / quizQuestions.length) * 100);

            return (
                <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl">
                        <div className="text-center">
                            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-5xl font-bold text-gray-800 mb-4">Lesson Complete!</h2>
                            <div className="text-7xl font-bold text-purple-600 mb-4">{finalScore}%</div>
                            <p className="text-2xl text-gray-600 mb-6">
                                Total XP Earned: <span className="font-bold text-green-600">{xp}</span>
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setSection('menu');
                                        setScore(0);
                                        setCurrentQuestion(0);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2"
                                >
                                    <HomeIcon className="w-6 h-6" />
                                    Back to Menu
                                </button>
                                <button
                                    onClick={() => {
                                        setSection('quiz');
                                        setScore(0);
                                        setCurrentQuestion(0);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl"
                                >
                                    Retry Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const question = quizQuestions[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-400 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">🏅 Final Quiz</h2>
                            <div className="bg-purple-100 px-4 py-2 rounded-full">
                                <span className="text-xl font-bold text-purple-600">XP: {xp}</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full h-3 mb-8">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                            />
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">{question.question}</h3>

                            {question.sentence && (
                                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                    <p className="text-xl font-semibold text-gray-700">{question.sentence}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {question.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const isCorrect = idx === question.correct;
                                            handleAnswer(isCorrect, 20);
                                            if (isCorrect) speak("Excellent!");
                                            setTimeout(() => nextQuestion(), 1500);
                                        }}
                                        className="bg-pink-100 hover:bg-pink-200 text-xl font-bold py-4 px-6 rounded-xl transition-all"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                            <span>Score: {score}/{currentQuestion}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default EnglishLessonTwo;