import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fire-and-forget: update user profile in Firestore (don't block auth)
        import('firebase/firestore').then(({ doc, setDoc, serverTimestamp }) => {
          import('../config/firebase').then(({ db }) => {
            setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              lastActiveAt: serverTimestamp(),
            }, { merge: true }).catch(e => console.warn('Could not update user profile:', e))
          })
        }).catch(() => {})
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      console.error('Sign-in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign-out error:', error)
      throw error
    }
  }

  return { user, loading, signInWithGoogle, signOut }
}
