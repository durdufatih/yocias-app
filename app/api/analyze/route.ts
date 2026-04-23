import { NextRequest, NextResponse } from "next/server";

const PROMPT = `This is a body composition report from a device like Tanita SC 330 or InBody. The report may be in Turkish or English. Extract ALL measurements listed below.

Turkish field name → JSON key mapping:
- Kilo / Weight → "weight" (kg)
- Boy / Height → "height" (cm)
- Yaş / Age → "age"
- Cinsiyet / Gender → "gender"
- Vücut Tipi / Body Type → "body_type"
- WHR / Bel Kalça Oranı / Waist-Hip Ratio → "whr"
- Yağ kg / Yağ Ağırlığı / Fat Mass → "fat_kg" (kg)
- Yağ % / Yağ Oranı / Body Fat % → "fat_pct" (percentage 0–100, NOT kg)
- Yağ Dışı Ağırlık / Yağsız Kütle / Fat-Free Mass → "fat_free_kg" (kg)
- Sıvı kg / Sıvı Ağırlığı / Total Body Water → "fluid_kg" (kg)
- Sıvı Oranı / Sıvı % / Fluid % → "fluid_pct" (percentage)
- Yağımsız Kas Dokusu / Lean Body Mass → "lean_mass_kg" (kg)
- İskeletsel Kaslar / Skeletal Muscle Mass → "skeletal_muscle_kg" (kg)
- Kemik Mineralleri Ağırlığı / Bone Mass → "bone_mass_kg" (kg)
- Hücre Kütlesi / Body Cell Mass → "cell_mass_kg" (kg)
- Hücre İçi Sıvı / Intracellular Water → "intracellular_fluid_kg" (kg)
- Hücre Dışı Sıvı / Extracellular Water → "extracellular_fluid_kg" (kg)
- Protein Miktarı / Protein Mass → "protein_kg" (kg value only)
- Protein % → "protein_pct" (percentage)
- BMI / Vücut Kütle İndeksi → "bmi"
- BMR / Bazal Metabolizma Hızı (kcal) → "bmr_kcal"
- BMR (kJ) → "bmr_kj"
- Metabolizma Yaşı / Metabolic Age → "metabolic_age"
- BMR/Kilo → "bmr_per_kg"
- İdeal Kilo / Ideal Weight → "ideal_weight_kg" (kg)
- Obezite Derecesi / Obesity Degree → "obesity_degree_pct" (%)
- İç Yağlanma / Visceral Fat Level → "visceral_fat_level"
- Beden Yoğunluğu / Body Density → "body_density"
- Report date → "date" (YYYY-MM-DD)
- Patient name → "patient_name"
- Device brand/model → "device"

Return ONLY valid JSON with exactly these keys. Use null for any field not found. No markdown, no explanation:

{
  "weight": null, "height": null, "age": null, "gender": null, "body_type": null,
  "whr": null,
  "fat_kg": null, "fat_pct": null, "fat_free_kg": null,
  "fluid_kg": null, "fluid_pct": null,
  "lean_mass_kg": null, "skeletal_muscle_kg": null, "bone_mass_kg": null,
  "cell_mass_kg": null, "intracellular_fluid_kg": null, "extracellular_fluid_kg": null,
  "protein_kg": null, "protein_pct": null,
  "bmi": null, "bmr_kcal": null, "bmr_kj": null, "metabolic_age": null, "bmr_per_kg": null,
  "ideal_weight_kg": null, "obesity_degree_pct": null, "visceral_fat_level": null, "body_density": null,
  "date": null, "patient_name": null, "device": null
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type || "image/jpeg";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://yocias.com",
        "X-Title": "Yocias",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}` } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return NextResponse.json({ error: data?.error?.message ?? "Analysis failed" }, { status: 500 });
    }

    const text: string = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Could not parse data from document" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
