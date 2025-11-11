import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required." });
    }

    // Placeholder for AI code cleaning logic
    const cleanedCode = `// Cleaned code placeholder\n${code}`;

    return res.status(200).json({ cleanedCode });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
