import { useState, useEffect } from 'react';
import { FileCheck2, Loader2, ShieldCheck, ShieldX } from 'lucide-react'

export default function AddLandListingForm() {
  const [district, setDistrict] = useState('')
  const [surveyNumber, setSurveyNumber] = useState('')
  const [motherDeed, setMotherDeed] = useState(null)
  const [encumbranceCert, setEncumbranceCert] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!district || !surveyNumber || !motherDeed || !encumbranceCert) {
      setFeedback({ type: 'error', message: 'Please fill in all fields and upload both documents.' })
      return
    }

    setIsLoading(true)
    setFeedback({ type: '', message: '' })

    const formData = new FormData()
    formData.append('district', district)
    formData.append('surveyNumber', surveyNumber)
    formData.append('motherDeed', motherDeed)
    formData.append('encumbranceCertificate', encumbranceCert)

    try {
      const response = await fetch('http://localhost:5000/api/properties/verify-documents', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed.')
      }

      setFeedback({ type: 'success', message: result.message })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const FeedbackMessage = () => {
    if (!feedback.message) return null
    const isSuccess = feedback.type === 'success'
    return (
      <div className={`p-4 mb-4 border rounded-md flex items-center space-x-3 ${isSuccess ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
        {isSuccess ? <ShieldCheck className="h-5 w-5" /> : <ShieldX className="h-5 w-5" />}
        <span>{feedback.message}</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md my-12">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        <FileCheck2 className="inline-block h-8 w-8 mr-2" />
        Verify Your Property Documents
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FeedbackMessage />

        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700">District *</label>
          <input
            type="text"
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700">Survey Number *</label>
          <input
            type="text"
            id="surveyNumber"
            value={surveyNumber}
            onChange={(e) => setSurveyNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="motherDeed" className="block text-sm font-medium text-gray-700">Mother Deed (PDF) *</label>
          <input
            type="file"
            id="motherDeed"
            accept=".pdf"
            onChange={(e) => setMotherDeed(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
        </div>

        <div>
          <label htmlFor="encumbranceCert" className="block text-sm font-medium text-gray-700">Encumbrance Certificate (PDF) *</label>
          <input
            type="file"
            id="encumbranceCert"
            accept=".pdf"
            onChange={(e) => setEncumbranceCert(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm & Verify Documents'}
        </button>
      </form>
    </div>
  )
}