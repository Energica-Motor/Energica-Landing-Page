import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Energica Motor Company",
  description: "How Energica Motor Company collects, uses, and protects your personal data — in accordance with the EU GDPR.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      category="Legal"
      title="Privacy Policy."
      lastUpdated="January 2025"
      relatedLinks={[
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Terms of Use", href: "/terms" },
      ]}
      sections={[
        {
          id: "introduction",
          title: "1. Introduction",
          content: (
            <>
              <p>ENERGICA PTE. LTD. ("Energica", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information about you when you visit our website at www.energicamotor.com (the "Site"), contact us, request a test ride, or otherwise interact with us.</p>
              <p>ENERGICA PTE. LTD., with registered office at 10 Anson Road, #33-10C International Plaza, Singapore 079903, is the <strong>Data Controller</strong> for the purposes of the EU General Data Protection Regulation (GDPR) No. 2016/679 and applicable Italian data protection law.</p>
              <p>This Policy should be read alongside our <a href="/cookies">Cookie Policy</a> and our <a href="/terms">Terms of Use</a>.</p>
            </>
          ),
        },
        {
          id: "data-collected",
          title: "2. Data We Collect",
          content: (
            <>
              <h3>2.1 Website Usage Data</h3>
              <p>When you visit our Site, we automatically collect technical information sent by your device, including your IP address, browser type and version, operating system, geographical region, pages visited, time and date of visit, referral sources, and navigation paths. This data is used in aggregate to analyse how users interact with our Site and to improve our services.</p>

              <h3>2.2 Forms & Enquiries</h3>
              <p>When you complete a contact form, request a test ride or dealer appointment, or subscribe to our newsletter, we collect the personal data you provide. This may include your first name, last name, email address, phone number, country, city, the Energica model you are interested in, and the content of your message.</p>

              <h3>2.3 Motorcycle Ownership</h3>
              <p>When you purchase an Energica motorcycle through an authorised dealer, the dealer may share your contact details with us to register your warranty, send you relevant service updates, and inform you of product news pertaining to your model. Ownership history is retained to support ongoing service obligations.</p>

              <h3>2.4 Employment Applications</h3>
              <p>If you apply for a position at Energica, we collect the personal data included in your application, including your CV, contact details, and any other information you provide. This data is used solely for recruitment purposes.</p>

              <h3>2.5 Cookies & Tracking Technologies</h3>
              <p>We use cookies and similar technologies to enhance your experience on our Site. For full details, please refer to our <a href="/cookies">Cookie Policy</a>.</p>
            </>
          ),
        },
        {
          id: "how-we-use",
          title: "3. How We Use Your Data",
          content: (
            <>
              <p>We use your personal data for the following purposes:</p>
              <ul>
                <li>To respond to your enquiries and provide requested information about our motorcycles, dealers, and services.</li>
                <li>To process test ride requests and connect you with an authorised Energica dealer in your area.</li>
                <li>To register your motorcycle warranty and send you relevant safety, service, and recall notifications.</li>
                <li>To send you our newsletter and marketing communications, where you have given your consent.</li>
                <li>To improve our Site, products, and services by analysing usage data in aggregate.</li>
                <li>To comply with our legal and regulatory obligations.</li>
                <li>To process employment applications.</li>
              </ul>
              <p>We will not use your personal data for purposes incompatible with those described above without your prior consent.</p>
            </>
          ),
        },
        {
          id: "legal-grounds",
          title: "4. Legal Grounds for Processing",
          content: (
            <>
              <p>We process your personal data on the following legal grounds under the GDPR:</p>
              <ul>
                <li><strong>Consent</strong> — for marketing communications, newsletters, and profiling activities. You may withdraw consent at any time without affecting the lawfulness of processing carried out before withdrawal.</li>
                <li><strong>Contractual necessity</strong> — to perform a contract with you or take pre-contractual steps at your request, such as processing a test ride enquiry or warranty registration.</li>
                <li><strong>Legitimate interests</strong> — to improve our products and services, maintain Site security, and communicate with you about products similar to those you have already purchased (within the limits of applicable law).</li>
                <li><strong>Legal obligation</strong> — to comply with applicable legal and regulatory requirements, including tax and accounting obligations.</li>
              </ul>
            </>
          ),
        },
        {
          id: "retention",
          title: "5. Data Retention",
          content: (
            <>
              <p>We retain your personal data only for as long as is necessary to fulfil the purposes for which it was collected, or as required by law:</p>
              <ul>
                <li><strong>Website log data</strong> is retained for up to 6 months.</li>
                <li><strong>Contact and enquiry data</strong> is retained for up to 3 years from your last interaction with us.</li>
                <li><strong>Warranty and ownership data</strong> is retained for the duration of the warranty period and up to 10 years thereafter in accordance with applicable legal obligations.</li>
                <li><strong>Marketing data</strong> is retained until you withdraw consent or request deletion.</li>
                <li><strong>Recruitment data</strong> is retained for 12 months following the conclusion of a recruitment process unless you are offered and accept employment.</li>
              </ul>
              <p>When your data is no longer required, it will be securely deleted or anonymised.</p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "6. Sharing Your Data",
          content: (
            <>
              <p>We do not sell your personal data. We may share your data in the following circumstances:</p>
              <ul>
                <li><strong>Authorised dealers and distributors</strong> — to facilitate test ride bookings, warranty registration, and after-sales service in your region.</li>
                <li><strong>Service providers</strong> — third-party companies acting as data processors on our behalf (e.g. email platforms, analytics providers, CRM systems). These parties are contractually bound to process your data only in accordance with our instructions.</li>
                <li><strong>Legal authorities</strong> — when disclosure is required by applicable law, regulation, or court order.</li>
                <li><strong>Business transfers</strong> — in the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.</li>
              </ul>
              <p>Data processors we engage include, but are not limited to: Salesforce (CRM), Google Analytics (website analytics), HubSpot (marketing automation), and Mailchimp (email communications). All processors are bound by data processing agreements compliant with GDPR.</p>
            </>
          ),
        },
        {
          id: "international-transfers",
          title: "7. International Transfers",
          content: (
            <>
              <p>Some of our service providers or partners may be located outside the European Economic Area (EEA). Where we transfer personal data to countries that do not provide an equivalent level of data protection to that required under EU law, we take appropriate safeguards — including the use of Standard Contractual Clauses approved by the European Commission — to ensure your data remains protected.</p>
              <p>You may request further information about such transfers by contacting our Data Protection Officer at the address below.</p>
            </>
          ),
        },
        {
          id: "your-rights",
          title: "8. Your Rights",
          content: (
            <>
              <p>Under the GDPR, you have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Right of access</strong> — to obtain a copy of the personal data we hold about you.</li>
                <li><strong>Right to rectification</strong> — to request correction of inaccurate or incomplete data.</li>
                <li><strong>Right to erasure ("right to be forgotten")</strong> — to request deletion of your data where there is no legitimate reason for us to continue processing it.</li>
                <li><strong>Right to restrict processing</strong> — to request that we limit how we use your data in certain circumstances.</li>
                <li><strong>Right to data portability</strong> — to receive your data in a structured, commonly used format.</li>
                <li><strong>Right to object</strong> — to object to processing based on legitimate interests or for direct marketing purposes.</li>
                <li><strong>Right to withdraw consent</strong> — where processing is based on consent, you may withdraw it at any time without affecting prior lawful processing.</li>
              </ul>
              <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@energicamotor.com">privacy@energicamotor.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with the Italian Data Protection Authority (<em>Garante per la protezione dei dati personali</em>) at <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>.</p>
            </>
          ),
        },
        {
          id: "security",
          title: "9. Security",
          content: (
            <>
              <p>Energica takes appropriate technical and organisational measures to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access. These measures include encryption, access controls, and regular security assessments.</p>
              <p>While we strive to protect your data, no transmission over the internet is entirely secure. You transmit data to us at your own risk. Once we receive your data, we apply strict procedures to prevent unauthorised access.</p>
            </>
          ),
        },
        {
          id: "children",
          title: "10. Children's Privacy",
          content: (
            <>
              <p>This Site is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe that a child has provided us with personal data, please contact us immediately at <a href="mailto:privacy@energicamotor.com">privacy@energicamotor.com</a> and we will take steps to delete such data.</p>
            </>
          ),
        },
        {
          id: "changes",
          title: "11. Changes to this Policy",
          content: (
            <>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The "Last updated" date at the top of this page indicates when the Policy was most recently revised. We encourage you to review this Policy periodically. Continued use of the Site following any changes constitutes your acceptance of the updated Policy.</p>
            </>
          ),
        },
        {
          id: "contact-dpo",
          title: "12. Contact & Data Protection Officer",
          content: (
            <>
              <p>For any questions, requests, or concerns about this Privacy Policy or the processing of your personal data, please contact us:</p>
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
