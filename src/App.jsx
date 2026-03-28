import React, { useState, useEffect } from 'react'
import { PLANTS_DB, generateTasks, estimateYield } from './db/plants.js'

function App() {
  const [plants, setPlants] = useState([])
  const [tasks, setTasks] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState(null)
  
  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('greenhub-plants')
    if (saved) {
      setPlants(JSON.parse(saved))
    }
  }, [])
  
  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('greenhub-plants', JSON.stringify(plants))
  }, [plants])
  
  // Ajouter un plant
  const addPlant = (plantData) => {
    const newPlant = {
      id: Date.now().toString(),
      ...plantData,
      addedDate: new Date().toISOString(),
      status: 'growing'
    }
    
    // Générer les tâches auto
    const autoTasks = generateTasks(plantData.id, plantData.plantedDate)
    setTasks(prev => [...prev, ...autoTasks])
    
    // Estimer la récolte
    const yieldEstimate = estimateYield(plantData.id, plantData.count || 1)
    
    setPlants(prev => [...prev, { ...newPlant, yieldEstimate }])
    setShowAddForm(false)
  }
  
  // Supprimer un plant
  const removePlant = (plantId) => {
    setPlants(prev => prev.filter(p => p.id !== plantId))
  }
  
  // Stats
  const totalPlants = plants.length
  const totalTasks = tasks.filter(t => !t.completed).length
  const estimatedHarvest = plants.reduce((sum, p) => sum + (p.yieldEstimate?.avg || 0), 0)
  
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🌱 GreenHub</h1>
        <p>Mon Jardin Intelligent</p>
      </header>
      
      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-icon">🌿</span>
          <div>
            <div className="stat-value">{totalPlants}</div>
            <div className="stat-label">Plants</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Tâches</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🧺</span>
          <div>
            <div className="stat-value">{estimatedHarvest.toFixed(1)} kg</div>
            <div className="stat-label">Récolte estimée</div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="actions">
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          ➕ Ajouter un plant
        </button>
      </div>
      
      {/* Liste des plants */}
      <div className="plants-list">
        <h2>Mes Plants</h2>
        {plants.length === 0 ? (
          <p className="empty">Aucun plant — Commence ton jardin ! 🌱</p>
        ) : (
          plants.map(plant => (
            <div key={plant.id} className="plant-card">
              <div className="plant-header">
                <span className="plant-icon">{plant.icon}</span>
                <div className="plant-info">
                  <h3>{plant.name}</h3>
                  <p>{plant.variety}</p>
                </div>
                <button 
                  className="btn-delete"
                  onClick={() => removePlant(plant.id)}
                >
                  ✕
                </button>
              </div>
              
              <div className="plant-details">
                <div className="detail">
                  <span className="detail-label">📅 Planté le</span>
                  <span className="detail-value">
                    {new Date(plant.plantedDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">📍 Emplacement</span>
                  <span className="detail-value">{plant.location}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">🧺 Récolte estimée</span>
                  <span className="detail-value">
                    {plant.yieldEstimate?.avg?.toFixed(1) || '?'} {plant.yieldEstimate?.unit}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Formulaire d'ajout */}
      {showAddForm && (
        <AddPlantForm
          plants={PLANTS_DB}
          onAdd={addPlant}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

// Formulaire d'ajout
function AddPlantForm({ plants, onAdd, onCancel }) {
  const [selectedPlantId, setSelectedPlantId] = useState('')
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('greenhouse')
  const [count, setCount] = useState(1)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedPlantId) return
    
    const plant = plants.find(p => p.id === selectedPlantId)
    onAdd({
      id: selectedPlantId,
      name: plant.name,
      variety: plant.variety,
      icon: plant.icon,
      plantedDate,
      location,
      count
    })
  }
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>➕ Ajouter un plant</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plante</label>
            <select 
              value={selectedPlantId} 
              onChange={(e) => setSelectedPlantId(e.target.value)}
              required
            >
              <option value="">Sélectionner...</option>
              {plants.map(plant => (
                <option key={plant.id} value={plant.id}>
                  {plant.icon} {plant.name} — {plant.variety}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date de plantation</label>
            <input 
              type="date" 
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Emplacement</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="greenhouse">🏠 Serre</option>
              <option value="outdoor">☀️ Extérieur</option>
              <option value="balcon">🌆 Balcon</option>
              <option value="indoor">🏡 Intérieur</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Quantité</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
