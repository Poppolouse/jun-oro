// Hook: useHeaderComponent
// Amaç: Son ziyaret edilen sayfaya göre doğru Header bileşenini belirlemek
// Kurallar: NavigationContext.getLastVisitedPage kullanılır ve '/arkade' ile başlayan sayfalarda ArkadeHeader, diğerlerinde genel Header kullanılır.

import Header from "../components/Header";
import ArkadeHeader from "../components/ArkadeHeader";
import { useNavigation } from "../contexts/NavigationContext";

export function useHeaderComponent() {
  const { getLastVisitedPage } = useNavigation();
  const lastVisitedPage = getLastVisitedPage();

  // Standartlaştırılmış seçim mantığı
  const HeaderComponent = lastVisitedPage?.path?.startsWith("/arkade")
    ? ArkadeHeader
    : Header;

  return HeaderComponent;
}

export default useHeaderComponent;
