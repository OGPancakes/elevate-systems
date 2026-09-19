import { gabrielProfile } from "@/lib/gabriel-profile";

function escapeVCardValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function GET() {
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Thomas;Gabriel;;;",
    `FN:${escapeVCardValue(gabrielProfile.name)}`,
    `ORG:${escapeVCardValue(gabrielProfile.company)}`,
    `TITLE:${escapeVCardValue(gabrielProfile.role)}`,
    `TEL;TYPE=CELL,VOICE:${gabrielProfile.phoneHref}`,
    `EMAIL;TYPE=WORK:${gabrielProfile.contactEmail}`,
    `URL:${gabrielProfile.website}`,
    "END:VCARD"
  ].join("\r\n");

  return new Response(card, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": 'attachment; filename="Gabriel-Thomas.vcf"',
      "Content-Type": "text/vcard; charset=utf-8"
    }
  });
}
