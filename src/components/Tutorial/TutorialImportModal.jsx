import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTutorialAdmin } from '../../hooks/useTutorial'
import { parseTutorialText } from '../../utils/tutorialImportParser'

function TutorialImportModal({ isOpen, onClose, onProceedToEdit }) {
  const { isAdmin, saveTutorial, listTutorials } = useTutorialAdmin()
  const [parsed, setParsed] = useState(null)
  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [existingIds, setExistingIds] = useState([])

  if (!isOpen) return null

  const handleFile = async (file) => {
    setStatus('')
    setErrors([])
    setParsed(null)
    try {
      const text = await file.text()
      const { tutorial, errors } = parseTutorialText(text)
      setErrors(errors || [])
      setParsed(tutorial)
      // Mevcut ID’leri listele (overwrite uyarısı için)
      try {
        const list = await listTutorials()
        setExistingIds(list.map(t => t.id))
      } catch {}
    } catch (e) {
      setErrors([`Dosya okunamadı: ${e.message}`])
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const importAndSave = async () => {
    if (!parsed) return
    try {
      setIsSaving(true)
      await saveTutorial(parsed.id, parsed)
      setStatus('İçe aktarılan tutorial kaydedildi.')
      setTimeout(() => {
        setStatus('')
        onClose()
      }, 1500)
    } catch (e) {
      setErrors([`Kaydedilirken hata: ${e.message}`])
    } finally {
      setIsSaving(false)
    }
  }

  const proceedToEditor = () => {
    if (!parsed) return
    try {
      // Yeni oluşturma modali açıldığında draft’tan otomatik dolsun
      const payload = { tutorialData: parsed, currentStep: 0, ts: Date.now() }
      localStorage.setItem('junoro:tutorialDraft:new', JSON.stringify(payload))
    } catch {}
    onProceedToEdit(parsed)
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-600/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-sm">⬇️</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">TXT’den İçe Aktar</h3>
              <p className="text-xs text-gray-400">JSON veya DSL formatlı .txt dosyasını içe aktar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-700/50 hover:bg-red-600/20 border border-slate-600/50 hover:border-red-500/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-300 transition-all"
            title="Kapat"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!isAdmin && (
            <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              Bu özelliği kullanmak için admin yetkisine sahip olmanız gerekir.
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">.txt Dosyası Seç</label>
            <input
              type="file"
              accept=".txt"
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
            <p className="text-xs text-gray-400">Desteklenen formatlar: Tutorial JSON veya DSL ([TUTORIAL], [TARGET_PAGE], [SETTINGS], [STEP])</p>
          </div>

          {errors && errors.length > 0 && (
            <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3">
              <ul className="list-disc list-inside text-red-300 text-sm">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parsed && (
            <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-white font-semibold">{parsed.title}</div>
                  <div className="text-gray-400 text-sm">ID: <span className="font-mono">{parsed.id}</span></div>
                  <div className="text-gray-400 text-sm">Versiyon: {parsed.version}</div>
                  {parsed.targetPage && (
                    <div className="text-gray-400 text-sm">Hedef Sayfa: {parsed.targetPage.pageName} ({parsed.targetPage.pagePath})</div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {existingIds.includes(parsed.id) ? (
                    <span className="text-yellow-300">Uyarı: Bu ID zaten mevcut, kaydedilirse üzerine yazılacak.</span>
                  ) : (
                    <span>Yeni ID</span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-300">Toplam Adım: {parsed.steps?.length || 0}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {parsed.steps.slice(0, 6).map((step, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded p-2 text-sm">
                      <div className="text-white truncate">{idx + 1}. {step.title || 'Başlıksız'}</div>
                      <div className="text-gray-400 text-xs truncate">Target: {step.target || '—'}</div>
                    </div>
                  ))}
                  {parsed.steps.length > 6 && (
                    <div className="bg-slate-700/30 rounded p-2 text-sm text-gray-400 flex items-center justify-center">+{parsed.steps.length - 6} daha…</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
            >
              İptal
            </button>
            <button
              onClick={proceedToEditor}
              disabled={!parsed}
              className={`px-4 py-2 rounded-lg ${parsed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 text-gray-400'}`}
            >
              Düzenleyiciye Aktar
            </button>
            <button
              onClick={importAndSave}
              disabled={!parsed || isSaving}
              className={`px-4 py-2 rounded-lg ${parsed && !isSaving ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 text-gray-400'}`}
            >
              {isSaving ? 'Kaydediliyor…' : 'İçe Aktar ve Kaydet'}
            </button>
          </div>

          {status && (
            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">{status}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TutorialImportModal