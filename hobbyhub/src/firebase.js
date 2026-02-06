import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlVo6j7oKNXVKqHoJep6PZ5byLNQVtk7s",
  authDomain: "global-b-mask.firebaseapp.com",
  projectId: "global-b-mask",
  storageBucket: "global-b-mask.firebasestorage.app",
  messagingSenderId: "896356020124",
  appId: "1:896356020124:web:bf86dae3906c3b7586e259",
  measurementId: "G-TED26VBTTJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
