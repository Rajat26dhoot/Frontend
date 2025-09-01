import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notes`, formData);
      setNotes([...notes, response.data]);
      setFormData({ title: '', content: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/notes/${selectedNote.id}`, formData);
      setNotes(notes.map(note => note.id === selectedNote.id ? response.data : note));
      setSelectedNote(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedNote) {
      updateNote();
    } else {
      createNote();
    }
  };

  const startEdit = (note = null) => {
    if (note) {
      setSelectedNote(note);
      setFormData({ title: note.title, content: note.content });
    } else {
      setSelectedNote(null);
      setFormData({ title: '', content: '' });
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ title: '', content: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 My Notes</h1>
      </header>

      <div className="app-body">
        <div className="sidebar">
          <button 
            className="new-note-btn"
            onClick={() => startEdit()}
          >
            + New Note
          </button>
          
          <div className="notes-list">
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <h3>{note.title || 'Untitled'}</h3>
                <p>{note.content.substring(0, 100)}...</p>
                <div className="note-actions">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(note); }}>
                    Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="note-form">
              <input
                type="text"
                placeholder="Note title..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Write your note here..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={15}
              />
              <div className="form-actions">
                <button type="submit">
                  {selectedNote ? 'Update Note' : 'Create Note'}
                </button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : selectedNote ? (
            <div className="note-view">
              <h2>{selectedNote.title}</h2>
              <div className="note-meta">
                Created: {formatDate(selectedNote.createdAt)}
                {selectedNote.updatedAt !== selectedNote.createdAt && (
                  <span> | Updated: {formatDate(selectedNote.updatedAt)}</span>
                )}
              </div>
              <div className="note-content">
                {selectedNote.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <button onClick={() => startEdit(selectedNote)}>
                Edit Note
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <h2>Welcome to Notes App</h2>
              <p>Select a note from the sidebar or create a new one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
