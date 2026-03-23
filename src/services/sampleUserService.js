const API_URL = "http://localhost:5000/api/sample-users"

export const getSampleUserEmails = async () => {
  const res = await fetch(`${API_URL}/emails`)
  if (!res.ok) throw new Error("Failed to fetch sample user emails")
  return res.json()
}

export const getCurrentSampleUserEmail = async () => {
  const res = await fetch(`${API_URL}/current-email`)
  if (!res.ok) throw new Error("Failed to fetch current sample user email")
  return res.json()
}

export const setCurrentSampleUserEmail = async (email) => {
  const res = await fetch(`${API_URL}/current-email`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error("Failed to set current sample user email")
  return res.json()
}

