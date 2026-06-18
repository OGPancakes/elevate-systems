const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const realtimeReceptionistXml = () => {
  const projectId = process.env.OPENAI_PROJECT_ID;
  if (!projectId) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hi, this is the Elevate Receptionist preview. The live AI voice is almost connected, but OpenAI realtime is not configured yet.</Say>
</Response>`;
  }
  const sipUri = `sip:${projectId}@sip.api.openai.com;transport=tls`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial answerOnBridge="true" timeout="20">
    <Sip>
      <Parameter name="X-Elevate-Product" value="receptionist" />
      ${xmlEscape(sipUri)}
    </Sip>
  </Dial>
</Response>`;
};

export async function POST() {
  return new Response(realtimeReceptionistXml(), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function GET() {
  return new Response(realtimeReceptionistXml(), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
