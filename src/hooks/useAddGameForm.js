import { useReducer } from 'react';

/**
 * @typedef {Object} FormState
 * @property {string} searchTerm - Oyun bulmak için arama terimi.
 * @property {Array} searchResults - Oyun aramasından gelen sonuçlar.
 * @property {Object|null} selectedGame - Arama sonuçlarından seçilen oyun.
 * @property {string} status - Oyunun durumu (örn. 'completed', 'backlog').
 * @property {number} score - Kullanıcının oyuna verdiği puan.
 * @property {string} startDate - Kullanıcının oyuna başladığı tarih.
 * @property {string} completionDate - Kullanıcının oyunu bitirdiği tarih.
 * @property {string} comments - Kullanıcının oyun hakkındaki yorumları.
 * @property {boolean} isSubmitting - Formun gönderilip gönderilmediğini belirten bayrak.
 * @property {Object|null} error - Gönderim sırasında oluşan herhangi bir hata.
 */

/** @type {FormState} */
const initialState = {
  searchTerm: '',
  searchResults: [],
  selectedGame: null,
  status: 'completed',
  score: 0,
  startDate: '',
  completionDate: '',
  comments: '',
  isSubmitting: false,
  error: null,
};

/**
 * Oyun ekleme formu state'i için reducer fonksiyonu.
 *
 * @param {FormState} state - Mevcut state.
 * @param {Object} action - Gerçekleştirilecek eylem.
 * @param {string} action.type - Eylemin türü.
 * @param {string} [action.field] - Güncellenecek alan.
 * @param {*} [action.payload] - Eylem için veri.
 * @returns {FormState} Yeni state.
 */
function formReducer(state, action) {
  switch (action.type) {
    case 'field_update':
      return {
        ...state,
        [action.field]: action.payload,
      };
    case 'set_search_results':
      return {
        ...state,
        searchResults: action.payload,
      };
    case 'select_game':
        return {
            ...state,
            selectedGame: action.payload,
            searchTerm: action.payload ? action.payload.name : '',
            searchResults: [],
        }
    case 'reset_form':
      return initialState;
    default:
      throw new Error(`İşlenmemiş eylem türü: ${action.type}`);
  }
}

/**
 * Oyun Ekleme formunun state'ini yönetmek için custom hook.
 *
 * Bu hook, kullanıcının kütüphanesine yeni bir oyun eklemek için kullanılan formun mantığını kapsar.
 * Arama terimleri, arama sonuçları, seçilen oyun detayları ve kullanıcı tarafından sağlanan
 * kütüphane bilgileri de dahil olmak üzere formun karmaşık state'ini yönetmek için bir reducer kullanır.
 *
 * @returns {{formState: FormState, dispatch: React.Dispatch<Object>}} Form state'ini ve onu güncellemek için bir dispatch fonksiyonu içeren bir nesne.
 */
export function useAddGameForm() {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  return { formState, dispatch };
}