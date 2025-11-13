import React, { useState } from "react";

/**
 * CampaignTools Component - Campaign yönetim araçları (Import, AI Prompt, Yeni Campaign)
 * @param {Object} props - Component props
 * @param {Function} props.onImport - Import fonksiyonu
 * @param {Function} props.onGeneratePrompt - AI prompt oluşturma fonksiyonu
 * @param {Function} props.onNewCampaign - Yeni campaign oluşturma fonksiyonu
 * @param {Object} props.selectedGame - Seçilen oyun
 */
const CampaignTools = ({
  onImport,
  onGeneratePrompt,
  onNewCampaign,
  selectedGame,
}) => {
  const [showImport, setShowImport] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [importText, setImportText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  /**
   * Metin dosyasından import yapar
   */
  const handleImport = () => {
    if (!importText.trim()) return;
    onImport(importText);
    setImportText("");
    setShowImport(false);
  };

  /**
   * AI prompt'u kopyalar
   */
  const copyPromptToClipboard = () => {
    try {
      void navigator.clipboard.writeText(aiPrompt).catch(() => {});
    } catch (error) {
      console.error("Kopyalama hatası:", error);
    }
  };

  /**
   * AI prompt oluşturur
   */
  const generateAIPrompt = () => {
    const gameInfo = selectedGame
      ? `Game: ${selectedGame.name}`
      : "Game: [Game Name]";

    const prompt = `Please analyze this game and create a comprehensive campaign system:

${gameInfo}

Current campaigns: [No campaigns yet]

Please provide:
1. Campaign names and descriptions
2. Average completion times for each campaign
3. Unique characteristics/playstyles for each campaign
4. Any sub-campaigns or variations
5. Recommended difficulty levels or special features

Format each campaign as: Name | Duration | Description | Special Properties

User customization notes: [Add your specific requirements here]

Please make this comprehensive and detailed for a game library management system.`;

    setAiPrompt(prompt);
    setShowAIPrompt(true);
  };

  return (
    <div className="space-y-6" data-ers="add-game-modal.campaign-tools">
      {/* Tool Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TXT Import Button */}
        <button
          onClick={() => setShowImport(true)}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
          data-ers="add-game-modal.import-button"
        >
          <div className="text-blue-400 text-2xl mb-2">📄</div>
          <div className="text-white font-medium">TXT Import</div>
          <div className="text-gray-400 text-xs">
            Metin dosyasından içe aktar
          </div>
        </button>

        {/* AI Prompt Button */}
        <button
          onClick={generateAIPrompt}
          className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
          data-ers="add-game-modal.ai-prompt-button"
        >
          <div className="text-purple-400 text-2xl mb-2">🤖</div>
          <div className="text-white font-medium">AI Prompt</div>
          <div className="text-gray-400 text-xs">
            Yapay zeka için prompt oluştur
          </div>
        </button>

        {/* New Campaign Button */}
        <button
          onClick={onNewCampaign}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
          data-ers="add-game-modal.new-campaign-button"
        >
          <div className="text-green-400 text-2xl mb-2">➕</div>
          <div className="text-white font-medium">Yeni Campaign</div>
          <div className="text-gray-400 text-xs">Manuel olarak ekle</div>
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">TXT Import</h3>
              <p className="text-gray-400 text-sm mt-1">
                Her satırda: Campaign Adı | Süre | Açıklama
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Main Story | 25 saat | Ana hikaye kampanyası\nEvil Playthrough | 30 saat | Kötü karakter ile oynama\nNosferatu Clan | 35 saat | Nosferatu vampiri olarak oynama`}
                rows={8}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none"
                data-ers="add-game-modal.import-textarea"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                data-ers="add-game-modal.import-submit-button"
              >
                Import Et
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                data-ers="add-game-modal.import-cancel-button"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                AI Prompt Oluşturucu
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Bu prompt'u yapay zekaya vererek campaign'leri otomatik
                oluşturabilirsiniz
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none font-mono text-sm"
                readOnly
                data-ers="add-game-modal.ai-prompt-textarea"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={copyPromptToClipboard}
                className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                data-ers="add-game-modal.copy-prompt-button"
              >
                📋 Prompt'u Kopyala
              </button>
              <button
                onClick={() => setShowAIPrompt(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                data-ers="add-game-modal.close-prompt-button"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTools;
