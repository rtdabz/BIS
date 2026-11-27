import { PublicPortalView } from '@/components/portal/PublicPortalView';
import { portalService } from '@/lib/api/portalService';

export default async function PublicLandingPage() {
  const portalData = await portalService.getOverview();

  return <PublicPortalView data={portalData} />;
}
