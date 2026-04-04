import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getBadgesList } from '../data/gameConstants.js';
import { PLANTS_DB } from '../db/plants.js';
import { S } from '../data/styles.js';

export default function GameScreen({ onClose }) {
  const { score, level, streak, badges, serres, permanentPlants, setScore, setBadges } = useGame();

  // Computed totals
  const totalPlants = serres.reduce((a, s) => a + s.alveoles.filter(Boolean).length, 0);
  const totalYield = serres.reduce((a, s) => {
    return s.alveoles.reduce((aa, alv) => {
      if (!alv) return aa;
      const plant = PLANTS_DB.find(p => p.id === alv.plantId);
      if (!plant?.yield) return aa;
      return aa + (plant.yield.min + plant.yield.max) / 2;
    }, a);
  }, 0) + permanentPlants.reduce((a, p) => {
    const match = p.production?.match(/(\d+)-?(\d+)?/);
    if (!match) return a;
    return a + (parseInt(match[1]) + (match[2] ? parseInt(match[2]) : 0)) / 2;
  }, 0);

  const badgesList = getBadgesList(totalPlants, totalYield, streak, badges);

  const [gameTab, setGameTab] = useState('quest');
  const [quiz, setQuiz] = useState(null); // { plant, options }
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null); // 'correct' | 'wrong' | null

  const launchQuiz = () => {
    const shuffled = [...PLANTS_DB].sort(() => Math.random() - 0.5);
    const plant = shuffled[0];
    const companions = (plant.companions || []).slice(0, 3).map(id => PLANTS_DB.find(p => p.id === id)).filter(Boolean);
    const others = shuffled.filter(p => p.id !== plant.id && !(plant.companions || []).includes(p.id)).slice(0, 2);
    const options = [
      ...companions.map(p => ({ id: p.id, name: p.name, icon: p.icon, isCompanion: true })),
      ...others.map(p => ({ id: p.id, name: p.name, icon: p.icon, isCompanion: false })),
    ].sort(() => Math.random() - 0.5);
    setQuiz({ plant, options });
    setQuizAnswer(null);
    setQuizResult(null);
  };

  const handleQuizAnswer = (opt) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(opt.id);
    if (opt.isCompanion) {
      setQuizResult('correct');
      setScore(s => s + 15);
      setBadges(b => b + 1);
    } else {
      setQuizResult('wrong');
      setScore(s => Math.max(0, s - 5));
    }
  };

  const xpForLevel = score % 500;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1c40f' }}>⭐ {score} XP</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Niveau {level} · 🔥 {streak} jours</div>
        </div>
        <div onClick={onClose} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>✕ Fermer</div>
      </div>

      {/* Level bar */}
      <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
          <span>Niveau {level}</span><span>Niveau {level + 1}</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${(xpForLevel / 500) * 100}%`, background: 'linear-gradient(90deg, #f39c12, #e74c3c)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
        {[['quest', '📋 Quêtes'], ['quiz', '🧠 Quiz'], ['badges', '🏅 Badges']].map(([id, label]) => (
          <div key={id} onClick={() => setGameTab(id)} style={{
            flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12,
            background: gameTab === id ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${gameTab === id ? 'rgba(243,156,18,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: gameTab === id ? '#f1c40f' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
          }}>{label}</div>
        ))}
      </div>

      {/* Quêtes quotidiennes */}
      {gameTab === 'quest' && (
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, ...S.label }}>QUÊTES DU JOUR</div>
          {badgesList.map(b => (
            <div key={b.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 10,
              background: b.earned ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${b.earned ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <span style={{ fontSize: 20 }}>{b.earned ? '✅' : '⬜'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: b.earned ? '#2ecc71' : '#fff' }}>{b.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz */}
      {gameTab === 'quiz' && (
        <div>
          {!quiz ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Quiz Compagnonnage</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Quelle plante accompagne {quiz?.plant?.name || 'cette tomate'} ?</div>
              <div onClick={launchQuiz} style={{ ...S.primaryBtn, background: '#f39c12', cursor: 'pointer' }}>🎯 Lancer le quiz</div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{quiz.plant.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{quiz.plant.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Quelle plante est son COMPAGNON ?</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quiz.options.map((opt, i) => {
                  let bg = 'rgba(255,255,255,0.04)';
                  if (quizAnswer !== null) {
                    if (opt.isCompanion) bg = 'rgba(46,204,113,0.2)';
                    else if (opt.id === quizAnswer) bg = 'rgba(231,76,60,0.2)';
                  }
                  return (
                    <div key={i} onClick={() => handleQuizAnswer(opt)} style={{
                      padding: '10px 14px', borderRadius: 10, cursor: quizAnswer !== null ? 'default' : 'pointer', background: bg,
                      border: `1px solid ${quizAnswer !== null && opt.isCompanion ? '#2ecc71' : quizAnswer !== null && opt.id === quizAnswer ? '#e74c3c' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s',
                    }}>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{opt.icon}</span>
                      <span style={{ fontSize: 13 }}>{opt.name}</span>
                    </div>
                  );
                })}
              </div>
              {quizResult && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, textAlign: 'center', background: quizResult === 'correct' ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', border: `1px solid ${quizResult === 'correct' ? '#2ecc71' : '#e74c3c'}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: quizResult === 'correct' ? '#2ecc71' : '#e74c3c' }}>
                    {quizResult === 'correct' ? '✅ Bravo ! +15 XP' : '❌ Faux ! -5 XP'}
                  </div>
                </div>
              )}
              <div onClick={launchQuiz} style={{ ...S.primaryBtn, marginTop: 12, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12 }}>🔄 Nouvelle question</div>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {gameTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {badgesList.map(b => (
            <div key={b.id} style={{
              padding: 12, borderRadius: 10,
              background: b.earned ? 'rgba(243,156,18,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${b.earned ? 'rgba(243,156,18,0.3)' : 'rgba(255,255,255,0.06)'}`,
              opacity: b.earned ? 1 : 0.5,
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{b.earned ? b.label.split(' ')[0] : '🔒'}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: b.earned ? '#f1c40f' : '#fff' }}>{b.earned ? b.label : '???'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{b.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
