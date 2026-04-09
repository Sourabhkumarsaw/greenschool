import { getStore } from "@netlify/blobs";

const CONTACT_PATTERN = /^[0-9+\-\s]{8,15}$/;

function validatePayload(payload) {
  const studentName = String(payload.studentName || "").trim();
  const grade = String(payload.grade || "").trim();
  const parentName = String(payload.parentName || "").trim();
  const contactNumber = String(payload.contactNumber || "").trim();
  const message = String(payload.message || "").trim();

  if (!studentName) throw new Error("Student name is required.");
  if (!grade) throw new Error("Grade is required.");
  if (!parentName) throw new Error("Parent or guardian name is required.");
  if (!CONTACT_PATTERN.test(contactNumber))
    throw new Error(
      "Contact number must be 8 to 15 characters and use digits, spaces, +, or -."
    );
  if (message.length > 180)
    throw new Error("Additional information must stay within 180 characters.");

  return { studentName, grade, parentName, contactNumber, message };
}

export default async (req) => {
  const store = getStore({ name: "admissions", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const records = [];

    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data) {
        records.push(data);
      }
    }

    records.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
    const limited = records.slice(0, 50);

    return Response.json({ records: limited });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    let cleaned;
    try {
      cleaned = validatePayload(body);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const record = {
      id,
      studentName: cleaned.studentName,
      grade: cleaned.grade,
      parentName: cleaned.parentName,
      contactNumber: cleaned.contactNumber,
      message: cleaned.message,
      submittedAt: new Date().toISOString(),
    };

    await store.setJSON(id, record);

    return Response.json(
      { message: "Admission inquiry saved successfully.", id },
      { status: 201 }
    );
  }

  return Response.json({ error: "Method not allowed." }, { status: 405 });
};

export const config = {
  path: "/api/admissions",
};
