/**
 * UPSC Exam Tracker - Local Database Layer (IndexedDB)
 * 100% Client-Side, Zero-Latency, Offline-First Persistence
 */

const DB_NAME = 'upsc_exam_tracker_db';
const DB_VERSION = 1;

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Topic Progress
      if (!db.objectStoreNames.contains('topic_progress')) {
        const store = db.createObjectStore('topic_progress', { keyPath: 'topicId' });
        store.createIndex('readStatus', 'readStatus', { unique: false });
        store.createIndex('lastStudiedAt', 'lastStudiedAt', { unique: false });
      }

      // 2. Revision Schedules (SRS)
      if (!db.objectStoreNames.contains('revision_schedules')) {
        const store = db.createObjectStore('revision_schedules', { keyPath: 'id' });
        store.createIndex('topicId', 'topicId', { unique: false });
        store.createIndex('scheduledDate', 'scheduledDate', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // 3. Mock Tests
      if (!db.objectStoreNames.contains('mock_tests')) {
        const store = db.createObjectStore('mock_tests', { keyPath: 'id' });
        store.createIndex('examStage', 'examStage', { unique: false });
        store.createIndex('testDate', 'testDate', { unique: false });
      }

      // 4. Study Sessions
      if (!db.objectStoreNames.contains('study_sessions')) {
        const store = db.createObjectStore('study_sessions', { keyPath: 'id' });
        store.createIndex('sessionDate', 'sessionDate', { unique: false });
        store.createIndex('subject', 'subject', { unique: false });
      }

      // 5. Mains Written Answers
      if (!db.objectStoreNames.contains('mains_answers')) {
        const store = db.createObjectStore('mains_answers', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 6. Daily Habits / Newspaper Checklist
      if (!db.objectStoreNames.contains('daily_habits')) {
        db.createObjectStore('daily_habits', { keyPath: 'date' });
      }

      // 7. Settings / Meta
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/** Generic Helper to perform transaction */
async function tx(storeName, mode, callback) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);

    transaction.oncomplete = () => resolve(result.value !== undefined ? result.value : result);
    transaction.onerror = () => reject(transaction.error);
  });
}

// ==================== Topic Progress ====================

export async function getTopicProgress(topicId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('topic_progress', 'readonly');
    const store = transaction.objectStore('topic_progress');
    const req = store.get(topicId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProgress() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('topic_progress', 'readonly');
    const store = transaction.objectStore('topic_progress');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTopicProgress(data) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('topic_progress', 'readwrite');
    const store = transaction.objectStore('topic_progress');
    const req = store.put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Spaced Repetition (SRS) ====================

export async function getAllRevisions() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('revision_schedules', 'readonly');
    const store = transaction.objectStore('revision_schedules');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRevisionSchedule(schedule) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('revision_schedules', 'readwrite');
    const store = transaction.objectStore('revision_schedules');
    const req = store.put(schedule);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRevisionSchedule(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('revision_schedules', 'readwrite');
    const store = transaction.objectStore('revision_schedules');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Mock Tests ====================

export async function getAllMockTests() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mock_tests', 'readonly');
    const store = transaction.objectStore('mock_tests');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMockTest(mock) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mock_tests', 'readwrite');
    const store = transaction.objectStore('mock_tests');
    const req = store.put(mock);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMockTest(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mock_tests', 'readwrite');
    const store = transaction.objectStore('mock_tests');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Study Sessions ====================

export async function getAllStudySessions() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('study_sessions', 'readonly');
    const store = transaction.objectStore('study_sessions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStudySession(session) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('study_sessions', 'readwrite');
    const store = transaction.objectStore('study_sessions');
    const req = store.put(session);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Mains Written Answers ====================

export async function getAllMainsAnswers() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mains_answers', 'readonly');
    const store = transaction.objectStore('mains_answers');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMainsAnswer(answer) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mains_answers', 'readwrite');
    const store = transaction.objectStore('mains_answers');
    const req = store.put(answer);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMainsAnswer(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('mains_answers', 'readwrite');
    const store = transaction.objectStore('mains_answers');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Daily Habits ====================

export async function getDailyHabits(date) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('daily_habits', 'readonly');
    const store = transaction.objectStore('daily_habits');
    const req = store.get(date);
    req.onsuccess = () => resolve(req.result || {
      date,
      theHindu: false,
      pib: false,
      monthlyMag: false,
      notesRevised: false,
      answerWritten: false
    });
    req.onerror = () => reject(req.error);
  });
}

export async function saveDailyHabits(habits) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('daily_habits', 'readwrite');
    const store = transaction.objectStore('daily_habits');
    const req = store.put(habits);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ==================== Data Export & Import ====================

export async function exportAllData() {
  const [progress, revisions, mocks, sessions, answers, habits] = await Promise.all([
    getAllProgress(),
    getAllRevisions(),
    getAllMockTests(),
    getAllStudySessions(),
    getAllMainsAnswers(),
    new Promise(async (resolve) => {
      const db = await getDB();
      const tx = db.transaction('daily_habits', 'readonly');
      const req = tx.objectStore('daily_habits').getAll();
      req.onsuccess = () => resolve(req.result || []);
    })
  ]);

  return {
    version: 1,
    exportDate: new Date().toISOString(),
    appName: 'UPSC Aspirant Exam Tracker',
    data: {
      topic_progress: progress,
      revision_schedules: revisions,
      mock_tests: mocks,
      study_sessions: sessions,
      mains_answers: answers,
      daily_habits: habits
    }
  };
}

export async function importAllData(importedJson) {
  if (!importedJson || !importedJson.data) {
    throw new Error('Invalid backup file format.');
  }

  const { topic_progress, revision_schedules, mock_tests, study_sessions, mains_answers, daily_habits } = importedJson.data;
  const db = await getDB();

  const stores = ['topic_progress', 'revision_schedules', 'mock_tests', 'study_sessions', 'mains_answers', 'daily_habits'];
  const transaction = db.transaction(stores, 'readwrite');

  if (Array.isArray(topic_progress)) {
    const store = transaction.objectStore('topic_progress');
    topic_progress.forEach(item => store.put(item));
  }

  if (Array.isArray(revision_schedules)) {
    const store = transaction.objectStore('revision_schedules');
    revision_schedules.forEach(item => store.put(item));
  }

  if (Array.isArray(mock_tests)) {
    const store = transaction.objectStore('mock_tests');
    mock_tests.forEach(item => store.put(item));
  }

  if (Array.isArray(study_sessions)) {
    const store = transaction.objectStore('study_sessions');
    study_sessions.forEach(item => store.put(item));
  }

  if (Array.isArray(mains_answers)) {
    const store = transaction.objectStore('mains_answers');
    mains_answers.forEach(item => store.put(item));
  }

  if (Array.isArray(daily_habits)) {
    const store = transaction.objectStore('daily_habits');
    daily_habits.forEach(item => store.put(item));
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearAllUserData() {
  const db = await getDB();
  const stores = ['topic_progress', 'revision_schedules', 'mock_tests', 'study_sessions', 'mains_answers', 'daily_habits'];
  const transaction = db.transaction(stores, 'readwrite');

  stores.forEach(name => {
    transaction.objectStore(name).clear();
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}
