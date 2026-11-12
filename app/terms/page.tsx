import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | Energica Motor Company",
  description: "Terms and conditions governing your use of the Energica Motor Company website.",
};

export default function TermsPage() {
  return (
    <LegalPage
      category="Legal"
      title="Terms of Use."
      lastUpdated="January 2025"
      relatedLinks={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
      ]}
      sections={[
        {
          id: "definitions",
          title: "1. Definitions",
          content: (
            <>
              <p>For the purposes of these Terms of Use, the following definitions apply:</p>
              <ul>
                <li><strong>"Energica"</strong> means ENERGICA PTE. LTD., with registered office at 10 Anson Road, #33-10C International Plaza, Singapore 079903.</li>
                <li><strong>"Site"</strong> means the website www.energicamotor.com and all associated pages, owned and managed by Energica.</li>
                <li><strong>"User"</strong> or <strong>"You"</strong> means any visitor or user of the Site, regardless of the device used to access it.</li>
                <li><strong>"Content"</strong> means all information, data, text, images, photographs, videos, graphics, software, and other material available on the Site.</li>
              </ul>
              <p>Certain sections of the Site are operated directly by Energica; others may be operated or supplied by third parties, who will be expressly identified where applicable.</p>
            </>
          ),
        },
        {
          id: "acceptance",
          title: "2. Acceptance of Terms",
          content: (
            <>
              <p>These Terms of Use govern your access to and use of the Site and describe the rights and responsibilities of all Users. By accessing any part of the Site, you agree to be legally bound by these Terms and to abide by them in full.</p>
              <div className="notice"><p>IF YOU DO NOT AGREE WITH ANY PART OF THESE TERMS, YOU ARE NOT PERMITTED TO ACCESS OR USE THE SITE.</p></div>
              <p>Energica reserves the right to modify these Terms at any time by posting the updated version on the Site. Your continued use of the Site following any such modification constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically.</p>
            </>
          ),
        },
        {
          id: "copyright",
          title: "3. Copyright Notice",
          content: (
            <>
              <p>All Content on this Site — including but not limited to text, photographs, graphics, video, audio, software, icons, design, layout, and source code — is the property of ENERGICA PTE. LTD. or its licensors and is protected by applicable copyright, intellectual property and other laws.</p>
              <p>Any reproduction, duplication, downloading, storage, publication, transmission, or distribution of any Content, in whole or in part, by any means or in any form — including electronic, mechanical, or otherwise — is strictly prohibited without the prior express written consent of Energica, except where permitted by applicable law.</p>
              <p>Limited personal, non-commercial use of the Content may be permitted where expressly stated. Any permitted use must retain all copyright and other proprietary notices in their original form.</p>
            </>
          ),
        },
        {
          id: "trademarks",
          title: "4. Trademark Notice",
          content: (
            <>
              <p>"Energica", "Energica Motor Company", "EGO", "EsseEsse9", "Eva Ribelle", "Experia", and the Energica logo are registered or unregistered trademarks of ENERGICA PTE. LTD.</p>
              <p>Trademarks, trade names, and logos of third parties displayed on the Site are the exclusive property of their respective owners. Nothing on this Site should be construed as granting any licence or right to use any trademark displayed on the Site without the prior written consent of Energica or the relevant third-party owner.</p>
              <p>Unauthorised use, reproduction, or imitation of any Energica trademark in any form is strictly prohibited and may give rise to legal action.</p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "5. Acceptable Use",
          content: (
            <>
              <p>You may use this Site only for lawful purposes and in accordance with these Terms. You agree not to use the Site:</p>
              <ul>
                <li>In any way that violates any applicable local, national, or international law or regulation.</li>
                <li>To transmit any unsolicited or unauthorised advertising or promotional material.</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site, or that may harm Energica or other Users.</li>
                <li>To attempt to gain unauthorised access to any part of the Site, its server, or any database connected to the Site.</li>
                <li>To introduce viruses, trojans, worms, logic bombs, or other malicious or harmful material.</li>
                <li>To scrape, data-mine, or systematically extract data from the Site without prior written consent.</li>
              </ul>
              <p>Unless otherwise expressly stated by Energica, all Content on the Site is intended for personal, non-commercial use only. You represent that you are at least 18 years of age or the legal age of majority in your jurisdiction and have the legal capacity to enter into binding obligations.</p>
            </>
          ),
        },
        {
          id: "warranties",
          title: "6. Disclaimer of Warranties",
          content: (
            <>
              <p>Except for any express written warranties made by Energica or its authorised manufacturers, the Site and all Content and services available through it are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis, without warranties of any kind, either express or implied.</p>
              <p>Without limiting the foregoing, Energica makes no warranty that:</p>
              <ul>
                <li>The Site will be uninterrupted, timely, secure, or error-free.</li>
                <li>The results obtained from use of the Site will be accurate or reliable.</li>
                <li>The quality of any product, information, or service obtained through the Site will meet your expectations.</li>
                <li>Any errors in the Site or its Content will be corrected.</li>
              </ul>
              <p>Your use of the Site is at your sole risk. Technical data, illustrations, advice, and information available through this Site have indicative value only and are not binding upon Energica. Energica will not be liable for any errors in copy or translation.</p>
            </>
          ),
        },
        {
          id: "products",
          title: "7. Products & Availability",
          content: (
            <>
              <p>The Site may be accessed by users worldwide and may contain references to products, specifications, and services that are not available or are subject to restrictions in your country. The presence of such references does not imply that Energica intends to make those products or services available in your jurisdiction.</p>
              <p>Not all colours, versions, or configurations are available in all countries. Product specifications, pricing, and availability may vary by region and are subject to change without notice. Energica reserves the right to modify, discontinue, or update any product or specification at its sole discretion and without prior notice.</p>
              <p>Products represented on this Site may not be definitive production versions and may be subject to change. For definitive specifications, refer to your local authorised Energica dealer.</p>
              <div className="notice"><p>Many countries prohibit the importation, registration, or use of vehicles not built to local specifications. For details, contact your nearest authorised Energica dealer.</p></div>
            </>
          ),
        },
        {
          id: "liability",
          title: "8. Limitation of Liability",
          content: (
            <>
              <p>To the fullest extent permitted by applicable law, Energica and its directors, officers, employees, agents, and suppliers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages — including without limitation loss of profit, revenue, data, goodwill, or other intangible losses — arising out of or in connection with:</p>
              <ul>
                <li>Your access to or use of (or inability to access or use) the Site.</li>
                <li>Any Content obtained from the Site.</li>
                <li>Unauthorised access to or alteration of your transmissions or data.</li>
                <li>Statements or conduct of any third party on the Site.</li>
              </ul>
              <p>In no event shall Energica be liable for damage, loss, or non-performance caused by services or sections of the Site not directly operated by Energica. If, notwithstanding the foregoing, Energica is found liable for any loss or damage, Energica's total liability shall in no event exceed any fee paid by you (if any) for use of the Site.</p>
              <p>All photographs on this Site depicting riding activity show professional riders in controlled environments. Do not attempt any manoeuvre that could endanger yourself or others.</p>
            </>
          ),
        },
        {
          id: "third-party-links",
          title: "9. Third-Party Links",
          content: (
            <>
              <p>The Site may contain links to third-party websites and services. These links are provided for your convenience only. Energica has no control over the content or availability of linked sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them. The inclusion of any link does not imply endorsement by Energica of the linked site or its operator.</p>
              <p>Linking to the homepage of this Site is permitted upon written request to Energica. Deep linking, framing, or any technique that obscures content authorship or the Energica brand is expressly prohibited. Energica reserves the right to withdraw linking permission at any time.</p>
            </>
          ),
        },
        {
          id: "privacy",
          title: "10. Privacy & Cookies",
          content: (
            <>
              <p>Energica is committed to protecting your privacy and the security of your personal data. All personal information submitted through this Site is processed in accordance with our <a href="/privacy">Privacy Policy</a>, which forms part of these Terms of Use, and in compliance with the EU General Data Protection Regulation (GDPR) and applicable Italian law.</p>
              <p>The Site uses cookies and similar tracking technologies. For full details on how we use cookies and how to manage your preferences, please refer to our <a href="/cookies">Cookie Policy</a>.</p>
            </>
          ),
        },
        {
          id: "third-party-content",
          title: "11. Third-Party Content",
          content: (
            <>
              <p>Certain sections, articles, and material on the Site may be managed or supplied by third parties, who are expressly identified where applicable. Energica accepts no responsibility for the accuracy, completeness, legality, or any other aspect of third-party content. All responsibility for such content rests exclusively with the respective third party.</p>
              <p>Any claims regarding third-party content on this Site must be directed exclusively to the relevant author or content provider.</p>
            </>
          ),
        },
        {
          id: "termination",
          title: "12. Termination",
          content: (
            <>
              <p>Energica reserves the right, at its sole discretion and without notice, to terminate or suspend your access to all or any part of the Site for any reason, including without limitation breach of these Terms of Use.</p>
            </>
          ),
        },
        {
          id: "governing-law",
          title: "13. Governing Law & Jurisdiction",
          content: (
            <>
              <p>These Terms of Use are governed by and shall be construed in accordance with the laws of Italy, without regard to conflict of law principles. Any dispute arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the Court of Modena, Italy.</p>
              <p>These Terms are drafted in English. In the event of any discrepancy between language versions, the Italian text shall prevail.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "14. Contact",
          content: (
            <>
              <p>For any requests, notices, or complaints relating to these Terms of Use, please contact:</p>
              <p>
                ENERGICA PTE. LTD.<br />
                10 Anson Road, #33-10C International Plaza, Singapore 079903<br />
                <a href="mailto:legal@energicamotor.com">legal@energicamotor.com</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
