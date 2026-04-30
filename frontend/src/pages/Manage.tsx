import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bracketsApi } from '../api/brackets';
import type { Entry } from '../api/brackets';
import { ConfirmModal } from '../components/ConfirmModal';
import styles from './Manage.module.css';

export function Manage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: bracket, isLoading } = useQuery({
    queryKey: ['bracket', slug],
    queryFn: () => bracketsApi.get(slug!),
    enabled: !!slug,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bracket', slug] });

  const { mutate: saveName } = useMutation({
    mutationFn: (name: string) => bracketsApi.update(slug!, { name }),
    onSuccess: () => { setEditingName(false); invalidate(); },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: () => bracketsApi.update(slug!, {
      status: bracket?.status === 'active' ? 'archived' : 'active',
    }),
    onSuccess: invalidate,
  });

  const { mutate: deleteBracket } = useMutation({
    mutationFn: () => bracketsApi.deleteBracket(slug!),
    onSuccess: () => navigate('/dashboard'),
  });

  const { mutate: addEntry, isPending: addingEntry } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (newLabel.trim()) fd.append('label', newLabel.trim());
      if (imageFile) fd.append('image', imageFile);
      return bracketsApi.addEntry(slug!, fd);
    },
    onSuccess: () => { setNewLabel(''); setImageFile(null); invalidate(); },
  });

  const { mutate: removeEntry } = useMutation({
    mutationFn: (entryId: string) => bracketsApi.removeEntry(slug!, entryId),
    onSuccess: invalidate,
  });

  if (isLoading) return <div className={styles.center}>Loading...</div>;
  if (!bracket) return <div className={styles.center}>Bracket not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <Link to="/dashboard" className={styles.navLink}>← My brackets</Link>
        <div className={styles.navLinks}>
          <Link to={`/b/${slug}`} className={styles.navLink}>Vote</Link>
          <Link to={`/b/${slug}/results`} className={styles.navLink}>Results</Link>
        </div>
      </div>

      {/* Bracket header */}
      <div className={styles.header}>
        {editingName ? (
          <form
            className={styles.nameForm}
            onSubmit={e => { e.preventDefault(); saveName(nameInput); }}
          >
            <input
              className={styles.nameInput}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.saveBtn} disabled={!nameInput.trim()}>Save</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setEditingName(false)}>Cancel</button>
          </form>
        ) : (
          <div className={styles.nameRow}>
            <h1 className={styles.title}>{bracket.name}</h1>
            <button className={styles.editBtn} onClick={() => { setNameInput(bracket.name); setEditingName(true); }}>
              Edit
            </button>
          </div>
        )}

        <div className={styles.controls}>
          <span className={styles.status} data-status={bracket.status}>{bracket.status}</span>
          <button className={styles.toggleBtn} onClick={() => toggleStatus()}>
            {bracket.status === 'active' ? 'Archive' : 'Restore'}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete bracket
          </button>
        </div>
      </div>

      {/* Entries */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Entries ({bracket.entries.length})</h2>

        {bracket.entries.length === 0 ? (
          <p className={styles.empty}>No entries yet. Add one below.</p>
        ) : (
          <ul className={styles.entryList}>
            {bracket.entries.map((entry: Entry) => (
              <li key={entry.id} className={styles.entryRow}>
                {entry.image_path && (
                  <img src={entry.image_path} alt={entry.label ?? ''} className={styles.thumb} />
                )}
                <span className={styles.entryLabel}>{entry.label ?? entry.image_path}</span>
                <span className={styles.entryStats}>
                  {Math.round(entry.elo_score)} pts · {entry.win_count}W / {entry.loss_count}L
                </span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeEntry(entry.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add entry form */}
        <form
          className={styles.addForm}
          onSubmit={e => { e.preventDefault(); if (newLabel.trim() || imageFile) addEntry(); }}
        >
          <input
            className={styles.addInput}
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Entry label"
          />
          <input
            className={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="submit"
            className={styles.addBtn}
            disabled={(!newLabel.trim() && !imageFile) || addingEntry}
          >
            {addingEntry ? 'Adding…' : 'Add entry'}
          </button>
        </form>
      </section>
      {showDeleteModal && (
        <ConfirmModal
          message={`Delete "${bracket.name}"? This cannot be undone.`}
          onConfirm={() => { setShowDeleteModal(false); deleteBracket(); }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
