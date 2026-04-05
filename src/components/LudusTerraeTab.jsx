// =============================================
// LudusTerraeTab — Embed Ludus Terrae V2 in GreenHub
// =============================================

import { useEffect, useRef, useState } from 'react';
import { RealisticApp } from '../graphics/threejs/realistic/app.js';
import GardenPlannerPanel from './gardenPlanner/GardenPlannerPanel.jsx';

export default function LudusTerraeTab({ onOpenSerreBois }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const initializedRef = useRef(false);

  // État UI同步 depuis RealisticApp
  const [gameUI, setGameUI] = useState({ score: 0, coins: 100, streak: 0 });
  const [isDragMode, setIsDragMode] = useState(false);
  const [isSeedDragMode, setIsSeedDragMode] = useState(false);
  const [isGreenhouseMode, setIsGreenhouseMode] = useState(false);
  const [is2DPlannerOpen, setIs2DPlannerOpen] = useState(false);
  const [activeSeason, setActiveSeason] = useState('spring');
  const [activeWeather, setActiveWeather] = useState('clear');

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;

    const app = new RealisticApp();
    appRef.current = app;

    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (appRef.current && appRef.current.renderer && container.offsetWidth > 0) {
          const w = container.offsetWidth;
          const h = container.offsetHeight;
          appRef.current.renderer.setSize(w, h);
          appRef.current.camera.aspect = w / h;
          appRef.current.camera.updateProjectionMatrix();
        }
      }, 100);
    });

    app.init(container).then(() => {
      app.startAnimation();
      resizeObserver.observe(container);

      // Enregistrer le callback pour ouvrir la serre en bois
      app.setOnOpenSerreBois((uid) => {
        if (onOpenSerreBois) onOpenSerreBois(uid);
      });

      // Polling état du jeu toutes les 300ms
      const pollInterval = setInterval(() => {
        if (appRef.current) {
          const state = appRef.current.getGameState();
          setGameUI({
            score: state.score || 0,
            coins: state.coins || 0,
            streak: state.streak || 0,
          });
          setIsDragMode(appRef.current.isDragMode || false);
          setIsSeedDragMode(appRef.current.isSeedDragMode || false);
          setIsGreenhouseMode(appRef.current.isGreenhousePlacementMode || false);
        }
      }, 300);

      // Sync notification globally
      window.showNotification = (msg) => {
        // Could emit to a toast here if needed
        console.log('[Notification]', msg);
      };

      return () => clearInterval(pollInterval);
    }).catch(err => {
      console.error('❌ LudusTerraeTab init failed:', err);
    });

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      if (appRef.current) {
        appRef.current.stopAnimation();
      }
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleToggleDrag = () => {
    if (!appRef.current) return;
    const next = !isDragMode;
    if (next) {
      appRef.current.disableSeedDragMode();
      setIsSeedDragMode(false);
    }
    appRef.current.setDragMode(next);
    setIsDragMode(next);
  };

  const handleToggleSeedDrag = () => {
    if (!appRef.current) return;
    const next = !isSeedDragMode;
    if (next) {
      appRef.current.setDragMode(false);
      setIsDragMode(false);
      appRef.current.enableSeedDragMode();
    } else {
      appRef.current.disableSeedDragMode();
    }
    setIsSeedDragMode(next);
  };

  const handleToggleGreenhouse = () => {
    if (!appRef.current) return;
    if (isGreenhouseMode) {
      appRef.current.cancelGreenhousePlacement();
      setIsGreenhouseMode(false);
    } else {
      appRef.current.startGreenhousePlacement();
      setIsGreenhouseMode(true);
    }
  };

  const handleShop = () => {
    if (appRef.current) appRef.current.openShop();
  };

  const handleChat = () => {
    if (appRef.current) {
      if (appRef.current.isChatOpen) {
        appRef.current.closeChat();
      } else {
        appRef.current.openChat();
      }
    }
  };

  const handleEvolve = () => {
    if (appRef.current) appRef.current.performAutoEvolution();
  };

  const handleSerres = () => {
    if (appRef.current) appRef.current.showSerreManagement();
  };

  const handleResetCam = () => {
    if (appRef.current) appRef.current.resetCamera();
  };

  const handleClearAll = () => {
    if (!appRef.current) return;
    if (window.confirm('🗑️ Supprimer TOUS les objets du jardin (arbres, clôtures, serres, cailloux) ?')) {
      appRef.current.clearAllGrid();
    }
  };

  const handleSeason = (s) => {
    if (appRef.current) appRef.current.setSeason(s);
    setActiveSeason(s);
  };

  const handleWeather = (w) => {
    if (appRef.current) appRef.current.setWeather(w);
    setActiveWeather(w);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const btnStyle = (active) => ({
    background: active ? 'rgba(46,204,113,0.4)' : 'rgba(0,0,0,0.7)',
    border: `2px solid ${active ? '#2ecc71' : '#444'}`,
    color: 'white',
    padding: '8px 14px',
    borderRadius: 10,
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s',
  });

  const envBtnStyle = (active) => ({
    background: active ? 'rgba(126,217,87,0.4)' : 'rgba(0,0,0,0.7)',
    border: `2px solid ${active ? '#7ed957' : '#444'}`,
    color: 'white',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  });

  const kbdStyle = { background: '#333', padding: '1px 5px', borderRadius: 3, color: '#2ecc71' };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 500, fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Stats game ── */}
      <div style={{
        position: 'absolute', top: 10, left: 14, zIndex: 20,
        background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(46,204,113,0.35)',
        borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(10px)',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>🌱 Ludus Terrae</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Score</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#7ed957' }}>{gameUI.score}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Pièces</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>{gameUI.coins}€</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Streak</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6b6b' }}>{gameUI.streak}🔥</div>
          </div>
        </div>
      </div>

      {/* ── Mode indicator ── */}
      {(isDragMode || isSeedDragMode) && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          background: isDragMode ? 'rgba(46,204,113,0.3)' : 'rgba(126,217,87,0.3)',
          padding: '8px 16px', borderRadius: 20, color: '#2ecc71', fontSize: 12,
          fontWeight: 600, backdropFilter: 'blur(10px)',
        }}>
          {isDragMode ? '🖐️ Mode Déplacement' : '🌱 Mode Positionner'}
        </div>
      )}

      {/* ── Env controls (season/weather) ── */}
      <div style={{
        position: 'absolute', top: 10, right: 14, zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['spring','🌸'],['summer','☀️'],['autumn','🍂'],['winter','❄️']].map(([s,icon]) => (
            <button key={s} style={envBtnStyle(activeSeason === s)} onClick={() => handleSeason(s)} title={`Saison: ${s}`}>{icon}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['clear','☀️'],['cloudy','🌥️'],['rainy','🌧️']].map(([w,icon]) => (
            <button key={w} style={envBtnStyle(activeWeather === w)} onClick={() => handleWeather(w)} title={`Météo: ${w}`}>{icon}</button>
          ))}
        </div>
      </div>

      {/* ── Action bar ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', gap: 8,
      }}>
        <button style={btnStyle(false)} onClick={handleShop}>🛒 Boutique</button>
        <button style={btnStyle(isDragMode)} onClick={handleToggleDrag}>🖐️ Déplacer</button>
        <button style={btnStyle(isSeedDragMode)} onClick={handleToggleSeedDrag}>🌱 Positionner</button>
        <button style={btnStyle(false)} onClick={handleEvolve}>🧬 Évoluer</button>
        <button style={btnStyle(false)} onClick={handleChat}>🤖 Chat IA</button>
        <button style={btnStyle(isGreenhouseMode)} onClick={handleToggleGreenhouse}>🏡 Serre Réelle</button>
        <button style={btnStyle(is2DPlannerOpen)} onClick={() => setIs2DPlannerOpen(v => !v)}>🗺️ Planneur 2D</button>
        <button style={btnStyle(false)} onClick={handleResetCam}>🔄 Reset Cam</button>
        <button style={{ ...btnStyle(false), borderColor: '#e74c3c', color: '#ff6b6b' }} onClick={handleClearAll}>🗑️ Tout supprimer</button>
      </div>

      {/* ── Hint ── */}
      <div style={{
        position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(46,204,113,0.3)',
        borderRadius: 8, padding: '5px 12px', fontSize: 10, color: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
      }}>
        📐 <kbd style={kbdStyle}>P</kbd> = Arbres · <kbd style={kbdStyle}>V</kbd> = Fine · <kbd style={kbdStyle}>L</kbd> = Ligne · <kbd style={kbdStyle}>R</kbd> = Rect · <kbd style={kbdStyle}>Ctrl+Z</kbd> = Undo · Clic serre = entrer
      </div>

      {/* ── 3D Canvas (always mounted so app stays initialized) ── */}
      <div
        ref={containerRef}
        id="ludus-terrae-container"
        style={{ width: '100%', height: 'calc(100vh - 220px)', borderRadius: 12, overflow: 'hidden', border: '3px solid rgba(60,90,30,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      />

      {/* ── 2D Garden Planner overlay ── */}
      {is2DPlannerOpen && (
        <GardenPlannerPanel
          onTransfer={(planData) => {
            if (appRef.current) {
              appRef.current.transferGardenPlan(planData);
              setIs2DPlannerOpen(false);
            }
          }}
          onClose={() => setIs2DPlannerOpen(false)}
        />
      )}
    </div>
  );
}
