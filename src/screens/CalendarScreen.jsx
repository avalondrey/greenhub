import { useState } from 'react';
import { getMoonPhase } from '../utils/moon.js';
import { PLANTS_DB } from '../db/plants.js';
import { S } from '../data/styles.js';

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendarScreen({ onClose }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const getDaysInMonth = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const moon = getMoonPhase(date);
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      days.push({ day, moon, isToday, date });
    }
    return days;
  };

  const days = getDaysInMonth();
  const selectedDate = new Date(year, month, selectedDay);
  const selectedMoon = getMoonPhase(selectedDate);

  const getRecommendedForMoon = (moonType) => {
    if (!moonType) return [];
    return PLANTS_DB.filter(p => {
      const plantType =
        p.id.includes('carotte') || p.id.includes('radis') || p.id.includes('betterave') ? 'racines' :
        p.id.includes('salade') || p.id.includes('laitue') || p.id.includes('epinard') || p.id.includes('chou') ? 'feuilles' :
        p.id.includes('tomate') || p.id.includes('poivron') || p.id.includes('courgette') || p.id.includes('aubergine') ? 'fruits' :
        p.id.includes('haricot') || p.id.includes('pois') ? 'graines' : null;
      return plantType === moonType;
    }).slice(0, 4);
  };

  const recommended = getRecommendedForMoon(selectedMoon.sow);

  const changeMonth = (delta) => {
    const newMonth = month + delta;
    if (newMonth > 11) { setMonth(0); setYear(y => y + 1); }
    else if (newMonth < 0) { setMonth(11); setYear(y => y - 1); }
    else { setMonth(newMonth); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>📅 Calendrier Lunaire</div>
        <div onClick={onClose} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕ Fermer</div>
      </div>

      {/* Navigation mois */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div onClick={() => changeMonth(-1)} style={{ ...S.qBtn, width: 32, height: 32, fontSize: 14 }}>←</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{monthNames[month]} {year}</div>
        <div onClick={() => changeMonth(1)} style={{ ...S.qBtn, width: 32, height: 32, fontSize: 14 }}>→</div>
      </div>

      {/* Phase lunaire actuelle */}
      <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 28 }}>{selectedMoon.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{selectedMoon.name}</div>
        {selectedMoon.sow && (
          <div style={{ fontSize: 11, color: '#2ecc71', marginTop: 2 }}>
            → Semis {selectedMoon.sow}
          </div>
        )}
      </div>

      {/* Grille jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {weekDays.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
        {days.map((d, i) => d === null ? (
          <div key={`empty-${i}`} />
        ) : (
          <div
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            style={{
              textAlign: 'center',
              padding: '6px 2px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
              background: d.isToday ? 'rgba(46,204,113,0.2)' :
                          selectedDay === d.day ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${d.isToday ? '#2ecc71' : selectedDay === d.day ? 'rgba(46,204,113,0.4)' : 'transparent'}`,
              color: d.isToday ? '#2ecc71' : 'rgba(255,255,255,0.7)',
            }}
          >
            <div style={{ fontSize: 16 }}>{d.moon.icon}</div>
            <div>{d.day}</div>
          </div>
        ))}
      </div>

      {/* Recommandations */}
      {recommended.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, ...S.label }}>RECOMMANDÉS AUJOURD'HUI</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {recommended.map(p => (
              <div key={p.id} style={{ padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 12 }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span> {p.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
