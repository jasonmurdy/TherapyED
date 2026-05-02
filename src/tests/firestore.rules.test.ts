import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  const adminContext = {
    uid: 'admin-id',
    email: 'jasonmurdy@gmail.com',
    email_verified: true,
  };

  const userContext = {
    uid: 'user-id',
    email: 'user@example.com',
    email_verified: true,
  };

  it('Payload 1: Should deny creation of PortfolioItem with shadow fields', async () => {
    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: true }).firestore();
    const itemRef = doc(db, 'portfolio_items/item1');
    await assertFails(setDoc(itemRef, {
      title: 'Project',
      category: 'Cat',
      img: 'url',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true, // Shadow field
    }));
  });

  it('Payload 2: Should deny creation of Chat for another user', async () => {
    const db = testEnv.authenticatedContext(userContext.uid, { email: userContext.email, email_verified: true }).firestore();
    const chatRef = doc(db, 'users/victim-id/chats/chat1');
    await assertFails(setDoc(chatRef, {
      prompt: 'Hello',
      createTime: new Date(),
    }));
  });

  it('Payload 3: Should deny creation with a poisoned ID', async () => {
    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: true }).firestore();
    const longId = 'a'.repeat(200);
    const itemRef = doc(db, `portfolio_items/${longId}`);
    await assertFails(setDoc(itemRef, {
      title: 'Project',
      category: 'Cat',
      img: 'url',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('Payload 4: Should deny non-admin reading inquiries', async () => {
    const db = testEnv.authenticatedContext(userContext.uid, { email: userContext.email, email_verified: true }).firestore();
    const inquiriesRef = collection(db, 'inquiries');
    await assertFails(getDocs(inquiriesRef));
  });

  it('Payload 5: Should deny updating immutable createdAt', async () => {
    // Setup existing doc
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'services/s1'), {
        title: 'Service',
        description: 'Desc',
        order: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      });
    });

    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: true }).firestore();
    const serviceRef = doc(db, 'services/s1');
    await assertFails(setDoc(serviceRef, {
      title: 'Service',
      description: 'Desc',
      order: 1,
      createdAt: new Date(), // Modified
      updatedAt: new Date(),
    }));
  });

  it('Payload 6: Should deny creation with over-sized description', async () => {
    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: true }).firestore();
    const itemRef = doc(db, 'portfolio_items/item1');
    await assertFails(setDoc(itemRef, {
      title: 'Project',
      category: 'Cat',
      img: 'url',
      order: 1,
      description: 'a'.repeat(10001),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('Payload 9: Should deny updating immutable prompt in Chat', async () => {
     await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users/user-id/chats/chat1'), {
        prompt: 'Old Prompt',
        createTime: new Date(),
      });
    });

    const db = testEnv.authenticatedContext(userContext.uid, { email: userContext.email, email_verified: true }).firestore();
    const chatRef = doc(db, 'users/user-id/chats/chat1');
    await assertFails(setDoc(chatRef, {
      prompt: 'New Prompt', // Attempt to change
      response: 'Bot response',
    }));
  });

  it('Payload 10: Should deny creation with over-sized gallery list', async () => {
    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: true }).firestore();
    const itemRef = doc(db, 'portfolio_items/item1');
    await assertFails(setDoc(itemRef, {
      title: 'Project',
      category: 'Cat',
      img: 'url',
      order: 1,
      gallery: Array(51).fill('url'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('Payload 11: Should deny admin with unverified email', async () => {
    const db = testEnv.authenticatedContext(adminContext.uid, { email: adminContext.email, email_verified: false }).firestore();
    const settingRef = doc(db, 'settings/main');
    await assertFails(setDoc(settingRef, {
      brandName: 'New Brand',
      updatedAt: new Date(),
    }));
  });
});
