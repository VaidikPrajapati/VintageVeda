import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

const questions = [
  { title: "Physical Frame", options: ["Slender, very tall or very short", "Medium build, muscular and well-proportioned", "Broad, sturdy, heavier build with good stamina"] },
  { title: "Skin Characteristics", options: ["Dry, rough, thin skin that tans easily", "Warm, reddish, sensitive skin with freckles", "Thick, oily, smooth, cool and pale skin"] },
  { title: "Hair Type", options: ["Dry, brittle, dark, coarse or frizzy hair", "Straight, fine, oily, early graying or balding", "Thick, lustrous, wavy, dark and oily hair"] },
  { title: "Appetite Pattern", options: ["Irregular appetite, sometimes forgets to eat", "Strong appetite, gets irritable when hungry", "Steady appetite, can easily skip meals"] },
  { title: "Sleep Pattern", options: ["Light, interrupted sleep, tendency to insomnia", "Moderate sleeper, may wake up hot", "Deep, heavy, prolonged sleeper, hard to wake"] },
  { title: "Reaction to Stress", options: ["Anxiety, fear, worry, and nervousness", "Anger, frustration, irritability, and criticism", "Stubbornness, lethargy, withdrawal, and denial"] },
  { title: "Mental Activity", options: ["Quick, restless mind, very creative", "Sharp, focused, intellectual, competitive", "Calm, steady, slow to learn but great memory"] }
];

const doshaResults = {
  vata: {
    name: "Vata",
    subtitle: "The Creative Innovator — Air & Ether",
    initial: "V",
    description: "You are naturally creative, quick-thinking, and energetic. Vata types are the visionaries and artists of Ayurveda. When balanced, you are lively and enthusiastic. Focus on warmth, routine, and grounding foods to maintain balance.",
    diet: "Warm, cooked foods. Favor sweet, sour, salty tastes. Avoid raw, cold, dry foods.",
    lifestyle: "Maintain regular routines. Practice gentle yoga and meditation. Stay warm.",
    herbs: "Ashwagandha, Ginger, Cinnamon, Cardamom, and Sesame oil."
  },
  pitta: {
    name: "Pitta",
    subtitle: "The Natural Leader — Fire & Water",
    initial: "P",
    description: "You are naturally intelligent, focused, and ambitious. Pitta types are the leaders and strategists of Ayurveda. When balanced, you are warm, joyful, and confident. Focus on cooling foods and activities to maintain harmony.",
    diet: "Cool, refreshing foods. Favor sweet, bitter, astringent tastes. Avoid spicy, fried, sour foods.",
    lifestyle: "Avoid excessive heat and competition. Practice cooling pranayama. Spend time in nature.",
    herbs: "Shatavari, Coriander, Fennel, Amla, and Coconut oil."
  },
  kapha: {
    name: "Kapha",
    subtitle: "The Steadfast Nurturer — Water & Earth",
    initial: "K",
    description: "You are naturally calm, strong, and compassionate. Kapha types are the nurturers and pillars of Ayurveda. When balanced, you are loving, patient, and grounded. Focus on stimulation, variety, and light foods to maintain vitality.",
    diet: "Light, warm, spicy foods. Favor pungent, bitter, astringent tastes. Avoid heavy, oily, sweet foods.",
    lifestyle: "Stay active with vigorous exercise. Embrace change and new experiences. Rise early.",
    herbs: "Turmeric, Black Pepper, Tulsi, Triphala, and Mustard oil."
  }
};

export default function DoshaQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIdx;
    setAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers(Array(questions.length).fill(null));
    setShowResult(false);
  };

  // Calculate dominant dosha from answers
  const calculateDosha = () => {
    const counts = [0, 0, 0]; // vata, pitta, kapha
    answers.forEach(a => {
      if (a !== null) counts[a]++;
    });
    const maxIdx = counts.indexOf(Math.max(...counts));
    return ['vata', 'pitta', 'kapha'][maxIdx];
  };

  const dominantDosha = calculateDosha();
  const result = doshaResults[dominantDosha];

  return (
    <div className="quiz-page">
      
      <div className="quiz-header">
        <h1>Discover Your Natural Constitution</h1>
        <p>
          According to Ayurveda, health is the state of perfect balance of your three doshas: Vata, Pitta, and Kapha. This quiz will identify your dominant dosha.
        </p>
      </div>

      <div className="quiz-card">
        {!showResult ? (
          <>
            {/* Progress */}
            <div className="quiz-progress-bar">
              <span className="quiz-step-label">
                Question {currentStep + 1} of {questions.length}
              </span>
              <div className="quiz-dots">
                {questions.map((_, idx) => (
                  <div key={idx} className={`quiz-dot ${idx < currentStep ? 'completed' : ''} ${idx === currentStep ? 'active' : ''}`} />
                ))}
              </div>
            </div>

            {/* Question */}
            <h2 className="quiz-question">{questions[currentStep].title}</h2>

            {/* Options */}
            <div className="quiz-options">
              {questions[currentStep].options.map((opt, idx) => (
                <label key={idx} className={`quiz-option ${answers[currentStep] === idx ? 'selected' : ''}`} onClick={() => handleSelect(idx)}>
                  <input 
                    type="radio" 
                    name={`q-${currentStep}`} 
                    checked={answers[currentStep] === idx}
                    onChange={() => handleSelect(idx)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="quiz-actions">
              <button 
                className="quiz-btn secondary" 
                onClick={goPrev}
                disabled={currentStep === 0}
                style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
              >
                <ArrowLeft size={18} /> Previous
              </button>
              <button 
                className="quiz-btn primary" 
                onClick={goNext}
                disabled={answers[currentStep] === null}
                style={{ opacity: answers[currentStep] === null ? 0.5 : 1 }}
              >
                {currentStep === questions.length - 1 ? 'Analyze Results' : 'Next Question'} <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          /* ─── RESULTS SCREEN ─── */
          <div className="quiz-result">
            <div className={`quiz-result-dosha ${dominantDosha}`}>
              {result.initial}
            </div>
            <h2>Your Dominant Dosha: {result.name}</h2>
            <div className="dosha-subtitle">{result.subtitle}</div>
            <p>{result.description}</p>

            <div className="quiz-result-tips">
              <div className="quiz-tip-card">
                <h4>🍽️ Diet</h4>
                <p>{result.diet}</p>
              </div>
              <div className="quiz-tip-card">
                <h4>🧘 Lifestyle</h4>
                <p>{result.lifestyle}</p>
              </div>
              <div className="quiz-tip-card">
                <h4>🌿 Herbs</h4>
                <p>{result.herbs}</p>
              </div>
            </div>

            <button className="quiz-btn primary" onClick={restart} style={{ margin: '2rem auto 0' }}>
              <RotateCcw size={18} /> Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
