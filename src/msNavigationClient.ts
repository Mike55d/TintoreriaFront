import { NavigationClient } from '@azure/msal-browser';

/**
 * This is an example for overriding the default function MSAL uses to navigate to other urls in your webpage
 */
export class CustomNavigationClient extends NavigationClient {
  public router: any;

  constructor(router: any) {
    super();
    this.router = router;
  }

  /**
   * Navigates to other pages within the same web application
   * You can use the useRouter hook provided by next.js to take advantage of client-side routing
   * @param url
   * @param options
   */
  async navigateInternal(url: any, options: any) {
    return false;
  }
}
