import { createNavbar } from '../../components/navbar';
import { getUserDetails } from '../../utils/userDetails.utils';

export async function renderDashboardLayout(content: HTMLElement): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.className = 'dashboard-layout';

  const userProfile = await getUserDetails();
  
  const navbar = createNavbar(userProfile);
  container.appendChild(navbar);
  
  const contentArea = document.createElement('div');
  contentArea.className = 'dashboard-content';
  contentArea.style.paddingTop = '80px'; 
  contentArea.appendChild(content);
  
  container.appendChild(contentArea);
  
  return container;
}