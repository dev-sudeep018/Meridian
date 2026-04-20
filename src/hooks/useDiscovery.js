import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

export function useDiscovery(discoveryId) {
  const [discovery, setDiscovery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!discoveryId) {
      setDiscovery(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = onSnapshot(
      doc(db, 'discoveries', discoveryId),
      (snapshot) => {
        if (snapshot.exists()) {
          setDiscovery({ id: snapshot.id, ...snapshot.data() })
        } else {
          setDiscovery(null)
          setError('Discovery not found')
        }
        setLoading(false)
      },
      (err) => {
        console.error('Discovery listener error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [discoveryId])

  return { discovery, loading, error }
}
