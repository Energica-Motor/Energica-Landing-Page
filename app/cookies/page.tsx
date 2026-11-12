import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy | Energica Motor Company",
  description: "How Energica Motor Company uses cookies and similar tracking technologies on its website.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      category="Legal"
      title="Cookie Policy."
      lastUpdated="January 2025"
      relatedLinks={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ]}
      sections={[
        {
          id: "what-are-cookies",
          title: "1. What Are Cookies?",
          content: (
            <>
              <p>A cookie is a small text file that a website places on your device — computer, smartphone, or tablet — when you visit it. Cookies allow the website to remember your actions and preferences over a period of time, so you do not have to re-enter them whenever you return to the site or browse between pages.</p>
              <p>In addition to cookies, we may use similar technologies such as web beacons, pixel tags, and local storage to collect information about how you interact with our Site. This Policy covers all such technologies collectively referred to as "cookies".</p>
            </>
          ),
        },
        {
          id: "who-sets-cookies",
          title: "2. Who Sets Cookies on This Site?",
          content: (
            <>
              <p>Cookies on this Site are set either by us (<strong>first-party cookies</strong>) or by third-party service providers whose services we have integrated into our Site (<strong>third-party cookies</strong>). First-party cookies are set by ENERGICA PTE. LTD. Third-party cookies are set by external companies and are governed by their own privacy and cookie policies.</p>
            </>
          ),
        },
        {
          id: "categories",
          title: "3. Categories of Cookies We Use",
          content: (
            <>
              <h3>Strictly Necessary Cookies</h3>
              <p>These cookies are essential for the Site to function correctly and cannot be disabled in our systems. They are typically set in response to actions you take, such as setting your privacy preferences, logging into an account, or completing a form. Without these cookies, services you have requested — such as a test ride booking form — cannot be provided.</p>
              <p>These cookies do not store any personally identifiable information. You can set your browser to block them, but this may prevent parts of the Site from working.</p>

              <h3>Performance & Analytics Cookies</h3>
              <p>These cookies allow us to count visits and measure traffic sources so we can analyse and improve the performance of our Site. They help us understand which pages are most popular, how visitors move through the Site, and where users arrive from. All information collected by these cookies is aggregated and anonymised.</p>
              <p>We use <strong>Google Analytics</strong> to collect this data. If you do not allow these cookies, we will be unable to monitor Site performance. You can opt out of Google Analytics tracking at any time by visiting <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>

              <h3>Functional Cookies</h3>
              <p>These cookies enable enhanced functionality and personalisation, such as remembering your language preference, region selection, or previously viewed motorcycle models. They may be set by us or by third-party providers integrated into the Site. If you disable these cookies, some features of the Site may not function correctly.</p>

              <h3>Targeting & Marketing Cookies</h3>
              <p>These cookies are set through our Site by our advertising partners. They build a profile of your interests and display relevant advertisements on other sites you visit. They do not store directly identifiable personal information but work by uniquely identifying your browser and device. If you do not allow these cookies, you will receive less targeted advertising across the web.</p>
              <p>Advertising partners whose cookies may be set on this Site include Google, Meta (Facebook), LinkedIn, and others. These partners may use the data collected to serve ads on their platforms based on your interests.</p>
            </>
          ),
        },
        {
          id: "specific-cookies",
          title: "4. Specific Cookies Used",
          content: (
            <>
              <p>The table below lists the primary cookies set on this Site. Third-party cookie lists are subject to change as our services evolve.</p>

              <h3>Strictly Necessary</h3>
              <ul>
                <li><strong>OptanonConsent</strong> — Stores your cookie consent preferences. First-party. Expires: 1 year.</li>
                <li><strong>OptanonAlertBoxClosed</strong> — Records whether the cookie banner has been dismissed. First-party. Expires: 1 year.</li>
                <li><strong>PHPSESSID / session</strong> — Session management cookie. First-party. Expires: Session.</li>
              </ul>

              <h3>Performance & Analytics</h3>
              <ul>
                <li><strong>_ga</strong> — Google Analytics: distinguishes users. First-party. Expires: 2 years.</li>
                <li><strong>_ga_XXXXXXXXXX</strong> — Google Analytics 4: maintains session state. First-party. Expires: 2 years.</li>
                <li><strong>_gid</strong> — Google Analytics: distinguishes users (24-hour window). First-party. Expires: 24 hours.</li>
                <li><strong>_gat_UA-XXXXXXXX</strong> — Google Analytics: throttles request rate. First-party. Expires: 1 minute.</li>
              </ul>

              <h3>Functional</h3>
              <ul>
                <li><strong>geoip / country_code</strong> — Stores detected country to serve localised content. First-party. Expires: 1 day.</li>
                <li><strong>language</strong> — Remembers your selected language preference. First-party. Expires: 1 year.</li>
              </ul>

              <h3>Targeting & Marketing</h3>
              <ul>
                <li><strong>_fbp</strong> — Meta/Facebook Pixel: identifies browsers for advertising. First-party. Expires: 90 days.</li>
                <li><strong>_gcl_au</strong> — Google Ads: stores and tracks conversions. First-party. Expires: 90 days.</li>
                <li><strong>IDE</strong> — Google DoubleClick: used for targeted ads. Third-party (doubleclick.net). Expires: 13 months.</li>
                <li><strong>fr</strong> — Facebook: delivers and measures advertising. Third-party (facebook.com). Expires: 90 days.</li>
                <li><strong>li_gc / UserMatchHistory</strong> — LinkedIn: ad targeting and analytics. Third-party (linkedin.com). Expires: up to 2 years.</li>
                <li><strong>personalization_id</strong> — X (Twitter): ad personalisation. Third-party (twitter.com). Expires: 2 years.</li>
                <li><strong>_ttp</strong> — TikTok: tracks conversions from ads. Third-party (tiktok.com). Expires: 13 months.</li>
              </ul>
            </>
          ),
        },
        {
          id: "managing-cookies",
          title: "5. Managing Your Cookie Preferences",
          content: (
            <>
              <p>When you first visit our Site, you will be shown a cookie consent banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time.</p>
              <p>You can also control cookies through your browser settings. Most browsers allow you to:</p>
              <ul>
                <li>View cookies set on your device and delete them individually or all at once.</li>
                <li>Block third-party cookies.</li>
                <li>Block all cookies from specific sites.</li>
                <li>Block all cookies from being set.</li>
                <li>Delete all cookies when you close your browser.</li>
              </ul>
              <p>Note that restricting cookies may affect the functionality of this Site. For instructions on managing cookies in your browser, refer to your browser&apos;s help documentation:</p>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
              <p>For opting out of interest-based advertising, you may also visit the <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">Your Online Choices</a> platform (EU) or <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">aboutads.info</a> (US).</p>
            </>
          ),
        },
        {
          id: "third-party-services",
          title: "6. Third-Party Services",
          content: (
            <>
              <p>We use the following third-party services on this Site, each of which may set cookies or collect data independently under their own privacy policies:</p>
              <ul>
                <li><strong>Google Analytics</strong> — website analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>Google Ads / DoubleClick</strong> — advertising. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>Meta (Facebook)</strong> — advertising and analytics. <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>LinkedIn</strong> — advertising and analytics. <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>YouTube (Google)</strong> — embedded video. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>HubSpot</strong> — marketing and CRM. <a href="https://legal.hubspot.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              </ul>
              <p>Energica is not responsible for the privacy practices of these third parties.</p>
            </>
          ),
        },
        {
          id: "changes",
          title: "7. Updates to This Policy",
          content: (
            <>
              <p>We may update this Cookie Policy from time to time as our use of cookies changes or as required by applicable law. The "Last updated" date at the top of this page reflects when the Policy was most recently revised. We recommend reviewing this page periodically to stay informed about our cookie practices.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "8. Contact",
          content: (
            <>
              <p>For questions about our use of cookies or this Cookie Policy, please contact:</p>
              <p>
                ENERGICA PTE. LTD.<br />
                10 Anson Road, #33-10C International Plaza, Singapore 079903<br />
                <a href="mailto:privacy@energicamotor.com">privacy@energicamotor.com</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
