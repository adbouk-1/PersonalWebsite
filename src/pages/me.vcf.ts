import type { APIRoute } from "astro";
import me from "../data/me.json";

export const GET: APIRoute = async () => {
  const vcf = `BEGIN:VCARD\nVERSION:3.0\nN:${me.last};${me.first};;;\nFN:${me.name}\nEMAIL;type=INTERNET;type=HOME;type=pref:${me.email}\nURL:${me.url}\nEND:VCARD`;
  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename=me.vcf`,
    },
  });
};
